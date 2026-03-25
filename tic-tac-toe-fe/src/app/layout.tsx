import type { Metadata } from "next";
import { NakamaProvider } from "@/lib/nakama/NakamaContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tic-Tac-Toe",
  description: "Multiplayer Tic-Tac-Toe powered by Nakama",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <NakamaProvider>{children}</NakamaProvider>
      </body>
    </html>
  );
}
