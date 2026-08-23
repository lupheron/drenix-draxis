import { NextResponse } from "next/server";
import type { CompanyCode } from "@/lib/types";
import { fetchAttendanceData } from "@/utils/fetchAttendanceData";

export const revalidate = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = (searchParams.get("company") ?? "JM").toUpperCase() as CompanyCode;
  const from = searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? from;

  const result = await fetchAttendanceData(company, from, to);
  return NextResponse.json(result);
}
