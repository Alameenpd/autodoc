import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      // scope: "read:user user:email repo",
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      // Attach the accessToken to the session
      session.accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, account }: any) {
      // Persist the access token to the token object
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
