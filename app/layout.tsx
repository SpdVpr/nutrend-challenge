import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAMECHANGER Challenge | Nutrend",
  description: "Rozhýbej sebe, své okolí i Twitch! 5 týmů, 5 týdnů, ceny v hodnotě 110 000 Kč+",
  keywords: "GAMECHANGER, Challenge, Nutrend, Strava, fitness, běh, týmy, streameři",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
