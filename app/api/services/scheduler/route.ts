import { NextResponse } from "next/server";
import { t } from "@lingui/core/macro";
import cron from "node-cron";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export async function POST(): Promise<NextResponse> {
  try {
    cron.schedule("*/20 * * * *", async () => {
      logger.info("");
      logger.info("######################################");
      logger.info("#                                    #");
      logger.info("# Running scheduler every 20 minutes #");
      logger.info("#                                    #");
      logger.info("######################################");
      logger.info("");

      // await prisma.user.deleteMany({
      //   where: { deletionScheduledAt: { lt: new Date() } },
      // })

      await prisma.verification.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" });
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
