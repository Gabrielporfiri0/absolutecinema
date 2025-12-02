'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoWatchModal from './VideoWatchModal';

type Props = {
  filmId: string | number;
  className?: string;
  children?: React.ReactNode;
  videoSrc?: string; // optional source for the modal video
};

const LOCAL_KEY = 'watched_reservation_video_v1';

export default function ReserveButtonGuard({ filmId, className, children, videoSrc }: Props) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const watched = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_KEY) === 'true' : false;
 

  const goToSeatPicker = () => {
    router.push(`/filme/${filmId}`);
  };

  const handleClick = (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (watched) {
      goToSeatPicker();
      return;
    }

    // open the modal for the first-time watch
    setOpenModal(true);
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children ?? 'Reservar Assento'}
      </button>

      <VideoWatchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        videoSrc={videoSrc || 'https://www.youtube.com/watch?v=a3ICNMQW7Ok'}
        onComplete={() => {
          // mark as watched then navigate
          try { localStorage.setItem(LOCAL_KEY, 'true'); } catch (err) {}
          setOpenModal(false);
          goToSeatPicker();
        }}
      />
    </>
  );
}
