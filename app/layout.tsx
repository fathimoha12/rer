import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppearanceProvider } from "@/components/appearance-provider";

export const metadata: Metadata = {
  title: "TET Community | Forex Trade Journal",
  description: "A secure red and black forex journal for traders who want discipline, reports, and edge analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppearanceProvider>{children}</AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
