import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({ take: 50 });
    return users;
  }),

  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({ where: { id: input } });
    return user ?? null;
  }),
});


