import { User } from "db";
import prisma from "@/lib/prisma";

export const getUserById = async (id: string | undefined): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { username } });
};
