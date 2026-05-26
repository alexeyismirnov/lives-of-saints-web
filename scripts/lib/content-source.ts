import path from "path";

/** Project root (lives-of-saints-web). */
export const PROJECT_ROOT = path.resolve(__dirname, "../..");

export const HUGO_REPO_URL =
  process.env.HUGO_SOURCE_REPO ??
  "https://github.com/alexeyismirnov/lives-of-saints-hugo.git";

/** Cloned Hugo site (includes submodule checkouts under content/en|ru/lives). */
export const HUGO_SOURCE_DIR = path.join(
  PROJECT_ROOT,
  ".content-source",
  "lives-of-saints-hugo"
);

/** Default import path: content/ inside the cloned Hugo repo. */
export const DEFAULT_CONTENT_DIR = path.join(HUGO_SOURCE_DIR, "content");

export function resolveContentDir(): string {
  return path.resolve(process.env.CONTENT_DIR || DEFAULT_CONTENT_DIR);
}
