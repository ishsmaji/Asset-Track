import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = Number(searchParams.get("branchId"));

    if (!branchId || isNaN(branchId)) {
      return NextResponse.json(
        { message: "branchId is required" },
        { status: 400 }
      );
    }

    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.branchId, branchId));

    return NextResponse.json(
      { count: data.length, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET USERS BY BRANCH ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
