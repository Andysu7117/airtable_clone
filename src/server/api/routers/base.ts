import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { ColumnType } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  // Records virtualization: paginated fetch
  listRecords: protectedProcedure
    .input(z.object({ tableId: z.string(), cursor: z.string().nullish(), limit: z.number().min(1).max(1000).default(1000) }))
    .query(async ({ ctx, input }) => {
      const table = await ctx.db.table.findFirst({
        where: { id: input.tableId, base: { owner: { id: ctx.session.user.id } } },
        select: { id: true },
      });
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const records = await ctx.db.record.findMany({
        where: { tableId: input.tableId },
        orderBy: { id: "asc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        select: { id: true, data: true },
      });

      let nextCursor: string | null = null;
      if (records.length > input.limit) {
        const next = records.pop()!;
        nextCursor = next.id;
      }
      return { items: records, nextCursor };
    }),

  // Bulk insert many rows
  addManyRecords: protectedProcedure
    .input(z.object({ tableId: z.string(), count: z.number().min(1).max(100_000) }))
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findFirst({
        where: { id: input.tableId, base: { owner: { id: ctx.session.user.id } } },
        include: { columns: true },
      });
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const blank: Prisma.JsonObject = Object.fromEntries(table.columns.map((c) => [c.id, ""]));

      const BATCH = 1000; // safe batch size
      for (let offset = 0; offset < input.count; offset += BATCH) {
        const size = Math.min(BATCH, input.count - offset);
        await ctx.db.record.createMany({
          data: Array.from({ length: size }, () => ({ tableId: table.id, data: blank })),
        });
      }
      return { added: input.count };
    }),
  create: protectedProcedure
    .mutation(async ({ ctx }) => {
      const base = await ctx.db.base.create({
        data: {
          name: "Untitled Base",
          owner: { connect: { id: ctx.session.user.id } },
          tables: {
            create: {
              name: "Untitled Table",
              columns: {
                create: [
                  { name: "Name", type: "TEXT", order: 0 },
                  { name: "Notes", type: "TEXT", order: 1 },
                ],
              },
            },
          },
        },
        include: {
          tables: {
            include: {
              columns: true,
            },
          },
        },
      });
      return base;
    }),

  rename: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, "Base name is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if the base belongs to the current user
      const existingBase = await ctx.db.base.findFirst({
        where: {
          id: input.id,
          owner: { id: ctx.session.user.id },
        },
      });

      if (!existingBase) {
        throw new Error("Base not found or access denied");
      }

      const base = await ctx.db.base.update({
        where: { id: input.id },
        data: { name: input.name.trim() },
        include: {
          tables: {
            include: {
              columns: true,
            },
          },
        },
      });
      return base;
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.base.findFirst({
        where: {
          id: input,
          owner: { id: ctx.session.user.id },
        },
        include: {
          tables: {
            include: {
              columns: {
                orderBy: { order: "asc" },
              },
              // Seed initial page for UX; remaining rows are fetched via virtualization
              records: {
                orderBy: { id: "asc" },
                take: 200,
              },
            },
          },
        },
      });

      if (!base) {
        throw new Error("Base not found or access denied");
      }

      return base;
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const bases = await ctx.db.base.findMany({
        where: {
          owner: { id: ctx.session.user.id },
        },
        include: {
          tables: {
            include: {
              columns: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return bases;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Check if the base belongs to the current user
      const existingBase = await ctx.db.base.findFirst({
        where: {
          id: input,
          owner: { id: ctx.session.user.id },
        },
      });

      if (!existingBase) {
        throw new Error("Base not found or access denied");
      }

      // Delete the base (this will cascade delete tables, columns, and records)
      await ctx.db.base.delete({
        where: { id: input },
      });

      return { message: "Base deleted successfully" };
    }),

  // Tables
  createTable: protectedProcedure
    .input(z.object({ baseId: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.findFirst({
        where: { id: input.baseId, owner: { id: ctx.session.user.id } },
      });
      if (!base) throw new TRPCError({ code: "NOT_FOUND" });

      const table = await ctx.db.table.create({
        data: {
          name: (input.name ?? "Untitled Table").trim(),
          baseId: base.id,
          columns: {
            create: [
              { name: "Name", type: "TEXT", order: 0 },
              { name: "Notes", type: "TEXT", order: 1 },
            ],
          },
        },
        include: { columns: true },
      });

      const blankData: Prisma.JsonObject = Object.fromEntries(
        table.columns.map((c) => [c.id, ""]),
      );
      await ctx.db.record.createMany({
        data: [1, 2, 3].map(() => ({ tableId: table.id, data: blankData })),
      });

      return table;
    }),

  deleteTable: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findFirst({
        where: { id: input.tableId, base: { owner: { id: ctx.session.user.id } } },
        select: { id: true },
      });
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.table.delete({ where: { id: table.id } });
      return { message: "Table deleted" };
    }),

  renameTable: protectedProcedure
    .input(z.object({ tableId: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findFirst({
        where: { id: input.tableId, base: { owner: { id: ctx.session.user.id } } },
        select: { id: true },
      });
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const updated = await ctx.db.table.update({
        where: { id: input.tableId },
        data: { name: input.name.trim() },
      });
      return updated;
    }),

  // Columns
  createColumn: protectedProcedure
    .input(z.object({
      tableId: z.string(),
      name: z.string().min(1),
      type: z.nativeEnum(ColumnType).default(ColumnType.TEXT),
    }))
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.table.findFirst({
        where: { id: input.tableId, base: { owner: { id: ctx.session.user.id } } },
        include: { columns: { select: { order: true } } },
      });
      if (!found) throw new TRPCError({ code: "NOT_FOUND" });

      const maxOrder = found.columns.reduce((m, c) => Math.max(m, c.order), -1);
      const column = await ctx.db.column.create({
        data: {
          tableId: input.tableId,
          name: input.name.trim(),
          type: input.type,
          order: maxOrder + 1,
        },
      });

      const records = await ctx.db.record.findMany({
        where: { tableId: input.tableId },
        select: { id: true, data: true },
      });
      await Promise.all(
        records.map((r) =>
          ctx.db.record.update({
            where: { id: r.id },
            data: {
              data: {
                ...(r.data as Prisma.JsonObject),
                [column.id]: "",
              } as Prisma.JsonObject,
            },
          }),
        ),
      );

      return column;
    }),

  deleteColumn: protectedProcedure
    .input(z.object({ columnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const column = await ctx.db.column.findFirst({
        where: { id: input.columnId, table: { base: { owner: { id: ctx.session.user.id } } } },
        select: { id: true, tableId: true },
      });
      if (!column) throw new TRPCError({ code: "NOT_FOUND" });

      const records = await ctx.db.record.findMany({
        where: { tableId: column.tableId },
        select: { id: true, data: true },
      });
      await Promise.all(
        records.map((r) => {
          const data = { ...(r.data as Prisma.JsonObject) };
          delete (data as Record<string, unknown>)[input.columnId];
          return ctx.db.record.update({ where: { id: r.id }, data: { data } });
        }),
      );

      await ctx.db.column.delete({ where: { id: input.columnId } });
      return { message: "Column deleted" };
    }),

  renameColumn: protectedProcedure
    .input(z.object({ columnId: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const column = await ctx.db.column.findFirst({
        where: { id: input.columnId, table: { base: { owner: { id: ctx.session.user.id } } } },
        select: { id: true },
      });
      if (!column) throw new TRPCError({ code: "NOT_FOUND" });

      const updated = await ctx.db.column.update({
        where: { id: input.columnId },
        data: { name: input.name.trim() },
      });
      return updated;
    }),

  updateColumnType: protectedProcedure
    .input(z.object({ columnId: z.string(), type: z.nativeEnum(ColumnType) }))
    .mutation(async ({ ctx, input }) => {
      const column = await ctx.db.column.findFirst({
        where: { id: input.columnId, table: { base: { owner: { id: ctx.session.user.id } } } },
        select: { id: true },
      });
      if (!column) throw new TRPCError({ code: "NOT_FOUND" });

      // Update the column type
      const updated = await ctx.db.column.update({
        where: { id: input.columnId },
        data: { type: input.type },
      });

      // Clear all record data for this column that doesn't match the new type
      // We'll do this by updating all records and setting the field to null/empty
      const records = await ctx.db.record.findMany({
        where: {
          table: { base: { owner: { id: ctx.session.user.id } } },
        },
        select: {
          id: true,
          data: true,
        },
      });

      // Update each record to clear incompatible data
      for (const record of records) {
        const currentData = record.data as Record<string, any>;
        const fieldValue = currentData[input.columnId];
        
        let newValue: any;
        if (input.type === "NUMBER") {
          // For NUMBER type, only keep numeric values
          newValue = typeof fieldValue === "number" ? fieldValue : null;
        } else {
          // For TEXT type, convert everything to string
          newValue = fieldValue != null ? String(fieldValue) : "";
        }
        
        // Update the record with the new value
        await ctx.db.record.update({
          where: { id: record.id },
          data: {
            data: {
              ...currentData,
              [input.columnId]: newValue,
            },
          },
        });
      }

      return updated;
    }),

  // Records
  createRecord: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findFirst({
        where: { id: input.tableId, base: { owner: { id: ctx.session.user.id } } },
        include: { columns: true },
      });
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const data: Prisma.JsonObject = Object.fromEntries(
        table.columns.map((c) => [c.id, ""]),
      );

      const record = await ctx.db.record.create({
        data: { tableId: table.id, data },
      });
      return record;
    }),

  deleteRecord: protectedProcedure
    .input(z.object({ recordId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.record.findFirst({
        where: { id: input.recordId, table: { base: { owner: { id: ctx.session.user.id } } } },
        select: { id: true },
      });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.record.delete({ where: { id: input.recordId } });
      return { message: "Record deleted" };
    }),

  updateRecord: protectedProcedure
    .input(z.object({
      recordId: z.string(),
      values: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
    }))
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.record.findFirst({
        where: { id: input.recordId, table: { base: { owner: { id: ctx.session.user.id } } } },
        include: { table: { include: { columns: { select: { id: true } } } } },
      });
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });

      const allowed = new Set(record.table.columns.map((c) => c.id));
      const sanitizedEntries = Object.entries(input.values).filter(([k]) =>
        allowed.has(k),
      );
      const nextData: Prisma.JsonObject = {
        ...(record.data as Prisma.JsonObject),
        ...Object.fromEntries(sanitizedEntries),
      } as Prisma.JsonObject;

      const updated = await ctx.db.record.update({
        where: { id: record.id },
        data: { data: nextData },
      });
      return updated;
    }),
});
