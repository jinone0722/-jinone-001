import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkSphere AI",
  description: "AI office workspace for notes, images, reminders and workflows"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
