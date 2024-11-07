import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import axios from "axios"

export interface AxiosErrorInfo {
  message: string
  status?: number
  data?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  request?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const getAxiosError = (error: unknown): AxiosErrorInfo => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(`[Axios Error] Server responded with status ${error.response.status}:`, error.response.data)
      return {
        message: `Server Error: ${error.response.status}`,
        status: error.response.status,
        data: error.response.data
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("[Axios Error] No response received from server:", error.request)
      return {
        message: "No response from the server",
        request: error.request
      }
    } else {
      // Error in setting up the request
      console.error("[Axios Error] Request setup failed:", error.message)
      return {
        message: error.message
      }
    }
  } else {
    // Handle non-Axios errors
    console.error("[Non-Axios Error] An unexpected error occurred:", error)
    return {
      message: "An unexpected error occurred"
    }
  }
}

export const getPrismaError = (error: unknown): NextResponse => {
  let message = "An unexpected error occurred. Please try again later."
  let status = 500

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
      message
    },
    { status }
  )
}

export const badRequestMissingRoomId = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: "Please provide a room ID to proceed."
    },
    { status: 400 }
  )
}

export const badRequestMissingTableId = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: "Please provide a table ID to proceed."
    },
    { status: 400 }
  )
}

export const unauthorized = (): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      message: "Sorry, your request could not be processed."
    },
    { status: 401 }
  )
}
