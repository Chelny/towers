import { NextRequest, NextResponse } from "next/server";
import { logger, PinoLevel } from "@/lib/logger";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const logLevels: PinoLevel[] = ["fatal", "error", "warn", "info", "debug", "trace"];
    const level: PinoLevel = logLevels.includes(body.level) ? body.level : "info";
    const message: string = body.message || "No message provided";
    const context: Record<string, string | undefined> = { ...body, level: undefined, message: undefined };

    logger[level]({ ...context, msg: message });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error(`Log API failed: ${error}`);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
