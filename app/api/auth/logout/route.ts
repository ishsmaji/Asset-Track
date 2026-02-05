import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;
 
export async function POST() { 
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth_token")?.value;
    if (token) {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      await db
        .update(users) 
        .set({ token: null })
        .where(eq(users.id, decoded.userId));
    }
    (await
      cookieStore).delete("auth_token");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
}
