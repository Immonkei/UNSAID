import type { Metadata } from 'next';
import { Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
    'An anonymous sanctuary for the unspoken thoughts, feelings, confessions, and regrets we carry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${serifFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#09090b] text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-neutral-100 relative overflow-x-hidden">
        {/* Ambient Subtle Background Lighting / Glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-blue-950/20 via-indigo-950/10 to-transparent blur-[120px] rounded-full" />
          <div className="absolute top-[600px] -left-40 w-[500px] h-[350px] bg-rose-950/10 blur-[130px] rounded-full" />
          <div className="absolute top-[1200px] -right-40 w-[500px] h-[350px] bg-blue-950/10 blur-[130px] rounded-full" />
          {/* Subtle Film Grain / Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
