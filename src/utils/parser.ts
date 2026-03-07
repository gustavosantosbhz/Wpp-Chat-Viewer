import type { ParsedMessage } from '../types';

// Regex para formato Android: DD/MM/YYYY, HH:MM - Nome: mensagem
const ANDROID_REGEX = /^(\d{2}\/\d{2}\/\d{4}),?\s+(\d{2}:\d{2})(?::\d{2})?\s+-\s+(.+?):\s+([\s\S]*)/;

// Regex para formato iOS: [DD/MM/YYYY, HH:MM:SS] Nome: mensagem
const IOS_REGEX = /^\[(\d{2}\/\d{2}\/\d{4}),?\s+(\d{2}:\d{2})(?::\d{2})?\]\s+(.+?):\s+([\s\S]*)/;

// Regex para mensagens do sistema (sem remetente)
const SYSTEM_ANDROID_REGEX = /^(\d{2}\/\d{2}\/\d{4}),?\s+(\d{2}:\d{2})(?::\d{2})?\s+-\s+(.*)/;
const SYSTEM_IOS_REGEX = /^\[(\d{2}\/\d{2}\/\d{4}),?\s+(\d{2}:\d{2})(?::\d{2})?\]\s+(.*)/;

// Padrão de mídia omitida/anexada (todas as variações do WhatsApp)
const MEDIA_PATTERN = /(.+?)\s*\(arquivo omitido\)|(.+?)\s*\(arquivo anexado\)|(.+?)\s*\(file attached\)|<Mídia oculta>|<Media omitted>/;

function detectMediaType(filename: string): 'image' | 'video' | 'audio' | 'file' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp'].includes(ext)) return 'video';
  if (['opus', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'ptt'].includes(ext)) return 'audio';
  return 'file';
}

/**
 * Remove BOM (Byte Order Mark) do início do texto
 */
function removeBOM(text: string): string {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.substring(1);
  }
  return text;
}

export function parseMessages(
  rawText: string,
  onProgress?: (current: number, total: number) => void
): ParsedMessage[] {
  // Remove BOM e normaliza line endings
  const cleanText = removeBOM(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n');
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;
  let messageId = 0;
  const totalLines = lines.length;

  console.log('[parser] Iniciando parsing de', totalLines, 'linhas');
  console.log('[parser] Primeiras 3 linhas:', lines.slice(0, 3));

  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];

    if (onProgress && i % 5000 === 0) {
      onProgress(i, totalLines);
    }

    // Tenta match Android
    let match = line.match(ANDROID_REGEX);
    if (!match) {
      // Tenta match iOS
      match = line.match(IOS_REGEX);
    }

    if (match) {
      // Salva mensagem anterior
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const [, date, time, sender, text] = match;

      // Verifica se é mídia
      const mediaMatch = text.match(MEDIA_PATTERN);
      let mediaFilename: string | undefined;
      let mediaType: ParsedMessage['mediaType'];

      if (mediaMatch) {
        const filename = mediaMatch[1] || mediaMatch[2] || mediaMatch[3];
        if (filename) {
          mediaFilename = filename.trim();
          mediaType = detectMediaType(mediaFilename);
        }
      }

      currentMessage = {
        id: messageId++,
        date,
        time,
        sender: sender.trim(),
        text: text.trim(),
        mediaFilename,
        mediaType,
        isSystemMessage: false,
      };
    } else {
      // Verifica mensagem do sistema
      const sysMatch = line.match(SYSTEM_ANDROID_REGEX) || line.match(SYSTEM_IOS_REGEX);

      if (sysMatch && !currentMessage) {
        // Primeira msg é do sistema
        const [, date, time, text] = sysMatch;
        messages.push({
          id: messageId++,
          date,
          time,
          sender: '',
          text: text.trim(),
          isSystemMessage: true,
        });
      } else if (currentMessage && line.trim() !== '') {
        // Mensagem multilinha - adiciona à mensagem atual
        currentMessage.text += '\n' + line;
      } else if (sysMatch) {
        // Mensagem do sistema no meio da conversa
        if (currentMessage) {
          messages.push(currentMessage);
          currentMessage = null;
        }
        const [, date, time, text] = sysMatch;
        messages.push({
          id: messageId++,
          date,
          time,
          sender: '',
          text: text.trim(),
          isSystemMessage: true,
        });
      }
    }
  }

  // Salva última mensagem
  if (currentMessage) {
    messages.push(currentMessage);
  }

  if (onProgress) {
    onProgress(totalLines, totalLines);
  }

  console.log('[parser] Parsing concluído:', messages.length, 'mensagens encontradas');
  if (messages.length > 0) {
    console.log('[parser] Primeira mensagem:', messages[0]);
  }

  return messages;
}

export function parseDateToTimestamp(dateStr: string, timeStr: string): number {
  const [day, month, year] = dateStr.split('/').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).getTime();
}
