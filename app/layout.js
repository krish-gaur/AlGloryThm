import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
  title: {
    default: 'AiGlo - AI Automation & Business Growth',
    template: '%s | AiGlo',
  },
  icons: {
    icon: '/logo.png', // path to your icon file
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  description: 'AiGlo builds enterprise-grade AI automation, custom AI agents and intelligent SaaS platforms that drive measurable revenue growth.',
  keywords: ['AI automation', 'AI agents', 'AI consulting', 'business growth', 'SaaS development', 'workflow automation', 'AI infrastructure'],
  authors: [{ name: 'AiGlo' }],
  creator: 'AiGlo',
  openGraph: {
    type: 'website',
    title: 'AiGlo - AI Automation & Business Growth',
    description: 'Enterprise grade AI automation, custom AI agents and intelligent SaaS platforms.',
    siteName: 'AiGlo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AiGlo - AI Automation & Business Growth',
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
