import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ask My Body 求诸己",
  description: "替你守夜的养生 Agent — 身体会知道答案",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-ink-50 text-ink-800 antialiased">
        <main className="relative mx-auto max-w-[420px] min-h-screen overflow-hidden px-8 pb-24 pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
