import React from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface VideoBriefingSectionProps {
  videosLoading: boolean;
  videosError: string | null;
  countryVideos: any[];
  selectedVideoIndex: number;
  setSelectedVideoIndex: (idx: number) => void;
  activeData: any;
}

export function VideoBriefingSection({
  videosLoading,
  videosError,
  countryVideos,
  selectedVideoIndex,
  setSelectedVideoIndex,
  activeData
}: VideoBriefingSectionProps) {
  return (
    <div>
      <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2 font-bold font-mono">
        <ShieldAlert className="w-4 h-4 text-teal-400" /> Inteligencia Macro &amp; Video Briefing
      </h4>
      
      {videosLoading && (
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 aspect-video flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-teal-400 animate-spin mb-2" />
          <span className="text-xs text-zinc-500 font-mono">Buscando reportes sobre {activeData?.name}...</span>
        </div>
      )}

      {!videosLoading && videosError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400 font-mono">
          Error: {videosError}
        </div>
      )}

      {!videosLoading && !videosError && countryVideos.length === 0 && activeData && (
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-6 text-center text-xs text-zinc-500 font-mono">
          No se encontraron videos recientes (último año) sobre la situación económica de {activeData.name}.
        </div>
      )}

      {!videosLoading && !videosError && countryVideos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-zinc-700/80 shadow-lg bg-black aspect-video relative">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${countryVideos[selectedVideoIndex].id}`}
              title={countryVideos[selectedVideoIndex].title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {countryVideos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 snap-x">
              {countryVideos.map((video, idx) => (
                <div 
                  key={video.id}
                  onClick={() => setSelectedVideoIndex(idx)}
                  className={`relative shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer snap-start transition-all ${
                    idx === selectedVideoIndex ? 'border-teal-400 scale-95 opacity-100' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 pt-4">
                    <p className="text-[9px] text-white font-bold leading-tight line-clamp-2">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
