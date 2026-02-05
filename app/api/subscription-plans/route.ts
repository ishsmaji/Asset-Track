import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptionPlans } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, monthly_price, max_assets, max_users, features } = body;

    if (!name || !monthly_price || !max_assets || !max_users || !features) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const result = await db.insert(subscriptionPlans).values({
      name,
      monthlyPrice: monthly_price,
      maxAssets: max_assets,
      maxUsers: max_users,  
      features,
    }).returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
