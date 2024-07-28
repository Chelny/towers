import { PasswordResetToken } from "@prisma/client"
import { prisma } from "@/lib"

export const getPasswordResetTokenByToken = async (token: string): Promise<PasswordResetToken | null> => {
  return await prisma.passwordResetToken.findUnique({ where: { token } })
}
