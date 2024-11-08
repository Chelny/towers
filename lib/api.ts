import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export const getPrismaError = (error: unknown): NextResponse => {
  let message: string = "An unexpected error occurred. Please try again later."
  let status: number = 500

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Database schema errors (e.g., constraint violations, unique errors)
    message = `Prisma error: ${error.message}`
    status = 409
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Validation errors (invalid input)
    message = `Validation error: ${error.message}`
    status = 400
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    message = "A severe internal error occurred with Prisma."
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma failed to initialize. Please check your configuration."
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "An unknown Prisma error occurred."
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
      error: "Please provide a room ID to proceed.",
    },
    { status: 400 },
  )
}

export const missingTableIdResponse = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: "Please provide a table ID to proceed.",
    },
    { status: 400 },
  )
}

export const unauthorized = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      message: "You are not authorized to perform this action. Please sign in and try again.",
    },
    { status: 401 },
  )
}
