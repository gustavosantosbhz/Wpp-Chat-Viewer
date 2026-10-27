import type { ParsedMessage } from '../types';

// Marcas invisíveis (LRM/RLM/embeddings) que o WhatsApp injeta nas exportações
const INVISIBLE_CHARS = /[‎‏‪-‮]/g;

// Cabeçalho de mensagem, Android e iOS:
//   Android: 31/12/2023 23:59 - resto        |  12/31/23, 11:59 PM - resto
//   iOS:     [31/12/2023 23:59:59] resto     |  [12/31/23, 11:59:59 PM] resto
const HEADER_REGEX =
  /^\[?(\d{1,2})[/.](\d{1,2})[/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*([AaPp])\.?\s?[Mm]\.?)?(?:\]\s*|\s+-\s+)(.*)$/;

// "Remetente: texto". Sem ":" o conteúdo é mensagem de sistema.
const SENDER_REGEX = /^([^:]{1,100}?):\s([\s\S]*)$/;

// Mídia com nome de arquivo (Android pt/en e iOS pt/en)
const MEDIA_FILE_REGEXES = [
  /^(.+?)\s*\((?:arquivo anexado|file attached|arquivo omitido)\)/,
  /^<(?:anexado|attached):\s*(.+?)>/,
];
// Mídia sem nome de arquivo
const MEDIA_HIDDEN_REGEX = /^<(?:Mídia oculta|Media omitted)>/;

export type MediaType = NonNullable<ParsedMessage['mediaType']>;

export function detectMediaType(filename: string): MediaType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp'].includes(ext)) return 'video';
  if (['opus', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'ptt'].includes(ext)) return 'audio';
  return 'file';
}

/** Nome do arquivo de mídia referenciado na mensagem, se houver. */
function extractMediaFilename(text: string): string | undefined {
  for (const regex of MEDIA_FILE_REGEXES) {
    const match = text.match(regex);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

/** Legenda da mensagem de mídia (texto sem o marcador do WhatsApp). */
export function getMediaCaption(text: string): string {
  let caption = text;
  for (const regex of MEDIA_FILE_REGEXES) caption = caption.replace(regex, '');
  return caption.replace(MEDIA_HIDDEN_REGEX, '').trim();
}

interface RawMessage {
  a: number;
  b: number;
  year: number;
  hours: number;
  minutes: number;
  meridiem: string;
  rest: string;
  extraLines: string[];
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Descobre se as datas são DD/MM ou MM/DD olhando qual campo passa de 12.
 * Sem evidência, assume DD/MM (padrão brasileiro).
 */
function detectDayFirst(raws: RawMessage[]): boolean {
  for (const { a, b } of raws) {
    if (a > 12) return true;
    if (b > 12) return false;
  }
  return true;
}

function to24h(hours: number, meridiem: string): number {
  if (!meridiem) return hours;
  const isPm = meridiem.toLowerCase() === 'p';
  if (isPm && hours < 12) return hours + 12;
  if (!isPm && hours === 12) return 0;
  return hours;
}

export function parseMessages(
  rawText: string,
  onProgress?: (current: number, total: number) => void
): ParsedMessage[] {
  const lines = rawText
    .replace(/^\uFEFF/, '')
    .replace(INVISIBLE_CHARS, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const totalLines = lines.length;

  // Passo 1: agrupa linhas em mensagens brutas (linhas sem cabeçalho continuam a anterior)
  const raws: RawMessage[] = [];
  let current: RawMessage | null = null;

  for (let i = 0; i < totalLines; i++) {
    if (onProgress && i % 5000 === 0) onProgress(i, totalLines);

    const match = lines[i].match(HEADER_REGEX);
    if (match) {
      current = {
        a: Number(match[1]),
        b: Number(match[2]),
        year: Number(match[3]),
        hours: Number(match[4]),
        minutes: Number(match[5]),
        meridiem: match[6] || '',
        rest: match[7],
        extraLines: [],
      };
      raws.push(current);
    } else if (current) {
      current.extraLines.push(lines[i]);
    }
  }

  // Passo 2: normaliza datas e separa remetente/texto
  const dayFirst = detectDayFirst(raws);
  const messages: ParsedMessage[] = [];

  raws.forEach((raw, id) => {
    const day = dayFirst ? raw.a : raw.b;
    const month = dayFirst ? raw.b : raw.a;
    const year = raw.year < 100 ? 2000 + raw.year : raw.year;
    const hours = to24h(raw.hours, raw.meridiem);

    const fullRest = [raw.rest, ...raw.extraLines].join('\n');
    const senderMatch = raw.rest.match(SENDER_REGEX);

    const base = {
      id,
      date: `${pad(day)}/${pad(month)}/${year}`,
      time: `${pad(hours)}:${pad(raw.minutes)}`,
      timestamp: new Date(year, month - 1, day, hours, raw.minutes).getTime(),
    };

    if (!senderMatch) {
      messages.push({ ...base, sender: '', text: fullRest.trim(), isSystemMessage: true });
      return;
    }

    const text = [senderMatch[2], ...raw.extraLines].join('\n').trim();
    const mediaFilename = extractMediaFilename(text);

    messages.push({
      ...base,
      sender: senderMatch[1].trim(),
      text,
      mediaFilename,
      mediaType: mediaFilename ? detectMediaType(mediaFilename) : undefined,
      isSystemMessage: false,
    });
  });

  if (onProgress) onProgress(totalLines, totalLines);
  return messages;
}

/** Converte "DD/MM/YYYY" + "HH:MM" para timestamp (fuso local). */
export function parseDateToTimestamp(dateStr: string, timeStr = '00:00'): number {
  const [day, month, year] = dateStr.split('/').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).getTime();
}
