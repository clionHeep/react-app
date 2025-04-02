import { NextResponse } from "next/server";

export function getErrorResponse(status: number, message: string) {
  return NextResponse.json(
    {
      code: status,
      message
    },
    { status }
  );
} 