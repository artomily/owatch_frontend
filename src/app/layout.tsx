import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import { ResponseLogger } from "@/utils/response-logger";
import { cookies } from "next/headers";
import { ClientWalletProvider } from "@/components/ClientWalletProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/lib/supabaseErrorHandler"; // Suppress Realtime connection errors
import "@/lib/walletConnectErrorHandler"; // Suppress WalletConnect/pino warnings

// Fallback to Google-hosted fonts to avoid requiring local .woff files in the repo.
const geistSans = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
// Editorial display typeface for large headings.
const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
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
    <html lang="en" className="light">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} antialiased`}
      >
        <ThemeProvider>
          <ClientWalletProvider>{children}</ClientWalletProvider>
        </ThemeProvider>
        <ResponseLogger />
      </body>
    </html>
  );
}
