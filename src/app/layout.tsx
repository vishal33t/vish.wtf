import type { Metadata } from 'next';
import IntroController from '@/components/IntroController';
import '@fontsource-variable/bricolage-grotesque/wdth.css';
import World3D from '@/components/World3D';
import './globals.css';

export const metadata: Metadata = { title: 'Vishal Singh · vish.wtf', description: 'Portfolio of Vishal Singh, Full Stack Developer.' };

// Runs before paint so returning visitors in the same session never see the intro overlay.
const pre = `try{if(sessionStorage.getItem('vish-intro-played'))document.documentElement.dataset.intro='done'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: pre }} /><noscript><style>{'.intro-root{display:none!important}'}</style></noscript></head>
      <body><World3D /><IntroController />{children}</body>
    </html>
  );
}
