"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <html lang="en">
      <head>
        <title>Sapan.io - Thailand&apos;s Startup Ecosystem Platform</title>
        <meta
          name="description"
          content="Connect founders with mentors who've been there before"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
