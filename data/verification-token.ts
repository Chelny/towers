import { User, VerificationToken } from "@prisma/client"
import { getUserByEmail } from "@/data"
import prisma from "@/lib"

export const getVerificationTokenByToken = async (email: string, token: string): Promise<VerificationToken | null> => {
  const user: User | null = await getUserByEmail(email)

  if (!user) {
    return null
  }

  return await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: user.id,
        token
      }
    }
  })
}

export const getVerificationTokenByEmail = async (email: string): Promise<VerificationToken | null> => {
  return await prisma.verificationToken.findFirst({ where: { email } })
}
