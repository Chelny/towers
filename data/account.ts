import { Account } from "@prisma/client"
import prisma from "@/lib/prisma"

export const getAccountsByUserId = async (userId: string): Promise<Account[]> => {
  return await prisma.account.findMany({ where: { userId } })
}
