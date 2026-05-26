/**
 * Create an editor user: npx tsx scripts/create_editor_user.ts email password
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create_editor_user.ts email password");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      email: email.toLowerCase(),
      passwordHash: hash,
      role: "editor",
    },
    update: { passwordHash: hash },
  });
  console.log(`Editor user ready: ${user.email} (${user.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
