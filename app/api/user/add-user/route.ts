// import { NextResponse } from "next/server";
// import bcrypt from "bcrypt";
// import { db } from "@/db";
// import { users, branches, organizations } from "@/db/schema";
// import { sendSignupMail } from "@/lib/send";
// import { eq, and } from "drizzle-orm";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const {
//       username,
//       email,
//       phone,
//       role,
//       branchId,
//       organizationId,
//     } = body;

//     // 🔴 Validation
//     if (
//       !username ||
//       !email ||
//       !role ||
//       !branchId ||
//       !organizationId
//     ) {
//       return NextResponse.json(
//         { message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // 🔎 Check existing user
//     const existingUser = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, email))
//       .limit(1);

//     if (existingUser.length > 0) {
//       return NextResponse.json(
//         { message: "User with this email already exists" },
//         { status: 409 }
//       );
//     }

//     // 🔎 Validate organization
//     const org = await db
//       .select()
//       .from(organizations)
//       .where(eq(organizations.id, organizationId))
//       .limit(1);

//     if (org.length === 0) {
//       return NextResponse.json(
//         { message: "Organization not found" },
//         { status: 404 }
//       );
//     }

//     // 🔎 Validate branch belongs to organization
//     const branch = await db
//       .select()
//       .from(branches)
//       .where(
//         and(
//           eq(branches.id, branchId),
//           eq(branches.orgId, organizationId)
//         )
//       )
//       .limit(1);

//     if (branch.length === 0) {
//       return NextResponse.json(
//         { message: "Invalid branch for this organization" },
//         { status: 400 }
//       );
//     }

//     // 🔐 Generate temporary password
//     function generateRandomPassword(length = 6) {
//       const chars =
//         "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
//       let password = "";

//       for (let i = 0; i < length; i++) {
//         password += chars[Math.floor(Math.random() * chars.length)];
//       }
//       return password;
//     }

//     const tempPassword = generateRandomPassword(6);
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);

//     // 📌 Insert user
//     await db.insert(users).values({
//       name: username,
//       email,
//       phone,
//       role,
//       orgId: organizationId,
//       branchId,
//       password: hashedPassword,
//       isActive: true,
//     });

//     // 📧 Send email with temp password
//     try {
//       await sendSignupMail(email, tempPassword);
//     } catch (mailError) {
//       console.error("Email sending failed:", mailError);
//     }

//     return NextResponse.json(
//       { message: "User added successfully" },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("ADD USER API ERROR:", error);

//     return NextResponse.json(
//       {
//         message: "Failed to add user",
//         error: error?.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }
