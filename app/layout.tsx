import type { Metadata } from "next";
import "./globals.css";

// 这里我们暂时不引用 Geist 字体，因为它就是导致你报错的根源
// 我们改用系统默认字体栈，这样完全不需要联网下载任何东西
export const metadata: Metadata = {
  title: "AI 三子棋",
  description: "从零开始的 AI 开发",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      {/* antialiased 是 Tailwind 的类，确保字体清晰 */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
