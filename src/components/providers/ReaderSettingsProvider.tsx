"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getStoredFontSize,
  READER_FONT_SIZE_KEY,
  type ReaderFontSize,
} from "@/lib/reader-settings";

type ReaderSettingsContextValue = {
  fontSize: ReaderFontSize;
  setFontSize: (size: ReaderFontSize) => void;
};

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | null>(
  null
);

export function ReaderSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSize, setFontSizeState] = useState<ReaderFontSize>("medium");

  useEffect(() => {
    const stored = getStoredFontSize();
    setFontSizeState(stored);
    document.documentElement.dataset.readerFont = stored;
  }, []);

  const setFontSize = useCallback((size: ReaderFontSize) => {
    setFontSizeState(size);
    localStorage.setItem(READER_FONT_SIZE_KEY, size);
    document.documentElement.dataset.readerFont = size;
  }, []);

  return (
    <ReaderSettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings() {
  const ctx = useContext(ReaderSettingsContext);
  if (!ctx) {
    throw new Error("useReaderSettings must be used within ReaderSettingsProvider");
  }
  return ctx;
}
