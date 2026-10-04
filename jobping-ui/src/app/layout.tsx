import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Sidebar from "@/components/Sidebar";
import ActivityTracker from "@/components/ActivityTracker";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import "./design-tokens.css";
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
  title: "JobPing",
  description: "Real-time alerts for jobs from 3,000+ companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="jobping-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("jobping-theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`,
          }}
        />
      </head>
      <body className="jp-app min-h-full flex flex-col md:flex-row font-sans antialiased">
        <Sidebar />
        <ActivityTracker />
        <main className="jp-main min-w-0 flex-1">
          <WorkspaceHeader />
          {children}
        </main>
      </body>
    </html>
  );
}

