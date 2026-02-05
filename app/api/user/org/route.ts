import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, branches } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url); 
    const orgId = Number(searchParams.get("orgId"));

    if (!orgId || isNaN(orgId)) {
      return NextResponse.json(
        { message: "orgId is required" }, 
        { status: 400 }
      );
    }        
    const data = await db
      .select({ 
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branchId: users.branchId,
        branchName: branches.name,
        isActive: users.isActive,
      })
      .from(users)
      .leftJoin(branches, eq(users.branchId, branches.id))
      .where(eq(users.orgId, orgId));

    return NextResponse.json(
      { count: data.length, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET USERS BY ORG ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
