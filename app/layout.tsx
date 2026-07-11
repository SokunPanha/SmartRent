import type { Metadata } from 'next';
import './globals.css';
import { Baloo_2, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { RentProvider } from '@/store/rent-store';
import { QueryProvider } from '@/lib/query/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmDialogProvider } from '@/components/shared/ConfirmDialogProvider';

const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' });
const baloo2 = Baloo_2({ subsets: ['latin'], variable: '--font-heading' });
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Rental Invoice & Property Management',
  description: 'Cambodia rental invoicing and property management system',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn('font-sans', instrumentSans.variable, baloo2.variable, ibmPlexMono.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider>
              <QueryProvider>
                <RentProvider>
                  <ConfirmDialogProvider>
                    <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
                  </ConfirmDialogProvider>
                  <Toaster position="bottom-right" />
                </RentProvider>
              </QueryProvider>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
