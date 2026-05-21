import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ask My Body 问身",
  description: "替你守夜的问身 Agent — 一个人就是一座庙",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-ink-50 text-ink-900 antialiased">
        <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
