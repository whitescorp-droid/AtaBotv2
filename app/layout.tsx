import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Atatürk ile Röportaj',
  description: 'Kurtuluş Savaşı dönemi hakkında bilgi veren eğitim chatbotu.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans text-[#e2e2e2] bg-[#0a0a0b] h-screen overflow-hidden antialiased flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
