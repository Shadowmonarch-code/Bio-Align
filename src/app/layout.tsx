import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/auth/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioAlign | One Platform. Every Bioinformatics Tool.",
  description: "The most comprehensive bioinformatics platform for researchers, students, and scientists. Perform sequence analysis, protein analysis, genomics, transcriptomics, and more - all in one place.",
  keywords: [
    "bioinformatics", "sequence alignment", "BLAST", "protein analysis", 
    "genomics", "transcriptomics", "phylogenetics", "molecular docking",
    "CRISPR", "primer design", "next-generation sequencing"
  ],
  authors: [{ name: "BioAlign Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "BioAlign | One Platform. Every Bioinformatics Tool.",
    description: "Analyze Biology Without Switching Platforms",
    url: "https://bioalign.io",
    siteName: "BioAlign",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BioAlign | One Platform. Every Bioinformatics Tool.",
    description: "Analyze Biology Without Switching Platforms",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
