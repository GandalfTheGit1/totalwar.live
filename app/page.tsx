'use client';

import React from 'react';
import GeopoliticalMonitor from '@/components/geopolitical-monitor/GeopoliticalMonitor';

export default function HomePage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-zinc-950">
      <GeopoliticalMonitor />
    </main>
  );
}
