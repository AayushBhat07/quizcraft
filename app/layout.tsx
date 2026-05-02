import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizCraft - Emerging Trends in Electronics",
  description: "AI-powered quiz platform for Emerging Trends in Electronics. Master 218 questions across 3 chapters including Advanced Processors, AI/ML, and ESP32 Microcontroller.",
  icons: {
    icon: "🔌",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
