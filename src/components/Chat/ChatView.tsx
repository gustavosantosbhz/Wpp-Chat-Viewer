import { useEffect, useMemo, useRef } from 'react';
import { List, useDynamicRowHeight, useListRef, type RowComponentProps } from 'react-window';
import { MessageBubble, DateSeparator } from './MessageBubble';
import { getSenderColorMap } from '../../utils/senderColors';
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
  | { type: 'message'; message: ParsedMessage; key: string };

interface RowProps {
  items: ListItem[];
  firstSender: string;
  senderColorMap: Map<string, string>;
  mediaFiles: Map<string, MediaFile>;
  searchTerm: string;
  highlightedMessageId: number | undefined;
}

function ChatRow({
  index,
  style,
  items,
  firstSender,
  senderColorMap,
  mediaFiles,
  searchTerm,
  highlightedMessageId,
}: RowComponentProps<RowProps>) {
  const item = items[index];

  return (
    <div style={style} className="chat-row">
      {item.type === 'date' ? (
        <DateSeparator date={item.date} />
      ) : (
        <MessageBubble
          message={item.message}
          isFirstSender={item.message.sender === firstSender}
          senderColorMap={senderColorMap}
          mediaFiles={mediaFiles}
          searchTerm={searchTerm}
          isSearchResult={item.message.id === highlightedMessageId}
        />
      )}
    </div>
  );
}

export function ChatView({
  messages,
  participants,
  firstSender,
  mediaFiles,
  searchTerm,
  searchResults,
  currentResultIndex,
}: ChatViewProps) {
  const listRef = useListRef(null);
  const senderColorMap = useMemo(() => getSenderColorMap(participants), [participants]);

  // Linhas da lista (separadores de data + mensagens) e índice mensagem → linha
  const { items, messageRows } = useMemo(() => {
    const rows: ListItem[] = [];
    const messageRows: number[] = [];
    let currentDate = '';

    for (const msg of messages) {
      if (msg.date !== currentDate) {
        currentDate = msg.date;
        rows.push({ type: 'date', date: msg.date, key: `date-${msg.date}-${msg.id}` });
      }
      messageRows.push(rows.length);
      rows.push({ type: 'message', message: msg, key: `msg-${msg.id}` });
    }

    return { items: rows, messageRows };
  }, [messages]);

  // Alturas variam (texto, mídia): medidas na renderização e descartadas ao trocar a lista
  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 64,
    key: `${items.length}:${messages[0]?.id}:${messages.at(-1)?.id}`,
  });

  const highlightedMessageIndex = searchResults[currentResultIndex];
  const highlightedMessageId =
    highlightedMessageIndex === undefined ? undefined : messages[highlightedMessageIndex]?.id;

  // Rola para o fim ao carregar pela primeira vez
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (items.length === 0 || hasScrolledRef.current) return;
    hasScrolledRef.current = true;
    const scrollToEnd = () =>
      listRef.current?.scrollToRow({ index: items.length - 1, align: 'end', behavior: 'instant' });
    scrollToEnd();
    // Alturas reais só são conhecidas após a primeira medição
    const timer = setTimeout(scrollToEnd, 150);
    return () => clearTimeout(timer);
  }, [items.length, listRef]);

  // Rola até o resultado atual da busca
  useEffect(() => {
    if (highlightedMessageIndex === undefined) return;
    listRef.current?.scrollToRow({
      index: messageRows[highlightedMessageIndex],
      align: 'center',
      behavior: 'instant',
    });
  }, [highlightedMessageIndex, messageRows, listRef]);

  if (items.length === 0) {
    return (
      <div className="chat-view-container">
        <div className="chat-wallpaper" />
        <div className="chat-empty">Nenhuma mensagem encontrada.</div>
      </div>
    );
  }

  return (
    <div className="chat-view-container">
      <div className="chat-wallpaper" />
      <List
        className="chat-list"
        listRef={listRef}
        rowComponent={ChatRow}
        rowCount={items.length}
        rowHeight={rowHeight}
        rowProps={{ items, firstSender, senderColorMap, mediaFiles, searchTerm, highlightedMessageId }}
        overscanCount={8}
      />
    </div>
  );
}
