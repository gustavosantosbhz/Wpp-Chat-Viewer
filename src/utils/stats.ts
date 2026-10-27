import type { ParsedMessage, StatsData } from '../types';
import { getMediaCaption } from './parser';
import { foldText } from './text';
import { STOP_WORDS } from './stopwords';

const TOP_WORDS_LIMIT = 10;
const MIN_WORD_LENGTH = 3;
const URL_REGEX = /https?:\/\/\S+/g;
const WORD_REGEX = /[\p{L}][\p{L}\p{N}']*/gu;

function countTopWords(messages: ParsedMessage[]) {
  const counts = new Map<string, number>();

  for (const msg of messages) {
    // Marcadores de mídia do WhatsApp não são conversa: só conta a legenda
    const text = getMediaCaption(msg.text);

    for (const raw of text.replace(URL_REGEX, ' ').toLowerCase().match(WORD_REGEX) ?? []) {
      if (raw.length < MIN_WORD_LENGTH || STOP_WORDS.has(foldText(raw))) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_WORDS_LIMIT)
    .map(([word, count]) => ({ word, count }));
}

export function calculateStats(messages: ParsedMessage[]): StatsData {
  const nonSystemMessages = messages.filter(m => !m.isSystemMessage);

  const messagesByParticipant: Record<string, number> = {};
  const byHour = new Array<number>(24).fill(0);
  const byWeekday = new Array<number>(7).fill(0);
  const monthCounts = new Map<string, number>();

  for (const msg of nonSystemMessages) {
    messagesByParticipant[msg.sender] = (messagesByParticipant[msg.sender] || 0) + 1;

    const when = new Date(msg.timestamp);
    byHour[when.getHours()]++;
    byWeekday[when.getDay()]++;

    const [, month, year] = msg.date.split('/');
    const key = `${month}/${year}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }

  const start = nonSystemMessages[0]?.date ?? '';
  const end = nonSystemMessages.at(-1)?.date ?? '';

  const uniqueDays = new Set(nonSystemMessages.map(m => m.date));
  const avgMessagesPerDay = uniqueDays.size > 0
    ? Math.round(nonSystemMessages.length / uniqueDays.size)
    : 0;

  // Meses em ordem cronológica (as mensagens já vêm ordenadas)
  const byMonth = [...monthCounts.entries()].map(([key, count]) => ({ key, count }));
  const mostActiveMonth = byMonth.reduce(
    (best, month) => (month.count > best.count ? month : best),
    { key: '', count: 0 }
  ).key;

  return {
    totalMessages: nonSystemMessages.length,
    messagesByParticipant,
    period: { start, end },
    avgMessagesPerDay,
    mostActiveMonth,
    byHour,
    byWeekday,
    byMonth,
    topWords: countTopWords(nonSystemMessages),
  };
}

/** Intervalo [início, fim] (DD/MM/YYYY) de um mês "MM/YYYY". */
export function monthRange(month: string): [string, string] {
  const [mm, yyyy] = month.split('/').map(Number);
  const lastDay = new Date(yyyy, mm, 0).getDate();
  const pad = (v: number) => String(v).padStart(2, '0');
  return [`01/${pad(mm)}/${yyyy}`, `${pad(lastDay)}/${pad(mm)}/${yyyy}`];
}
