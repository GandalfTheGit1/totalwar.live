import type { Metadata } from 'next';
import { MarketsTerminal } from '@/components/markets/MarketsTerminal';

export const metadata: Metadata = {
  title: 'Mercados de predicción | World Geopolitical Engine',
  description: 'Precios en vivo de Polymarket y apuestas simuladas con dinero virtual.',
};

export default function MarketsPage() {
  return <MarketsTerminal />;
}
