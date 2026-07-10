import type { Metadata } from 'next';
import './globals.css';
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { RentProvider } from '@/store/rent-store';
import { QueryProvider } from '@/lib/query/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-heading' });
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

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
    <html
      lang="en"
      className={cn('font-sans', instrumentSans.variable, fraunces.variable, ibmPlexMono.variable)}
      suppressHydrationWarning
    >
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
