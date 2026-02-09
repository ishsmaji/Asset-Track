import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/db";
import { organizations, users, branches } from "@/db/schema";
import { sendSignupMail } from "@/lib/send";
import { eq } from "drizzle-orm";

type BranchInput = {
  name: string;
  code: string;
  address: string;
};

type SignupBody = {
  organizationName: string;
  organizationType: "Government" | "Corporate" | "Education" | "HealthCare" | "Non-Profit";
  contactPerson: string;
  email: string;
  phone?: string;
  planId: number;
  branches?: BranchInput[];
};

export async function POST(req: Request) {
  try {
    const body: SignupBody = await req.json();

    const {
      organizationName,
      organizationType,
      contactPerson,
      email,
      phone,
      planId,
      branches: branchList,
    } = body;

    if (
      !organizationName ||
      !organizationType ||
      !contactPerson ||
      !email 
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already registered. Please login." },
        { status: 409 }
      );
    }
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, organizationName))
      .limit(1);

    if (existingOrg.length > 0) {
      return NextResponse.json(
        { message: "Organization name already exists" },
        { status: 409 }
      );
    }
    function generateRandomPassword(length = 6) {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
      }

      return password;
    }

    const defaultPassword = generateRandomPassword(6);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [org] = await db
      .insert(organizations)
      .values({
        name: organizationName,
        type: organizationType,
        plan_id: planId,
      })
      .returning();

    if (branchList && branchList.length > 0) {
      await db.insert(branches).values(
        branchList.map((b) => ({
          org_id: org.id,
          name: b.name,
          code: b.code,
          address: b.address,
        }))
      );
    }
    await db.insert(users).values({
      org_id: org.id,
      name: contactPerson,
      email,
      phone,
      password: hashedPassword,
      role: "Parent-Admin",
    });

    try {
      await sendSignupMail(email, defaultPassword);
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
    }

    return NextResponse.json({ message: "Signup successful" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Signup API Error:", error);

    return NextResponse.json(
      {
        message: "Signup failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
