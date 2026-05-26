/**
 * Clone or update lives-of-saints-hugo (with submodules) for DB import.
 * Usage: npm run content:fetch
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  DEFAULT_CONTENT_DIR,
  HUGO_REPO_URL,
  HUGO_SOURCE_DIR,
} from "./lib/content-source";

function run(command: string, cwd?: string) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", cwd, env: process.env });
}

function dirHasMarkdownFiles(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  try {
    return fs.readdirSync(dir).some((name) => name.endsWith(".md"));
  } catch {
    return false;
  }
}

function livesSubmodulesReady(): boolean {
  const enLives = path.join(DEFAULT_CONTENT_DIR, "en", "lives");
  const ruLives = path.join(DEFAULT_CONTENT_DIR, "ru", "lives");
  return dirHasMarkdownFiles(enLives) && dirHasMarkdownFiles(ruLives);
}

function main() {
  const parentDir = path.dirname(HUGO_SOURCE_DIR);
  fs.mkdirSync(parentDir, { recursive: true });

  const gitDir = path.join(HUGO_SOURCE_DIR, ".git");

  if (fs.existsSync(gitDir)) {
    console.log(`Updating ${HUGO_SOURCE_DIR}`);
    run("git fetch origin", HUGO_SOURCE_DIR);
    run("git pull --ff-only", HUGO_SOURCE_DIR);
    run("git submodule sync --recursive", HUGO_SOURCE_DIR);
    run("git submodule update --init --recursive", HUGO_SOURCE_DIR);
  } else {
    if (fs.existsSync(HUGO_SOURCE_DIR)) {
      console.error(
        `Path exists but is not a git repository: ${HUGO_SOURCE_DIR}\n` +
          "Remove it and run content:fetch again."
      );
      process.exit(1);
    }
    console.log(`Cloning ${HUGO_REPO_URL}`);
    run(
      `git clone --recurse-submodules "${HUGO_REPO_URL}" "${HUGO_SOURCE_DIR}"`
    );
  }

  if (!fs.existsSync(DEFAULT_CONTENT_DIR)) {
    console.error(`Missing content directory: ${DEFAULT_CONTENT_DIR}`);
    process.exit(1);
  }

  if (!livesSubmodulesReady()) {
    console.error(
      "content/en/lives and content/ru/lives look empty.\n" +
        "Run: git submodule update --init --recursive\n" +
        "inside the cloned Hugo repo."
    );
    process.exit(1);
  }

  console.log(`\nHugo source ready: ${HUGO_SOURCE_DIR}`);
  console.log(`Import with: npm run import:content`);
  console.log(`(uses ${DEFAULT_CONTENT_DIR} by default)`);
}

main();
