import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Navbar from "@/components/navbar";
import ClientWrapper from "@/hooks/client-wrapper";
import { isServerLoggedIn } from "@/lib/auth-server";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meet AI",
  description:
    "AI-powered interview assistant for students and professionals to practice their interview skills.",
  icons: {
    icon: "/video-call.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = await isServerLoggedIn();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav>
            <Navbar isLoggedIn={isLoggedIn} />
          </nav>
          <main>
            <ClientWrapper isLoggedIn={isLoggedIn}>{children}</ClientWrapper>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
