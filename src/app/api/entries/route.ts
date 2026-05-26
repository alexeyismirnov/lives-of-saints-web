import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/constants";
import { logEntryChangeSafe } from "@/lib/event-log";
import { resolveUniqueSlug } from "@/lib/entries";
import { getNextTriodionSortWeight, isTriodionSection } from "@/lib/sections";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    language,
    sectionId,
    slug,
    linkTitle,
    calendarLabel,
    dayOfMonth,
    sortWeight,
    bodyMd,
    audioUrl,
    isDraft,
  } = body;

  try {
    const lang = language as Lang;
    const triodion = await isTriodionSection(sectionId);
    const resolvedSortWeight = triodion
      ? await getNextTriodionSortWeight(sectionId, lang)
      : (sortWeight ?? dayOfMonth ?? 0);
    const uniqueSlug = await resolveUniqueSlug(lang, sectionId, slug);

    const entry = await prisma.saintEntry.create({
      data: {
        language: lang,
        sectionId,
        slug: uniqueSlug,
        linkTitle,
        calendarLabel: calendarLabel ?? "",
        dayOfMonth: triodion ? null : (dayOfMonth ?? null),
        sortWeight: resolvedSortWeight,
        bodyMd,
        audioUrl: audioUrl || null,
        isDraft: !!isDraft,
        updatedById: session.user.id,
      },
    });

    const section = await prisma.section.findUniqueOrThrow({
      where: { id: sectionId },
      select: { slug: true },
    });
    await logEntryChangeSafe("added", session.user, entry, section);

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json(
      { error: "Could not create entry. Slug may already exist." },
      { status: 400 }
    );
  }
}
