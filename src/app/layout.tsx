import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  ClerkProvider,
  RedirectToSignIn,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import './globals.css';
import Link from 'next/link';
import { routes } from '@/consts/routes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-purple-950`}
        >
          <div className="flex flex-col min-h-screen p-3">
            <header className="flex flex-row justify-between items-center bg-purple-900 p-3 w-full rounded-xl gap-3 mb-5">
              <Link
                className="inline-flex items-center justify-center rounded-md text-base font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-900 text-slate-50 hover:bg-purple-950 h-10 px-4 py-2"
                href={routes.wordList}
              >
                Words List
              </Link>
              <SignedOut>
                <RedirectToSignIn />
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
