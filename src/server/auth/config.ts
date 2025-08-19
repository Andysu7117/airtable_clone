import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { db } from "~/server/db";

const safeAdapter: Adapter = PrismaAdapter(db) as Adapter;

interface UserWithAuthProvider {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  authProvider?: string | null;
  passwordHash?: string | null;
}

interface TokenWithId {
  id?: string;
  sub?: string;
}

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
  session: { strategy: "jwt" },
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
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        console.log("authorize input", credentials);
        console.log("authorize user", user?.id, user?.email);
        if (!user) return null;
        try {
          const userAuthProvider = (user as UserWithAuthProvider).authProvider;
          if (userAuthProvider === "GOOGLE") return null;
        } catch {
          // field absent in types; ignore
        }
        const passwordHash = (user as UserWithAuthProvider).passwordHash;
        if (!passwordHash) return null;
        const { default: bcryptDefault } = (await import("bcryptjs")) as { default?: { compare: (a: string, b: string) => Promise<boolean> } };
        const compare = (bcryptDefault?.compare ?? (await import("bcryptjs")).compare) as (a: string, b: string) => Promise<boolean>;
        const ok = await compare(credentials.password as string, passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined, image: (user as UserWithAuthProvider).image ?? undefined } as { id: string; email?: string | null; name?: string | null; image?: string | null };
      },
    }),
  ],
  adapter: safeAdapter,
  callbacks: {
    async signIn({ account, user }) {
      console.log("signIn", account?.provider, user?.email);
      // Prevent provider mixing using Accounts table, not a user flag
      if (!user?.email) return false;
      // If Google sign-in and a local row exists (heuristic via Account table), block
      if (account?.provider === "google") {
        const localAccount = await db.account.findFirst({
          where: { provider: "credentials", user: { email: user.email } },
        });
        if (localAccount) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      console.log("jwt in", { hasUser: !!user, tokenSub: token.sub, tokenId: (token as TokenWithId).id });
      if (user) {
        
        // persist user id on token for session mapping
        (token as TokenWithId).id = (user as { id: string }).id;
      }
      console.log("jwt out", token);
      return token;
    },
    session: ({ session, token, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: ((user as { id?: string })?.id ?? (token as TokenWithId)?.id ?? token.sub!),
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
          data: { authProvider: "GOOGLE" },
        })
        .catch(() => undefined);
    },
  },
} satisfies NextAuthConfig;
