import { Sidebar } from "@/components/Sidebar";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
