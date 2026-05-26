import type { Metadata } from "next";
import { Cormorant_Garamond, Literata, Source_Sans_3 } from "next/font/google";
import { ReaderSettingsProvider } from "@/components/providers/ReaderSettingsProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { READER_FONT_SIZE_BOOTSTRAP } from "@/lib/reader-settings-script";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-cormorant",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin", "cyrillic"],
  variable: "--font-literata",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lives of Saints",
  description: "Lives of Orthodox saints in English and Russian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${literata.variable} ${sourceSans.variable}`}
      data-reader-font="medium"
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: READER_FONT_SIZE_BOOTSTRAP }}
        />
        <ReaderSettingsProvider>
          <SessionProvider>{children}</SessionProvider>
        </ReaderSettingsProvider>
      </body>
    </html>
  );
}
