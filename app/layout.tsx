import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { RentProvider } from '@/store/rent-store';
import { QueryProvider } from '@/lib/query/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Rental Invoice & Property Management',
  description: 'Cambodia rental invoicing and property management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              <RentProvider>
                <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
                <Toaster position="bottom-right" />
              </RentProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
