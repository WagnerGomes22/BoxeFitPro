import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-errors";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return errorResponse("session_id ausente", 400);
  }

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    select: { status: true },
  });

  if (!subscription) {
    return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ status: subscription.status });
}
