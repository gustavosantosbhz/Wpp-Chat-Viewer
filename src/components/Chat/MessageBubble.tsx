import { memo, useMemo } from 'react';
import { formatWhatsAppText } from '../../utils/formatters';
import { getMediaCaption } from '../../utils/parser';
import { SENDER_COLORS } from '../../utils/senderColors';
import { MediaView } from './MediaView';
import type { ParsedMessage, MediaFile } from '../../types';

interface MessageBubbleProps {
  message: ParsedMessage;
  isFirstSender: boolean;
  senderColorMap: Map<string, string>;
  mediaFiles: Map<string, MediaFile>;
  searchTerm?: string;
  isSearchResult?: boolean;
}

const MEDIA_ICONS = { image: '📷', video: '🎥', audio: '🎵', file: '📎' } as const;

export const MessageBubble = memo(function MessageBubble({
  message,
  isFirstSender,
  senderColorMap,
  mediaFiles,
  searchTerm,
  isSearchResult,
}: MessageBubbleProps) {
  // Texto exibido: legenda quando há mídia, texto completo caso contrário
  const displayText = message.mediaFilename ? getMediaCaption(message.text) : message.text;

  const formattedText = useMemo(
    () => formatWhatsAppText(displayText, searchTerm),
    [displayText, searchTerm]
  );

  if (message.isSystemMessage) {
    return (
      <div className="msg-system">
        <span className="msg-system-text">{message.text}</span>
      </div>
    );
  }

  const senderColor = senderColorMap.get(message.sender) || SENDER_COLORS[0];
  const mediaFile = message.mediaFilename ? mediaFiles.get(message.mediaFilename) : undefined;

  return (
    <div
      className={`msg-bubble-wrapper ${isFirstSender ? 'msg-bubble-wrapper--right' : 'msg-bubble-wrapper--left'}`}
      data-msg-id={message.id}
    >
      <div
        className={`msg-bubble ${isFirstSender ? 'msg-bubble--right' : 'msg-bubble--left'} ${isSearchResult ? 'msg-bubble--highlight' : ''}`}
      >
        <div className="msg-sender" style={{ color: senderColor }}>
          {message.sender}
        </div>

        {mediaFile && (
          <div className="msg-media">
            <MediaView media={mediaFile} />
          </div>
        )}

        {/* Mídia citada no chat mas ausente do ZIP */}
        {message.mediaFilename && !mediaFile && (
          <div className="msg-media-placeholder">
            {MEDIA_ICONS[message.mediaType ?? 'file']} {message.mediaFilename}
          </div>
        )}

        {displayText && (
          <div className="msg-text" dangerouslySetInnerHTML={{ __html: formattedText }} />
        )}

        <div className="msg-time">{message.time}</div>
      </div>
    </div>
  );
});

export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="date-separator">
      <span className="date-separator-text">{date}</span>
    </div>
  );
}
