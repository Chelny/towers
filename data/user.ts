import { User } from "db"
import prisma from "@/lib/prisma"

export const getUserById = async (id: string | undefined): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } })
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { email } })
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { username } })
}

/**
 * Update isOnline and lastActiveAt on POST, PUT, PATCH, DELETE requests
 * @param id
 */
export const setUserLastActiveAt = async (id: string): Promise<void> => {
  await prisma.user.update({
    where: { id },
    data: { isOnline: true, lastActiveAt: new Date() },
  })
}
