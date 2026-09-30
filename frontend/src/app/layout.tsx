import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareSentinel+ | Autonomous Voice & Vision Ambient Care Hub",
  description: "Next-gen Ambient Care & Home Safety powered by Alexa+ MCP, Ring IoT, and AWS Bedrock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
