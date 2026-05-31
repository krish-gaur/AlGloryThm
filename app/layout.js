import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
  title: {
    default: 'AlGloryThm - AI Automation & Business Growth',
    template: '%s | AlGloryThm',
  },
  icons: {
    icon: '/logo.png', // path to your icon file
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  description: 'AlGloryThm builds enterprise-grade AI automation, custom AI agents and intelligent SaaS platforms that drive measurable revenue growth.',
  keywords: ['AI automation', 'AI agents', 'AI consulting', 'business growth', 'SaaS development', 'workflow automation', 'AI infrastructure'],
  authors: [{ name: 'AlGloryThm' }],
  creator: 'AlGloryThm',
  openGraph: {
    type: 'website',
    title: 'AlGloryThm - AI Automation & Business Growth',
    description: 'Enterprise grade AI automation, custom AI agents and intelligent SaaS platforms.',
    siteName: 'AlGloryThm',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlGloryThm - AI Automation & Business Growth',
    description: 'Enterprise - grade AI automation, custom AI agents and intelligent SaaS platforms.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[#03050B] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
