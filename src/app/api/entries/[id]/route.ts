import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/constants";
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
    await prisma.saintEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete entry" }, { status: 400 });
  }
}
