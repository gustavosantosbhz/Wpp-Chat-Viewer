import { useEffect, useState } from 'react';
import type { MediaFile } from '../../types';

/** Carrega a mídia só quando a bolha é renderizada e libera a URL ao sair da tela. */
export function MediaView({ media }: { media: MediaFile }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    media
      .load()
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [media]);

  if (!url) {
    return <div className="msg-media-placeholder">{failed ? '⚠️' : '⏳'} {media.name}</div>;
  }

  switch (media.type) {
    case 'image':
      return <img src={url} alt={media.name} className="msg-media-image" />;
    case 'video':
      return <video src={url} controls className="msg-media-video" preload="metadata" />;
    case 'audio':
      return (
        <div className="msg-media-audio">
          <audio src={url} controls preload="metadata" />
        </div>
      );
    default:
      return (
        <a href={url} download={media.name} className="msg-media-file">
          📎 {media.name}
        </a>
      );
  }
}
