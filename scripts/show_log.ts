/**
 * Print editor event logs (newest first).
 * Usage: npm run show-log
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.eventLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (logs.length === 0) {
    console.log("No event log entries.");
    return;
  }

  for (const log of logs) {
    console.log(log.message);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
