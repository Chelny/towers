import { PasswordResetToken } from "@prisma/client"
import prisma from "@/lib/prisma"

export const getPasswordResetTokenByToken = async (token: string): Promise<PasswordResetToken | null> => {
  return await prisma.passwordResetToken.findUnique({ where: { token } })
}
