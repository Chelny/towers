import { Account } from "db/browser";
import prisma from "@/lib/prisma";

/**
 * Get accounts associated to user
 * @param userId
 */
export const getAccountsByUserId = async (userId: string): Promise<Account[]> => {
  return prisma.account.findMany({ where: { userId } });
};
