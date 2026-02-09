// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { db } from "@/db";
// import { users } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { sendResetPasswordMail } from "@/lib/send";

// export async function POST(req: Request) {
//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json(
//         { message: "Email is required" },
//         { status: 400 }
//       );
//     }
//     const [user] = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, email))
//       .limit(1);

//     if (!user) {
//       return NextResponse.json(
//         { message: "Email not registered" },
//         { status: 404 }
//       );
//     }

//     if (user.resetPasswordToken  && Date.now() < Number(user.resetPasswordExpires)) {
//       return NextResponse.json(
//         {
//           message: "Link already sent. Please wait before requesting a new one.",
//         },
//         { status: 429 },
//       );
//     }
//     const token = crypto.randomBytes(32).toString("hex");
//     const expires = Date.now() + 1 * 60 * 1000; 
//     await db
//       .update(users)
//       .set({
//         resetPasswordToken: token,
//         resetPasswordExpires: expires,
//       })
//       .where(eq(users.id, user.id));

//     const resetLink = `http://localhost:3000/api/auth/reset-password?token=${token}`;
//     await sendResetPasswordMail(email, resetLink);

//     return NextResponse.json({
//       message: "Reset password link sent to email",
//     });
//   } catch (error: any) {
//     console.error("RESET PASSWORD ERROR:", error);
//     return NextResponse.json(
//       { message: "Reset password failed", error: error.message },
//       { status: 500 }
//     );
//   }
// }
