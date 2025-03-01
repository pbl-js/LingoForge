import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { MainNavigationMenu } from '@/components/NavigationMenu/NavigationMenu';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen p-3 w-full">
      <header className="flex flex-row justify-between items-center bg-purple-900 p-3 w-full rounded-xl gap-3 mb-5">
        <MainNavigationMenu />
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      {children}
    </div>
  );
}
