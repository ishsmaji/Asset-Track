import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;

type VerifyOtpBody = {
  userId?: number | string;
  userid?: number | string;
  otp: string;
};

export async function POST(req: Request) {
  try {
    const body: VerifyOtpBody = await req.json();

    const userId = Number(body.userId ?? body.userid);
    const otp = body.otp;

    if (!userId || !otp) {
      return NextResponse.json({ message: "OTP required" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.otp_expiry || user.otp_expiry < new Date()) {
      return NextResponse.json(
        { message: "OTP expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        orgId: user.org_id,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    await db
      .update(users)
      .set({
        token,
        is_active: true,
        otp: null,
        otp_expiry: null,
      })
      .where(eq(users.id, user.id));

    (await
    cookies()).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 48,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(
      {
        message: "Thank You For Joining Us",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.org_id, 
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("OTP verification failed:", error);

    return NextResponse.json(
      {
        message: "OTP verification failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
