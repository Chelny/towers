import { NextResponse } from "next/server"
import { APP_COOKIES } from "@/constants/app"

export async function DELETE(): Promise<NextResponse> {
  const response: NextResponse = NextResponse.json({ success: true, status: 204 })
  response.cookies.delete(APP_COOKIES.NEW_USER)
  return response
}
