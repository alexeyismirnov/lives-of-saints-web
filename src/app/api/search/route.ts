import { NextResponse } from "next/server";
import { isLang } from "@/lib/constants";
import { searchEntries } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const langParam = searchParams.get("lang") ?? "";
  const query = searchParams.get("q") ?? "";
  const limitParam = parseInt(searchParams.get("limit") ?? "12", 10);

  if (!isLang(langParam)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const results = await searchEntries(langParam, query, limitParam);

  return NextResponse.json({
    query: query.trim(),
    results,
  });
}
