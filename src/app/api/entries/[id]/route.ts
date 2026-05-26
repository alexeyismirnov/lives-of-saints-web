import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/constants";
import { logEntryChangeSafe } from "@/lib/event-log";
import { isTriodionSection } from "@/lib/sections";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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
    const existing = await prisma.saintEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const triodion = await isTriodionSection(sectionId);

    const entry = await prisma.saintEntry.update({
      where: { id },
      data: {
        language: language as Lang,
        sectionId,
        slug,
        linkTitle,
        calendarLabel: calendarLabel ?? "",
        dayOfMonth: triodion ? null : (dayOfMonth ?? null),
        sortWeight: triodion ? existing.sortWeight : (sortWeight ?? 0),
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
    await logEntryChangeSafe("edited", session.user, entry, section);

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Could not update entry" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.saintEntry.findUnique({
      where: { id },
      include: { section: { select: { slug: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.saintEntry.delete({ where: { id } });
    await logEntryChangeSafe("deleted", session.user, existing, existing.section);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete entry" }, { status: 400 });
  }
}
