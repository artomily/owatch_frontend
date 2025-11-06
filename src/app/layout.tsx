import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ResponseLogger } from "@/utils/response-logger";
import { cookies } from "next/headers";
import { ClientWalletProvider } from "@/components/ClientWalletProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/lib/supabaseErrorHandler"; // Suppress Realtime connection errors

// Fallback to Google-hosted fonts to avoid requiring local .woff files in the repo.
const geistSans = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "O'Watch.ID - Watch to Earn Platform",
  description: "Earn OWATCH tokens by watching engaging video content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestId = cookies().get("x-request-id")?.value;

  return (
    <html lang="en">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ClientWalletProvider>{children}</ClientWalletProvider>
        </ThemeProvider>
        <ResponseLogger />
      </body>
    </html>
  );
}
