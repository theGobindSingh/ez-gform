import { Pager, Sidebar } from "@/components/Sidebar";
import type { Metadata } from "next";
import {
  Instrument_Sans as InstrumentSans,
  JetBrains_Mono as JetBrainsMono,
} from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const sans = InstrumentSans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrainsMono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "ez-gform docs",
    template: "%s · ez-gform",
  },
  description:
    "Submit your own custom form UI to a Google Form without a backend.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <div className="layout">
          <Sidebar />
          <main className="content" id="content">
            {children}
            <Pager />
          </main>
        </div>
      </body>
    </html>
  );
}
