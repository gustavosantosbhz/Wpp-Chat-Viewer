import { useMemo } from 'react';
import { formatWhatsAppText } from '../../utils/formatters';
import type { ParsedMessage, MediaFile } from '../../types';

// Paleta de cores por remetente
const SENDER_COLORS = [
  '#00a884', '#53bdeb', '#e9a740', '#e96c6c', '#b980f0',
  '#f06292', '#4dd0e1', '#aed581', '#ff8a65', '#7986cb',
  '#ce93d8', '#80cbc4', '#ffb74d', '#a1887f', '#90a4ae',
];

interface MessageBubbleProps {
  message: ParsedMessage;
  isFirstSender: boolean;
  senderColorMap: Map<string, string>;
  mediaFiles: Map<string, MediaFile>;
  searchTerm?: string;
  isSearchResult?: boolean;
}

export function MessageBubble({
  message,
  isFirstSender,
  senderColorMap,
  mediaFiles,
  searchTerm,
  isSearchResult,
}: MessageBubbleProps) {
  if (message.isSystemMessage) {
    return (
      <div className="msg-system">
        <span className="msg-system-text">{message.text}</span>
      </div>
    );
  }

  const senderColor = senderColorMap.get(message.sender) || SENDER_COLORS[0];

  const formattedText = useMemo(() => {
    let text = formatWhatsAppText(message.text);

    // Highlight de busca
    if (searchTerm) {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      text = text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    return text;
  }, [message.text, searchTerm]);

  const mediaFile = message.mediaFilename ? mediaFiles.get(message.mediaFilename) : null;

  // Texto da mensagem sem o padrão de mídia
  const cleanText = useMemo(() => {
    if (!message.mediaFilename) return message.text;
    // Remove o padrão de mídia do texto para exibir apenas o caption
    return message.text
      .replace(/.*?\s*\(arquivo omitido\)/, '')
      .replace(/.*?\s*\(arquivo anexado\)/, '')
      .replace(/.*?\s*\(file attached\)/, '')
      .replace(/<Mídia oculta>/, '')
      .replace(/<Media omitted>/, '')
      .trim();
  }, [message.text, message.mediaFilename]);

  return (
    <div
      className={`msg-bubble-wrapper ${isFirstSender ? 'msg-bubble-wrapper--right' : 'msg-bubble-wrapper--left'}`}
      data-msg-id={message.id}
    >
      <div
        className={`msg-bubble ${isFirstSender ? 'msg-bubble--right' : 'msg-bubble--left'} ${isSearchResult ? 'msg-bubble--highlight' : ''}`}
      >
        {/* Nome do remetente */}
        <div className="msg-sender" style={{ color: senderColor }}>
          {message.sender}
        </div>

        {/* Mídia */}
        {mediaFile && (
          <div className="msg-media">
            {mediaFile.type === 'image' && (
              <img
                src={mediaFile.url}
                alt={mediaFile.name}
                className="msg-media-image"
                loading="lazy"
              />
            )}
            {mediaFile.type === 'video' && (
              <video
                src={mediaFile.url}
                controls
                className="msg-media-video"
                preload="metadata"
              />
            )}
            {mediaFile.type === 'audio' && (
              <div className="msg-media-audio">
                <audio src={mediaFile.url} controls preload="metadata" />
              </div>
            )}
            {mediaFile.type === 'file' && (
              <a href={mediaFile.url} download={mediaFile.name} className="msg-media-file">
                📎 {mediaFile.name}
              </a>
            )}
          </div>
        )}

        {/* Texto indicando mídia omitida (sem arquivo disponível) */}
        {message.mediaFilename && !mediaFile && (
          <div className="msg-media-placeholder">
            {message.mediaType === 'image' && '📷'}
            {message.mediaType === 'video' && '🎥'}
            {message.mediaType === 'audio' && '🎵'}
            {message.mediaType === 'file' && '📎'}
            {!message.mediaType && '📎'}
            {' '}{message.mediaFilename}
          </div>
        )}

        {/* Texto / Caption da mensagem */}
        {cleanText && (
          <div
            className="msg-text"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )}

        {/* Texto sem mídia */}
        {!message.mediaFilename && !cleanText && (
          <div
            className="msg-text"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )}

        {/* Horário */}
        <div className="msg-time">{message.time}</div>
      </div>
    </div>
  );
}

export function getSenderColorMap(participants: string[]): Map<string, string> {
  const map = new Map<string, string>();
  participants.forEach((name, index) => {
    map.set(name, SENDER_COLORS[index % SENDER_COLORS.length]);
  });
  return map;
}

export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="date-separator">
      <span className="date-separator-text">{date}</span>
    </div>
  );
}
