import { NextResponse } from "next/server"
import cron from "node-cron"
import prisma from "@/lib"

export async function POST(): Promise<NextResponse> {
  try {
    cron.schedule("*/20 * * * *", async () => {
      console.log("")
      console.log("######################################")
      console.log("#                                    #")
      console.log("# Running scheduler every 20 minutes #")
      console.log("#                                    #")
      console.log("######################################")
      console.log("")

      await prisma.user.deleteMany({
        where: {
          deletionScheduledAt: {
            lte: new Date()
          }
        }
      })
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}
