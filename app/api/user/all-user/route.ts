import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select({
        userId: users.id,
        userName: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        orgId: organizations.id,
        orgName: organizations.name,
        orgType: organizations.type,
      })
      .from(users)
      .leftJoin(organizations, eq(users.orgId, organizations.id));

    return NextResponse.json(
      {
        success: true,
        count: result.length,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch users" },
      { status: 500 }
    );
  }
}
