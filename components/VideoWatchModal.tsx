'use client'

import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  videoSrc?: string;
};

export default function VideoWatchModal({ open, onClose, onComplete, videoSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isYouTube, setIsYouTube] = useState(false);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    }
  }, [open]);

  useEffect(() => {
    if (!videoSrc) return setIsYouTube(false);
    const lower = videoSrc.toLowerCase();
    setIsYouTube(lower.includes('youtube.com') || lower.includes('youtu.be'));
  }, [videoSrc]);

  useEffect(() => {
    if (!isYouTube || !open || !videoSrc || !containerRef.current) return;

    let mounted = true;

    const extractVideoId = (url: string) => {
      try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) {
          return u.pathname.slice(1);
        }
        if (u.searchParams.has('v')) return u.searchParams.get('v');
        const parts = u.pathname.split('/');
        return parts[parts.length - 1];
      } catch (e) {
        return null;
      }
    };

    const createPlayer = (id: string) => {
      try {
        if ((window as any).YT && (window as any).YT.Player) {
          playerRef.current = new (window as any).YT.Player(containerRef.current, {
            width: '100%',
            height: '100%',
            videoId: id,
            playerVars: { autoplay: 1, controls: 1, rel: 0, enablejsapi: 1 },
            events: {
              onStateChange: (e: any) => {
                if (e.data === 0) {
                  onComplete();
                }
              }
            }
          });
        } else {
          (window as any).onYouTubeIframeAPIReady = function () {
            if (!mounted) return;
            playerRef.current = new (window as any).YT.Player(containerRef.current, {
              width: '100%',
              height: '100%',
              videoId: id,
              playerVars: { autoplay: 1, controls: 1, rel: 0, enablejsapi: 1 },
              events: {
                onStateChange: (e: any) => {
                  if (e.data === 0) onComplete();
                }
              }
            });
          };
        }
      } catch (err) {
        console.error('Failed creating YT player', err);
      }
    };

    const id = extractVideoId(videoSrc);
    if (!id) return;

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag || null);
    }

    createPlayer(id);

    return () => {
      mounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
      playerRef.current = null;
    };
  }, [isYouTube, open, videoSrc, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-indigo-900/90 via-gray-800/70 to-black/80 rounded-xl border border-white/5 p-6 shadow-2xl">
        <h3 className="text-center text-2xl font-semibold text-white mb-4">Assista o vídeo abaixo para concluir a reserva</h3>

        <div className="mx-auto w-full max-w-2xl aspect-video bg-black rounded-md overflow-hidden border border-white/10 p-2">
          {isYouTube && videoSrc ? (
            <div ref={containerRef} className="w-full h-full" />
          ) : (
            <video
              ref={videoRef}
              src={videoSrc || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'}
              controls
              autoPlay
              className="w-full h-full object-cover rounded"
              onEnded={() => {
                onComplete();
              }}
            />
          )}
        </div>

        <div className="mt-4">
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-gray-200/90 bg-gradient-to-r from-indigo-800/40 via-gray-700/20 to-black/0 px-4 py-3 rounded-lg border border-white/5 shadow-inner">
            <strong className="block text-lg text-white font-semibold mb-1">Importante — assista até o fim</strong>
            O vídeo precisa ser assistido completamente para concluir a validação. Assim que o playback terminar você será redirecionado automaticamente para a seleção de assentos.
          </p>
        </div>
      </div>
    </div>
  );
}

VideoWatchModal.displayName = 'VideoWatchModal';
