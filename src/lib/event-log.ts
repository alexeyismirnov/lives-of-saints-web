import type { SaintEntry, Section } from "@prisma/client";
import type { Lang } from "@/lib/constants";
import { EN_MONTH_NAMES, RU_MONTH_GENITIVE } from "@/lib/entry-meta";
import { prisma } from "@/lib/db";

export type EventAction = "added" | "edited" | "deleted";

type EntryForLog = Pick<
  SaintEntry,
  "linkTitle" | "dayOfMonth" | "calendarLabel" | "language"
>;

type SectionForLog = Pick<Section, "slug">;

export function ordinalDayEn(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** Calendar phrase for log lines, e.g. on date "3rd of May" or in Triodion. */
export function formatEntryDatePhrase(
  entry: EntryForLog,
  section: SectionForLog,
  lang: Lang
): string {
  if (section.slug === "triodion") {
    return "in Triodion";
  }

  const label = entry.calendarLabel.trim();
  if (label) {
    return `on date "${label}"`;
  }

  const day = entry.dayOfMonth;
  if (!day) {
    return "with no calendar date";
  }

  if (lang === "ru") {
    const month = RU_MONTH_GENITIVE[section.slug];
    return month ? `on date "${day} ${month}"` : `on date "${day}"`;
  }

  const month = EN_MONTH_NAMES[section.slug];
  return month
    ? `on date "${ordinalDayEn(day)} of ${month}"`
    : `on date "${ordinalDayEn(day)}"`;
}

export function formatEventLogLine(
  action: EventAction,
  userLabel: string,
  entry: EntryForLog,
  section: SectionForLog
): string {
  const timestamp = new Date()
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, " UTC");
  const verb =
    action === "added" ? "added" : action === "edited" ? "edited" : "deleted";
  const datePhrase = formatEntryDatePhrase(
    entry,
    section,
    entry.language as Lang
  );
  return `${timestamp} User ${userLabel} ${verb} page "${entry.linkTitle}" ${datePhrase}`;
}

export function userLogLabel(user: {
  name?: string | null;
  email?: string | null;
}): string {
  const name = user.name?.trim();
  if (name) return name;
  if (user.email) return user.email;
  return "unknown";
}

export async function appendEventLog(message: string): Promise<void> {
  await prisma.eventLog.create({ data: { message } });
}

export async function logEntryChange(
  action: EventAction,
  user: { name?: string | null; email?: string | null },
  entry: EntryForLog,
  section: SectionForLog
): Promise<void> {
  const message = formatEventLogLine(action, userLogLabel(user), entry, section);
  await appendEventLog(message);
}

/** Log entry changes without failing the parent request. */
export async function logEntryChangeSafe(
  action: EventAction,
  user: { name?: string | null; email?: string | null },
  entry: EntryForLog,
  section: SectionForLog
): Promise<void> {
  try {
    await logEntryChange(action, user, entry, section);
  } catch (error) {
    console.error("Failed to write event log:", error);
  }
}
