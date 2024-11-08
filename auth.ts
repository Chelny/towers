import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { Adapter } from "next-auth/adapters"
import { authConfig } from "@/auth.config"
import prisma from "@/lib/prisma"

export const adapter: Adapter = PrismaAdapter(prisma) as Adapter
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  ...authConfig,
})
