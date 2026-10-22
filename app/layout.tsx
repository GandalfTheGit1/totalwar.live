import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'World Geopolitical Engine | Monitor 3D/2D',
  description: 'Autonomous 3D/2D World Geopolitical & Macro Engine with Tier-N, Maritime Chokepoints, Dalio Sovereign Power Radar, and HoI4/EU4 Mechanics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WJQSZBCK';
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased overflow-x-hidden font-sans">
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        <Providers>
          {children}
        </Providers>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
    </html>
  );
}
