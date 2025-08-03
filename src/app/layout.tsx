import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { StructuredData } from "@/components/StructuredData";
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
  title: "EthereumList.com",
  description: "Comprehensive tracking of Ethereum ecosystem: ETFs, treasury companies, and market data",
  keywords: [
    "ethereum treasury",
    "corporate ETH holdings",
    "public companies cryptocurrency",
    "institutional bitcoin",
    "crypto treasury management",
    "ETH per share",
    "digital asset investments",
    "blockchain corporate adoption"
  ],
  authors: [{ name: "Ethereum Treasury Tracker" }],
  creator: "Ethereum Treasury Tracker",
  publisher: "Ethereum Treasury Tracker",
  openGraph: {
    title: "Ethereum Treasury Companies - Corporate ETH Holdings",
    description: "Track publicly traded companies holding Ethereum in their corporate treasuries with real-time data and financial analysis.",
    url: "https://ethereumlist.com",
    siteName: "Ethereum Treasury Companies",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethereum Treasury Companies - Corporate ETH Holdings",
    description: "Track publicly traded companies holding Ethereum in their corporate treasuries with real-time data and financial analysis.",
    creator: "@ethereumlist"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-042N8CR7N1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-042N8CR7N1');
          `}
        </Script>
        
        {/* Structured Data for LLMs and Search Engines */}
        <StructuredData type="website" />
        <StructuredData type="dataset" />
        
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
