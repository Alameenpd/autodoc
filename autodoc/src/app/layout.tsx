'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import './globals.css';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <header className="bg-blue-600 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">Docs Builder</Link>
              <ul className="flex space-x-4 items-center">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li><Link href="/projects" className="hover:underline">Projects</Link></li>
                {/* Add login/logout buttons here if needed */}
              </ul>
            </nav>
          </header>
          <main className="container mx-auto mt-8 px-4">
            {children}
          </main>
          <footer className="bg-gray-200 mt-8 py-4">
            <div className="container mx-auto text-center">
              © 2024 Automated Internal Docs Builder
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}