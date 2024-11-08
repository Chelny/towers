import { PasswordResetToken, User, VerificationToken } from "@prisma/client"
import { getUserById } from "@/data/user"
import { getVerificationTokenByIdentifierToken } from "@/data/verification-token"
import prisma from "@/lib/prisma"

export const generateEmailVerificationToken = async (userId: string): Promise<VerificationToken | null> => {
  const user: User | null = await getUserById(userId)

  if (!user) {
    return null
  }

  const generatedToken: string = Buffer.from(userId).toString("base64")
  const expires: Date = new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour
  const token: VerificationToken | null = await getVerificationTokenByIdentifierToken(generatedToken)

  if (token) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    })
  }

  return await prisma.verificationToken.create({
    data: {
      identifier: user.id,
      token: generatedToken,
      expires,
    },
  })
}

export const generatePasswordResetToken = async (email: string): Promise<PasswordResetToken> => {
  const generatedToken: string = Buffer.from(email).toString("base64")
  const expires: Date = new Date(new Date().getTime() + 3600 * 1000) // 1 hour
  const token: VerificationToken | null = await getVerificationTokenByIdentifierToken(generatedToken)

  if (token) {
    await prisma.passwordResetToken.delete({
      where: { id: token.identifier },
    })
  }

  return await prisma.passwordResetToken.create({
    data: {
      email,
      token: generatedToken,
      expires,
    },
  })
}

export const generateEmailChangeVerificationToken = async (userId: string): Promise<VerificationToken | null> => {
  const user: User | null = await getUserById(userId)

  if (!user) {
    return null
  }

  const generatedToken: string = Buffer.from(userId).toString("base64")
  const expires: Date = new Date(new Date().getTime() + 15 * 60 * 1000) // 15 minutes
  const token: VerificationToken | null = await getVerificationTokenByIdentifierToken(generatedToken)

  if (token) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    })
  }

  return await prisma.verificationToken.create({
    data: {
      identifier: user.id,
      token: generatedToken,
      expires,
    },
  })
}
