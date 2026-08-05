import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NetScene｜社交内容模拟器",
  description: "自由编辑聊天、朋友圈、论坛、X 与 Instagram 排版并导出图片。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: process.env.GITHUB_ACTIONS ? "/netscene/favicon.svg" : "/favicon.svg",
    shortcut: process.env.GITHUB_ACTIONS ? "/netscene/favicon.svg" : "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
