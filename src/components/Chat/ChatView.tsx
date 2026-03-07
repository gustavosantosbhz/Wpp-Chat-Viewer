import { useEffect, useMemo, useRef } from 'react';
import { MessageBubble, DateSeparator, getSenderColorMap } from './MessageBubble';
import type { ParsedMessage, MediaFile } from '../../types';

interface ChatViewProps {
  messages: ParsedMessage[];
  participants: string[];
  firstSender: string;
  mediaFiles: Map<string, MediaFile>;
  searchTerm: string;
  searchResults: number[];
  currentResultIndex: number;
}

type ListItem =
  | { type: 'date'; date: string; key: string }
  | { type: 'message'; message: ParsedMessage; index: number; key: string };

export function ChatView({
  messages,
  participants,
  firstSender,
  mediaFiles,
  searchTerm,
  searchResults,
  currentResultIndex,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const senderColorMap = useMemo(() => getSenderColorMap(participants), [participants]);

  // Cria items com separadores de data
  const items: ListItem[] = useMemo(() => {
    const result: ListItem[] = [];
    let currentDate = '';

    messages.forEach((msg, index) => {
      if (msg.date !== currentDate) {
        currentDate = msg.date;
        result.push({ type: 'date', date: msg.date, key: `date-${msg.date}-${index}` });
      }
      result.push({ type: 'message', message: msg, index, key: `msg-${msg.id}` });
    });

    return result;
  }, [messages]);

  const currentHighlightIndex = searchResults[currentResultIndex];

  // Scroll para o final ao carregar pela primeira vez
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (scrollRef.current && items.length > 0 && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }, 100);
    }
  }, [items.length]);

  // Scroll para resultado da busca atual
  useEffect(() => {
    if (currentHighlightIndex !== undefined && scrollRef.current) {
      const target = scrollRef.current.querySelector(
        `[data-msg-id="${currentHighlightIndex}"]`
      );
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentHighlightIndex]);

  if (items.length === 0) {
    return (
      <div className="chat-view-container">
        <div className="chat-wallpaper" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
          Nenhuma mensagem encontrada.
        </div>
      </div>
    );
  }

  return (
    <div className="chat-view-container">
      <div className="chat-wallpaper" />
      <div className="chat-list" ref={scrollRef}>
        {items.map(item => {
          if (item.type === 'date') {
            return <DateSeparator key={item.key} date={item.date} />;
          }

          const isFirst = item.message.sender === firstSender;
          const isCurrentResult = item.index === currentHighlightIndex;

          return (
            <MessageBubble
              key={item.key}
              message={item.message}
              isFirstSender={isFirst}
              senderColorMap={senderColorMap}
              mediaFiles={mediaFiles}
              searchTerm={searchTerm}
              isSearchResult={isCurrentResult}
            />
          );
        })}
      </div>
    </div>
  );
}
