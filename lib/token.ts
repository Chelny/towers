import { PasswordResetToken, User, VerificationToken } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, getVerificationTokenByEmail } from "@/data"
import { prisma } from "@/lib"

export const generateVerificationToken = async (email: string): Promise<VerificationToken | null> => {
  const user: User | null = await getUserByEmail(email)

  if (!user) {
    return null
  }

  const generatedToken: string = uuidv4()
  const expires: Date = new Date(new Date().getTime() + 3600 * 1000) // 1 hour
  const token: VerificationToken | null = await getVerificationTokenByEmail(email)

  if (token) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token
        }
      }
    })
  }

  return await prisma.verificationToken.create({
    data: {
      identifier: user.id,
      email,
      token: generatedToken,
      expires
    }
  })
}

export const generatePasswordResetToken = async (email: string): Promise<PasswordResetToken> => {
  const generatedToken: string = uuidv4()
  const expires: Date = new Date(new Date().getTime() + 3600 * 1000) // 1 hour
  const token: VerificationToken | null = await getVerificationTokenByEmail(email)

  if (token) {
    await prisma.passwordResetToken.delete({ where: { id: token.identifier } })
  }

  return await prisma.passwordResetToken.create({
    data: {
      email,
      token: generatedToken,
      expires
    }
  })
}
