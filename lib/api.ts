import { NextResponse } from "next/server"
import { t } from "@lingui/core/macro"
import { Prisma } from "db"

export const getPrismaError = (error: unknown): NextResponse => {
  let message: string = t({ message: "An unexpected error occurred. Please try again later." })
  let status: number = 500

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Database schema errors (e.g., constraint violations, unique errors)
    const errorMessage: string = error.message
    message = t({ message: `Prisma error: ${errorMessage}` })
    status = 409
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Validation errors (invalid input)
    const errorMessage: string = error.message
    message = t({ message: `Validation error: ${errorMessage}` })
    status = 400
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    message = t({ message: "A severe internal error occurred with Prisma." })
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = t({ message: "Prisma failed to initialize. Please check your configuration." })
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = t({ message: "An unknown Prisma error occurred." })
  }

  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  )
}

export const missingRoomIdResponse = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      message: t({ message: "Please provide a room ID to proceed." }),
    },
    { status: 400 },
  )
}

export const missingTableIdResponse = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      message: t({ message: "Please provide a table ID to proceed." }),
    },
    { status: 400 },
  )
}

export const unauthorized = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      message: t({ message: "You are not authorized to perform this action. Please sign in and try again." }),
    },
    { status: 401 },
  )
}
