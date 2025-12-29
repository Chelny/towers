import { Static, TSchema } from "@sinclair/typebox";

declare global {
  type ApiResponse<T = unknown> = {
    success: boolean
    message?: string
    data?: T
    pagination?: Pagination
    error?: string | FormValidationErrors
  };

  type FormPayload<T extends TSchema> = Static<T>;

  type FormValidationErrors<T extends string> = {
    [K in T]?: string
  };

  type NonNullableObject<T> = {
    [K in keyof T as T[K] extends null | undefined ? never : K]: T[K]
  };

  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  interface Pagination {
    totalResults: number
    currentPage: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
  }
}

export {};
