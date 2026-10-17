import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function updateTension() {
  const MATRIX_PATH = path.join(process.cwd(), 'lib/data/geopolitical-global-matrix.json');
  const CACHE_PATH = path.join(process.cwd(), 'lib/data/country-tension-cache.json');
  
  let matrixData;
  try {
    const rawMatrix = await fs.readFile(MATRIX_PATH, 'utf-8');
    matrixData = JSON.parse(rawMatrix);
  } catch (e) {
    return;
  }

  let cache: any = {};
  try {
    const rawCache = await fs.readFile(CACHE_PATH, 'utf-8');
    cache = JSON.parse(rawCache);
  } catch (e) {
    cache = {};
  }

  const nodes = matrixData.nodes || [];
  
  for (const node of nodes) {
    const iso2 = node.code || node.iso2;
    if (!iso2) continue;
    try {
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=conflict%20war%20location:${iso2}&mode=artlist&maxrecords=10&timespan=30d&format=json`;
      const res = await fetch(url);
      if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 90000)); // double delay
      } else if (res.ok) {
        const data = await res.json();
        const tensionIndex = data.articles?.length ? data.articles.length * 10 : 0;
        cache[iso2] = { tensionIndex: Math.min(tensionIndex, 100), lastUpdated: new Date().toISOString() };
      }
    } catch(e) {}
    
    await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
    await new Promise(resolve => setTimeout(resolve, 45000)); // 45s delay
  }
}

export async function GET() {
  updateTension().catch(console.error);
  return NextResponse.json({ message: 'Tension update started. Will take ~34 minutes.' });
}
