import { NextResponse } from "next/server";
import { fetchLeadsData } from "@/utils/fetchLeadsData";

export const revalidate = 300;

export async function GET() {
  const result = await fetchLeadsData();
  return NextResponse.json(result);
}
