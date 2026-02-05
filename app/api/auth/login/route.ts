import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendLoginOtpMail } from "@/lib/send";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and  password required" },
        { status: 400 },
      );
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (user.otp && user.otpExpiry && user.otpExpiry > new Date()) {
      return NextResponse.json(
        {
          message: "OTP already sent. Please wait before requesting a new one.",
        },
        { status: 429 },
      );
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await db
      .update(users)
      .set({
        otp,
        otpExpiry,
        isActive: false,
        token: null,
      })
      .where(eq(users.id, user.id));
    await sendLoginOtpMail(user.email, otp);

    return NextResponse.json({
      message: "OTP sent to your email",
      userId: user.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Login failed", error: error?.message },
      { status: 500 },
    );
  }
}
