import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;
        const user = (await db.user.findUnique({
          where: { email: credentials.email as string },
        })) as unknown as {
          id: string;
          email: string | null;
          name: string | null;
          image?: string | null;
          passwordHash?: string | null;
          authProvider?: string | null;
        } | null;
        if (!user) return null;
        if ((user as any).authProvider === "GOOGLE") return null;
        if (!(user as any).passwordHash) return null;
        const { compare } = await import("bcryptjs").then((m) => ({ compare: (m as any).default?.compare ?? (m as any).compare }));
        const ok = await compare(
          credentials.password as string,
          (user as any).passwordHash as string,
        );
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined, image: (user as any).image ?? undefined } as any;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    async signIn({ account, user, profile }) {
      // Enforce separation: if an email exists with LOCAL, block Google sign in; and vice versa
      if (!user?.email) return false;
      const existing = await db.user.findUnique({ where: { email: user.email } });
      if (!existing) return true; // allow - will be linked below by Prisma adapter

      // Cast to access custom field before prisma types are regenerated
      const provider = (existing as unknown as { authProvider?: string }).authProvider;
      if (account?.provider === "google") {
        // if user previously created with LOCAL, disallow Google sign-in (must use Google signup)
        if (provider && provider !== "GOOGLE") return false;
      }
      // For any OAuth sign-in, allow if provider matches or is null (legacy user)
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // persist user id on token for session mapping
        (token as any).id = (user as any).id;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        // try both JWT 'sub' and custom 'id'
        id: ((token as any).id ?? token.sub) as string,
      },
    }),
  },
  events: {
    async createUser({ user }) {
      // Default provider to GOOGLE when OAuth creates the user without a provider
      await db.user
        .update({
          where: { id: user.id },
          // Cast data because generated types may not include the custom field yet
          data: { authProvider: "GOOGLE" } as unknown as Record<string, unknown>,
        })
        .catch(() => undefined);
    },
  },
} satisfies NextAuthConfig;
