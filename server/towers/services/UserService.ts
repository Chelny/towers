import { User } from "db/client";
import prisma from "@/lib/prisma";

export class UserService {
  public static async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }
}
