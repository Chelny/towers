import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "db/browser";
import { RelationshipType } from "db/enums";
import { PAGINATION_LIMIT } from "@/constants/api";
import { handleApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { UserRelationshipTableRow } from "@/types/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<UserRelationshipTableRow[] | unknown>>> {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const currentPage: number = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize: number = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION_LIMIT))));
    const skip: number = (currentPage - 1) * pageSize;

    const query: string = searchParams.get("query") || "";
    const typeParam: string | null = searchParams.get("type");
    const relationshipType: RelationshipType | undefined =
      typeParam && Object.values(RelationshipType).includes(typeParam as RelationshipType)
        ? (typeParam as RelationshipType)
        : undefined;

    const mutedParam: string | null = searchParams.get("muted");
    const isMuted: boolean | undefined = mutedParam === "true" ? true : mutedParam === "false" ? false : undefined;

    const orderBy: string = searchParams.get("orderBy") || "createdAt";
    const sortParam: string | null = searchParams.get("sort");
    const sort: Prisma.SortOrder = sortParam === "desc" ? "desc" : "asc";

    const where: Prisma.UserRelationshipWhereInput = {
      sourceUserId: id,
      NOT: {
        AND: [{ type: RelationshipType.NONE }, { isMuted: false }],
      },
      ...(relationshipType && { type: relationshipType }),
      ...(typeof isMuted !== "undefined" && { isMuted }),

      ...(query && {
        targetUser: {
          is: {
            username: { contains: query, mode: "insensitive" },
            displayUsername: { contains: query, mode: "insensitive" },
          },
        },
      }),
    };

    let orderByInput: Prisma.UserRelationshipOrderByWithRelationInput;
    switch (orderBy) {
      case "username":
        orderByInput = { targetUser: { username: sort } };
        break;
      case "displayUsername":
        orderByInput = { targetUser: { displayUsername: sort } };
        break;
      default:
        orderByInput = { [orderBy]: sort };
    }

    const [userRelationships, totalResults] = await prisma.$transaction([
      prisma.userRelationship.findMany({
        where,
        distinct: ["targetUserId"],
        include: {
          targetUser: {
            select: {
              id: true,
              username: true,
              displayUsername: true,
            },
          },
        },
        orderBy: orderByInput,
        skip,
        take: pageSize,
      }),
      prisma.userRelationship.count({ where }),
    ]);

    const data: UserRelationshipTableRow[] = userRelationships.map((userRelationship: UserRelationshipTableRow) => ({
      id: userRelationship.id,
      type: userRelationship.type,
      isMuted: userRelationship.isMuted,
      createdAt: userRelationship.createdAt,
      targetUser: userRelationship.targetUser,
    }));

    const totalPages: number = Math.max(1, Math.ceil(totalResults / pageSize));
    const hasNextPage: boolean = currentPage < totalPages;

    const pagination: Pagination = {
      currentPage,
      pageSize,
      totalResults,
      totalPages,
      hasNextPage,
    };

    return NextResponse.json(
      {
        success: true,
        data,
        pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id: sourceUserId } = await params;
    const { id, type: relationshipType, isMuted } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "User relationship ID is required" } },
        { status: 400 },
      );
    }

    const userRelationship: UserRelationshipTableRow = await prisma.userRelationship.update({
      where: { id, sourceUserId },
      data: {
        ...(typeof relationshipType !== "undefined" ? { type: relationshipType } : {}),
        ...(typeof isMuted !== "undefined" ? { isMuted } : {}),
      },
      include: {
        targetUser: { select: { id: true, username: true, displayUsername: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: userRelationship,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
