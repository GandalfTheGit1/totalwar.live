import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'World Geopolitical Engine | Monitor 3D/2D',
  description: 'Autonomous 3D/2D World Geopolitical & Macro Engine with Tier-N, Maritime Chokepoints, Dalio Sovereign Power Radar, and HoI4/EU4 Mechanics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased overflow-x-hidden font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
