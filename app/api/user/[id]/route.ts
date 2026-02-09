// import { NextResponse } from "next/server";
// import { db } from "@/db";
// import { users, organizations, branches } from "@/db/schema";
// import { eq } from "drizzle-orm";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     const userId = Number(params.id);

//     if (isNaN(userId)) {
//       return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
//     }

//     const result = await db
//       .select({
//         id: users.id,
//         name: users.name,
//         email: users.email,
//         phone: users.phone,
//         role: users.role,
//         isActive: users.isActive,
//         orgId: organizations.id,
//         orgName: organizations.name,
//         branchId: branches.id,
//         branchName: branches.name,
//         createdAt: users.createdAt,
//       })
//       .from(users)
//       .leftJoin(organizations, eq(users.orgId, organizations.id))
//       .leftJoin(branches, eq(users.branchId, branches.id))
//       .where(eq(users.id, userId))
//       .limit(1);

//     if (result.length === 0) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json({ data: result[0] }, { status: 200 });
//   } catch (error) {
//     console.error("GET USER BY ID ERROR:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch user" },
//       { status: 500 },
//     );
//   }
// }
