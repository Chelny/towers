import { VerificationToken } from "@prisma/client"
import prisma from "@/lib/prisma"

export const getVerificationTokenByIdentifierToken = async (token: string): Promise<VerificationToken | null> => {
  const identifier: string = Buffer.from(token, "base64").toString("utf-8")

  return await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier,
        token
      }
    }
  })
}
