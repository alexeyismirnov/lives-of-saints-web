import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isLang } from "@/lib/constants";
import { resolveUniqueSlug } from "@/lib/entries";
import { slugFromTitle } from "@/lib/entry-meta";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const sectionId = searchParams.get("sectionId");
  const base = searchParams.get("base");
  const title = searchParams.get("title");
  const excludeId = searchParams.get("excludeId") ?? undefined;

  if (!language || !isLang(language) || !sectionId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const baseSlug =
    base?.trim() ||
    (title ? slugFromTitle(title, language) : "");

  if (!baseSlug) {
    return NextResponse.json({ slug: "", baseSlug: "", adjusted: false });
  }

  const slug = await resolveUniqueSlug(
    language,
    sectionId,
    baseSlug,
    excludeId
  );

  return NextResponse.json({
    slug,
    baseSlug,
    adjusted: slug !== baseSlug,
  });
}
