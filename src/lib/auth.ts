import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnabledProviders } from "@/lib/oauth-providers";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const enabled = getEnabledProviders();

const oauthProviders = [
  enabled.google ? Google({ allowDangerousEmailAccountLinking: true }) : null,
  enabled.facebook ? Facebook({ allowDangerousEmailAccountLinking: true }) : null,
  enabled.apple ? Apple({ allowDangerousEmailAccountLinking: true }) : null,
].filter((p): p is NonNullable<typeof p> => p !== null);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Имэйл", type: "email" },
        password: { label: "Нууц үг", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil(
            (user.lockedUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(`LOCKED:${minutesLeft}`);
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          const newAttempts = (user.loginAttempts ?? 0) + 1;
          const shouldLock = newAttempts >= 5;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
                : null,
            },
          });
          if (shouldLock) throw new Error("LOCKED:15");
          throw new Error(`ATTEMPTS:${newAttempts}`);
        }

        // Success — reset attempts
        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? undefined,
        };
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
});
