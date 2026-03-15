import { NextResponse } from "next/server";

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function errorResponseFrom(
  error: unknown,
  fallbackMessage = "Erro interno do servidor",
  status = 500
) {
  return errorResponse(fallbackMessage, status);
}
