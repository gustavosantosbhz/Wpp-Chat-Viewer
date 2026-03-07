import type { ParsedMessage } from '../types';
import { parseDateToTimestamp } from './parser';

export function deduplicateMessages(messages: ParsedMessage[]): ParsedMessage[] {
  const seen = new Set<string>();
  const result: ParsedMessage[] = [];

  for (const msg of messages) {
    const key = `${msg.date}|${msg.time}|${msg.sender}|${msg.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(msg);
    }
  }

  return result;
}

export function sortMessagesByDate(messages: ParsedMessage[]): ParsedMessage[] {
  return messages.sort((a, b) => {
    const tsA = parseDateToTimestamp(a.date, a.time);
    const tsB = parseDateToTimestamp(b.date, b.time);
    return tsA - tsB;
  });
}
