import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from '@/components/AnimatedBackground'
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduVerse LearnSphere",
  description: "AI-powered learning for curious minds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimatedBackground />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
