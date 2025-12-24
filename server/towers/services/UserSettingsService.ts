import { UserSettings } from "db/client";
import prisma from "@/lib/prisma";

export class UserSettingsService {
  public static async getUserSettingsById(id: string): Promise<UserSettings | null> {
    return await prisma.userSettings.findUnique({ where: { id } });
  }
}
