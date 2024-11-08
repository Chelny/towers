import prisma from "@/lib/prisma"

/**
 * Update isOnline and lastActiveAt on POST, PUT, PATCH, DELETE requests
 * @param userId
 */
export const updateLastActiveAt = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId, isOnline: true },
    data: { lastActiveAt: new Date() },
  })
}
