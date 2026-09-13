import type { Metadata } from 'next';
import { Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

export const metadata: Metadata = {
  title: 'UNSAID — Say What You Can’t Say',
  description:
    'An anonymous cinematic sanctuary for the unspoken thoughts, midnight confessions, and quiet regrets we carry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${serifFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#050507] text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-neutral-100 relative overflow-x-hidden">
        {/* Cinematic Melancholic Atmosphere & Vignette */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top midnight glow */}
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-gradient-to-b from-indigo-950/25 via-blue-950/15 to-transparent blur-[140px] rounded-full" />
          {/* Deep violet emotional haze */}
          <div className="absolute top-[45%] -left-48 w-[600px] h-[500px] bg-purple-950/10 blur-[160px] rounded-full" />
          {/* Subtle warm heartbreak ember */}
          <div className="absolute top-[75%] -right-48 w-[550px] h-[450px] bg-rose-950/10 blur-[150px] rounded-full" />
          {/* Melancholic film grid & vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_60%,transparent_100%)] opacity-80" />
        </div>

        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          {children}
        </main>
        <Footer />

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
