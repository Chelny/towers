import { NextResponse } from "next/server";
import { i18n } from "@lingui/core";
import { Prisma } from "db";
import { prismaError } from "prisma-better-errors";
import { logger } from "@/lib/logger";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const handleApiError = (error: unknown): NextResponse<ApiResponse> => {
  let message = "An unexpected error occurred. Please try again later.";
  let status = 500;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const customError = new prismaError(error);
    status = customError.statusCode;

    switch (error.code) {
      case "P2025":
        message = "Resource not found.";
        break;
      case "P2002":
        message = "Duplicate entry detected.";
        break;
      default:
        message = "A database request error occurred.";
        break;
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "PrismaClientUnknownRequestError";
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    message = "Invalid input data.";
    status = 400;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = "Database initialization failed.";
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    message = "Internal database error.";
  } else if (error instanceof HttpError) {
    message = error.message;
    status = error.status;
  }

  if (process.env.NODE_ENV !== "production") {
    logger.error(error);
  }

  return NextResponse.json({ success: false, message }, { status });
};

export const handleUnauthorizedApiError = (): NextResponse<ApiResponse> => {
  throw new HttpError(401, i18n._("You are not authorized to perform this action. Please sign in and try again."));
};
