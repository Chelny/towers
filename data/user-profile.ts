import { TowersUserProfile } from "@prisma/client"
import prisma from "@/lib/prisma"

/**
 * Get Towers profile associated to user
 * @param userId
 */
export const getTowersUserProfileByUserId = async (userId: string): Promise<TowersUserProfile | null> => {
  return await prisma.towersUserProfile.findUnique({ where: { userId } })
}

/**
 * Get Towers profile ID associated to user
 * @param userId
 */
export const getTowersUserProfileIdByUserId = async (userId: string): Promise<string | undefined> => {
  const result: { id: string } | null = await prisma.towersUserProfile.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  })

  return result?.id
}
