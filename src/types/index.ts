export interface ParsedMessage {
  id: number;
  date: string;       // DD/MM/YYYY
  time: string;       // HH:MM (24h)
  timestamp: number;  // epoch ms (fuso local), usado para ordenar e filtrar
  sender: string;
  text: string;
  mediaFilename?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  isSystemMessage: boolean;
}

export interface MediaFile {
  name: string;
  type: 'image' | 'video' | 'audio' | 'file';
  /** Extrai o conteúdo sob demanda (evita descompactar o ZIP inteiro na memória). */
  load: () => Promise<Blob>;
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
  hours: number[];     // 0-23
  weekdays: number[];  // 0 (domingo) - 6 (sábado)
}

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface ParserProgress {
  phase: 'reading' | 'parsing' | 'deduplicating' | 'done';
  current: number;
  total: number;
  message: string;
}

export interface MonthCount {
  key: string;   // MM/YYYY
  count: number;
}

export interface WordCount {
  word: string;
  count: number;
}

export interface StatsData {
  totalMessages: number;
  messagesByParticipant: Record<string, number>;
  period: { start: string; end: string };
  avgMessagesPerDay: number;
  mostActiveMonth: string;
  byHour: number[];       // 24 posições
  byWeekday: number[];    // 7 posições, 0 = domingo
  byMonth: MonthCount[];  // em ordem cronológica
  topWords: WordCount[];
}
