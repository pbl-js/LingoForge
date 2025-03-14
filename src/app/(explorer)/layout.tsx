import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { MainNavigationMenu } from "@/components/NavigationMenu/NavigationMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col p-3">
      <header className="mb-5 flex w-full flex-row items-center justify-between gap-3 rounded-xl bg-purple-900 p-3">
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
