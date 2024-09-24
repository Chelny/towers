import { TSchema, Static } from "@sinclair/typebox"

declare global {
  type SchemaFormData<T extends TSchema> = Static<T>

  type SchemaFormErrorMessages<T extends string> = {
    [K in T]?: string
  }

  type ApiResponse<T = undefined> = {
    success: boolean
    message?: string
    data?: T
    error?: string | SchemaFormErrorMessages
  }

  type Debounce = (this: any, ...args: any[]) => void

  type NonNullableObject<T> = {
    [K in keyof T as T[K] extends null | undefined ? never : K]: T[K]
  }
}

export {}
