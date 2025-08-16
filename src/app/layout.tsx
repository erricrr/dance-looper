import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Rubik, Changa } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rubik',
});

const changa = Changa({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-changa',
});

export const metadata: Metadata = {
  title: 'Dalooper',
  description: 'Turn YouTube into your personal tutor — one loop at a time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rubik.variable} ${changa.variable} dark`}>
      <head />
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
