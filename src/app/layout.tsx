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

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Check if it's a messaging-related error
    if (event.reason && typeof event.reason === 'object' &&
        event.reason.message &&
        (event.reason.message.includes('message channel closed') ||
         event.reason.message.includes('asynchronous response'))) {
      console.warn('Caught messaging-related error (likely from browser extension):', event.reason);
      event.preventDefault(); // Prevent the error from being logged as unhandled
      return;
    }

    // For other errors, log them but don't prevent default behavior
    console.error('Unhandled promise rejection:', event.reason);
  });
}

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
