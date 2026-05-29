'use client';

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
  const lastValidTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detecta se é YouTube
  useEffect(() => {
    if (!videoSrc) return setIsYouTube(false);
    const lower = videoSrc.toLowerCase();
    setIsYouTube(lower.includes('youtube.com') || lower.includes('youtu.be'));
  }, [videoSrc]);

  // Bloqueia teclas de avanço globalmente
  const blockKeyboardSeek = (e: KeyboardEvent) => {
    const blockedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Limpa o player e intervalos
  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playerRef.current?.destroy) {
      try { playerRef.current.destroy(); } catch (e) {}
    }
    playerRef.current = null;
    document.removeEventListener('keydown', blockKeyboardSeek);
  };

  // Fecha o modal de forma segura (se necessário, pode impedir antes do término)
  const handleClose = () => {
    // Opcional: só permite fechar se o vídeo terminou
    // if (playerRef.current && playerRef.current.getCurrentTime?.() < playerRef.current.getDuration?.() - 0.5) {
    //   alert('Assista o vídeo até o fim para continuar.');
    //   return;
    // }
    cleanup();
    onClose();
  };

  // ==================== YOUTUBE PLAYER ====================
  const initYouTubePlayer = (videoId: string) => {
    if (!containerRef.current) return;

    const createPlayer = () => {
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,         // remove barra de progresso e botões
          disablekb: 1,        // desabilita atalhos do teclado
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,               // desabilita tela cheia (evita acesso a controles)
          cc_load_policy: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            lastValidTimeRef.current = 0;
            // Monitora saltos no tempo
            intervalRef.current = setInterval(() => {
              if (!playerRef.current) return;
              const current = playerRef.current.getCurrentTime();
              const state = playerRef.current.getPlayerState();
              // Se o tempo avançou mais que 0.3s e o vídeo está reproduzindo (state=1)
              if (current - lastValidTimeRef.current > 0.3 && state === 1) {
                playerRef.current.seekTo(lastValidTimeRef.current, true);
              } else {
                lastValidTimeRef.current = current;
              }
            }, 200);
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              cleanup();
              onComplete();
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  };

  // ==================== HTML5 VIDEO ====================
  const initHtml5Video = () => {
    const video = videoRef.current;
    if (!video) return;

    // Remove controles nativos
    video.controls = false;
    video.autoplay = true;

    // Impede seek via evento 'seeking'
    const handleSeeking = () => {
      if (video.currentTime > lastValidTimeRef.current + 0.3) {
        video.currentTime = lastValidTimeRef.current;
      } else {
        lastValidTimeRef.current = video.currentTime;
      }
    };

    // Monitora timeupdate para detectar pulos não autorizados
    const handleTimeUpdate = () => {
      if (video.currentTime > lastValidTimeRef.current + 0.3) {
        video.currentTime = lastValidTimeRef.current;
      } else {
        lastValidTimeRef.current = video.currentTime;
      }
    };

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', () => {
      cleanup();
      onComplete();
    });

    // Previne clique com botão direito (menu de contexto)
    const preventContextMenu = (e: Event) => e.preventDefault();
    video.addEventListener('contextmenu', preventContextMenu);

    // Força o início
    video.play().catch(e => console.log('Autoplay bloqueado?', e));

    // Limpeza
    const cleanupVideo = () => {
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', () => {});
      video.removeEventListener('contextmenu', preventContextMenu);
    };
    return cleanupVideo;
  };

  // Efeito principal: carrega o player quando o modal abre
  useEffect(() => {
    if (!open) {
      cleanup();
      return;
    }

    document.addEventListener('keydown', blockKeyboardSeek);

    if (isYouTube && videoSrc) {
      const extractVideoId = (url: string) => {
        try {
          const u = new URL(url);
          if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
          if (u.searchParams.has('v')) return u.searchParams.get('v');
          const parts = u.pathname.split('/');
          return parts[parts.length - 1];
        } catch {
          return null;
        }
      };
      const id = extractVideoId(videoSrc);
      if (id) initYouTubePlayer(id);
    } else if (!isYouTube && videoSrc) {
      // Força recriação do elemento de vídeo
      if (videoRef.current) {
        videoRef.current.src = videoSrc;
        videoRef.current.load();
        const cleanupVideo = initHtml5Video();
        return cleanupVideo;
      }
    }

    return cleanup;
  }, [open, isYouTube, videoSrc]);

  // Ao fechar, pausa e reseta o vídeo
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="relative w-full max-w-3xl bg-linear-to-b from-indigo-900/90 via-gray-800/70 to-black/80 rounded-xl border border-white/5 p-6 shadow-2xl">
        <h3 className="text-center text-2xl font-semibold text-white mb-4">
          Assista o vídeo abaixo para concluir a reserva
        </h3>

        <div className="mx-auto w-full max-w-2xl aspect-video bg-black rounded-md overflow-hidden border border-white/10 p-2">
          {isYouTube && videoSrc ? (
            <div ref={containerRef} className="w-full h-full" />
          ) : (
            <video
              ref={videoRef}
              src={videoSrc || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'}
              autoPlay
              className="w-full h-full object-cover rounded"
            />
          )}
        </div>

        <div className="mt-4">
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-gray-200/90 bg-linear-to-r from-indigo-800/40 via-gray-700/20 to-black/0 px-4 py-3 rounded-lg border border-white/5 shadow-inner">
            <strong className="block text-lg text-white font-semibold mb-1">
              Importante - assista o vídeo até o fim
            </strong>
            O vídeo precisa ser assistido completamente para concluir a validação. Assim que o playback terminar você será redirecionado automaticamente para a seleção de assentos.
          </p>
        </div>

        {/* Botão de fechar opcional (se quiser permitir, mesmo antes do fim) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white bg-black/30 rounded-full p-1"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

VideoWatchModal.displayName = 'VideoWatchModal';