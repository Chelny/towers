import { VerificationToken } from "@prisma/client"
import prisma from "@/lib/prisma"

export const getVerificationTokenByIdTokenEmail = async (token: string): Promise<VerificationToken | null> => {
  const decodedToken: string = Buffer.from(token, "base64").toString("utf-8")
  const [userId, email] = decodedToken.split("|")

  return await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: userId,
        token
      },
      email
    }
  })
}

export const getVerificationTokenByEmail = async (email: string): Promise<VerificationToken | null> => {
  return await prisma.verificationToken.findFirst({ where: { email } })
}
