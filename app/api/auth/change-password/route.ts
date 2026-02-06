// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { db } from "@/db";
// import { users } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { sendPasswordChangedMail } from "@/lib/send";

// export async function POST(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const token = url.searchParams.get("token"); 
//     const { newPassword } = await req.json();   
//     if (!token || !newPassword) {
//       return NextResponse.json({ message: "Invalid request" }, { status: 400 });
//     }
//     const user = await db
//       .select()
//       .from(users)
//       .where(eq(users.resetPasswordToken, token))
//       .limit(1)
//       .then((res) => res[0]);
//     if (!user) {
//       return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
//     }
//     if (Date.now() > Number(user.resetPasswordExpires)) {
//       return NextResponse.json({ message: "Token has expired" }, { status: 400 });
//     }
//     const hashedPassword = await bcrypt.hash(newPassword, 10); 
//     await db
//       .update(users)
//       .set({
//         password: hashedPassword,
//         resetPasswordToken: null,
//         resetPasswordExpires: null,
//       })
//       .where(eq(users.id, user.id));
//       await sendPasswordChangedMail(user.email);
//     return NextResponse.json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }
