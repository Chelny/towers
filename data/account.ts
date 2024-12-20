import { Account } from "@prisma/client"
import prisma from "@/lib/prisma"

/**
 * Get accounts associated to user
 * @param userId
 */
export const getAccountsByUserId = async (userId: string): Promise<Account[]> => {
  return await prisma.account.findMany({ where: { userId } })
}
