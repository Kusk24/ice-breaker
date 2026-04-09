import type { Metadata } from "next";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import MusicPlayer from "./components/MusicPlayer";
import ScrollLetter from "./components/ScrollLetter";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "A Special Gift for Tiny Thae Thu",
  description: "A CSS-animated flower blossoming scene built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${playfair.variable} ${dancing.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
        <MusicPlayer />
        <ScrollLetter />
        <a
          href="https://github.com/Kusk24/ice-breaker"
          target="_blank"
          rel="noopener noreferrer"
          className="site-credit"
        >
          <span className="site-credit__name">By WinYu</span>
          <span className="site-credit__sub">made with much much &lt;3</span>
        </a>
      </body>
    </html>
  );
}
