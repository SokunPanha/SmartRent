import type { Metadata } from 'next';
import './globals.css';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AccentProvider } from '@/components/theme/accent-provider';
import { RentProvider } from '@/store/rent-store';
import { QueryProvider } from '@/lib/query/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmDialogProvider } from '@/components/shared/ConfirmDialogProvider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({
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
      className={cn('font-sans', geist.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved accent before paint to avoid a color flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var a=localStorage.getItem('tt-accent');document.documentElement.setAttribute('data-accent',(a==='navy'||a==='amethyst')?a:'red');}catch(e){document.documentElement.setAttribute('data-accent','red');}})();",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AccentProvider>
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
            </AccentProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
