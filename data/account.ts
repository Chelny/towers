import { Account } from "@prisma/client"
import prisma from "@/lib"

export const getAccountsByUserId = async (userId: string): Promise<Account[]> => {
  return await prisma.account.findMany({ where: { userId } })
}
