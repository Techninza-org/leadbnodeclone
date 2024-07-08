import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

import { Provider } from 'jotai';
import GraphqlProvider from "@/components/providers/GraphqlProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LeadProvider } from "@/components/providers/LeadProvider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background antialiased bg-zinc-50",
          fontSans.variable
        )}
      >
        <GraphqlProvider>
          <Provider>

            <AuthProvider>
              <LeadProvider>
                <ModalProvider />
                {children}
                <Toaster />
              </LeadProvider>
            </AuthProvider>

          </Provider>
        </GraphqlProvider>
      </body>
    </html>
  );
}


