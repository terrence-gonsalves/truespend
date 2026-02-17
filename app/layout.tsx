import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueSpend - Privacy-First Budgeting",
  description: "Manage your personal finances with CSV imports, budgets, and spending tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}