import type { Metadata, Viewport } from 'next';
import { Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SerendipityModal from '../components/SerendipityModal';
import { Toaster } from 'sonner';

const serifFont = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#08090d',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://unsaidthoughts.vercel.app'),
  title: {
    default: 'UNSAID — Say What You Can’t Say',
    template: '%s | UNSAID',
  },
  description:
    'An anonymous sanctuary for the unspoken thoughts, midnight confessions, and quiet regrets we carry.',
  keywords: [
    'anonymous thoughts',
    'unsaid feelings',
    'confessions',
    'emotional archive',
    'midnight thoughts',
    'unsaid words',
  ],
  authors: [{ name: 'Anonymous' }],
  openGraph: {
    title: 'UNSAID — Say What You Can’t Say',
    description:
      'An anonymous sanctuary for the unspoken thoughts, midnight confessions, and quiet regrets we carry.',
    url: 'https://unsaidthoughts.vercel.app',
    siteName: 'UNSAID',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UNSAID — Say What You Can’t Say',
    description:
      'An anonymous sanctuary for the unspoken thoughts, midnight confessions, and quiet regrets we carry.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${serifFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#08090d] text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-neutral-100 relative overflow-x-hidden">
        {/* Midnight Aurora Atmosphere & Vignette */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Dusty-Blue / Cyan Aurora Drifter */}
          <div className="animate-aurora-1 absolute -top-40 left-1/3 w-[800px] h-[520px] bg-gradient-to-br from-[#7C99B8]/25 via-indigo-900/20 to-transparent blur-[130px] rounded-full" />

          {/* Deep Twilight Indigo Aurora */}
          <div className="animate-aurora-2 absolute top-[35%] -left-36 w-[680px] h-[580px] bg-gradient-to-tr from-blue-950/30 via-indigo-950/25 to-purple-950/20 blur-[150px] rounded-full" />

          {/* Subtle Warm Violet Emotional Glow */}
          <div className="animate-aurora-3 absolute top-[65%] -right-36 w-[640px] h-[520px] bg-gradient-to-bl from-purple-950/20 via-slate-900/30 to-indigo-950/20 blur-[140px] rounded-full" />

          {/* Melancholic film grid, grain & vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,7,10,0.85)_100%)]" />
          <div className="absolute inset-0 film-grain opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_15%,#000_65%,transparent_100%)] opacity-90" />
        </div>

        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          {children}
        </main>
        <Footer />

        {/* Global Serendipity Floating Quick Discover */}
        <SerendipityModal />

        {/* Global Cinematic Toast Provider */}
        <Toaster
          position="bottom-center"
          theme="dark"
          toastOptions={{
            className:
              '!rounded-2xl !border !border-neutral-800/90 !bg-neutral-900/95 !backdrop-blur-xl !text-neutral-100 !text-xs !shadow-2xl !font-sans',
          }}
        />
      </body>
    </html>
  );
}
