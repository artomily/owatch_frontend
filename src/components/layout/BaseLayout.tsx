import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ResponseLogger } from "@/utils/response-logger";
import { cookies } from "next/headers";

const geistSans = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "O'Watch.ID - Watch to Earn Platform",
  description:
    "Earn OWATCH tokens by watching engaging video content. Join the future of content consumption and start earning today.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestId = cookies().get("x-request-id")?.value;

  return (
    <html lang="en">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ResponseLogger />
      </body>
    </html>
  );
}
