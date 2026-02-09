import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscription_plans } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, monthly_price, max_assets, max_users, features } = body;

    if (
      !name ||
      !monthly_price  ||
      !max_assets ||
      !max_users  ||
      !features
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(features)) {
      return NextResponse.json(
        { error: "features must be an array" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(subscription_plans)
      .values({
        name,
        monthly_price,
        max_assets,
        max_users,
        features,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await db.select().from(subscription_plans);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
