export interface ParsedMessage {
  id: number;
  date: string;       // DD/MM/YYYY
  time: string;       // HH:MM
  sender: string;
  text: string;
  mediaFilename?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  isSystemMessage: boolean;
}

export interface MediaFile {
  name: string;
  blob: Blob;
  url: string;
  type: 'image' | 'video' | 'audio' | 'file';
}

export interface ChatData {
  messages: ParsedMessage[];
  participants: string[];
  dateStart: string;
  dateEnd: string;
  totalMessages: number;
  mediaFiles: Map<string, MediaFile>;
  firstSender: string;
}

export interface FilterState {
  searchTerm: string;
  senders: string[];
  dateStart: string;
  dateEnd: string;
  contentTypes: ContentType[];
}

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface ParserProgress {
  phase: 'reading' | 'parsing' | 'deduplicating' | 'done';
  current: number;
  total: number;
  message: string;
}

export interface StatsData {
  totalMessages: number;
  messagesByParticipant: Record<string, number>;
  period: { start: string; end: string };
  avgMessagesPerDay: number;
  mostActiveMonth: string;
}
