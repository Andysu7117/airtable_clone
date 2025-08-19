import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Base name is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.create({
        data: {
          name: input.name.trim(),
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
});
