/** Inline script: apply font size from localStorage before React hydrates. */
export const READER_FONT_SIZE_BOOTSTRAP = `
(function () {
  try {
    var key = "reader-font-size";
    var v = localStorage.getItem(key);
    if (v === "small") v = "medium";
    if (v === "medium" || v === "large" || v === "xlarge") {
      document.documentElement.dataset.readerFont = v;
    }
  } catch (e) {}
})();
`.trim();
