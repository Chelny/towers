import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { getTowersNotificationIncludes } from "@/prisma/selects";
import type { TowersNotificationWithRelations } from "db";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { notificationId } = await params;

  try {
    const notification: TowersNotificationWithRelations = await prisma.towersNotification.findUniqueOrThrow({
      where: { id: notificationId },
      include: getTowersNotificationIncludes(),
    });

    return NextResponse.json({ success: true, data: notification }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { notificationId } = await params;

  try {
    const notification: TowersNotificationWithRelations = await prisma.towersNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
      include: getTowersNotificationIncludes(),
    });

    return NextResponse.json({ success: true, data: notification }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
): Promise<NextResponse<ApiResponse>> {
  const { notificationId } = await params;

  try {
    await prisma.towersNotification.delete({
      where: { id: notificationId },
      include: getTowersNotificationIncludes(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
