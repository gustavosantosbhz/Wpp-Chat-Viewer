import type { ParsedMessage } from '../types';

const messageKey = (m: ParsedMessage) => `${m.date}|${m.time}|${m.sender}|${m.text}`;

function countByKey(messages: ParsedMessage[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of messages) {
    const key = messageKey(m);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Junta exportações sobrepostas do mesmo chat sem apagar mensagens repetidas
 * legítimas: para cada mensagem, mantém o maior número de ocorrências vistas
 * em um único arquivo (duas "ok" no mesmo minuto continuam sendo duas).
 * Retorna as mensagens em ordem cronológica.
 */
export function mergeMessageLists(lists: ParsedMessage[][]): ParsedMessage[] {
  if (lists.length === 1) return sortMessagesByDate(lists[0]);

  const allowed = new Map<string, number>();
  for (const list of lists) {
    for (const [key, count] of countByKey(list)) {
      allowed.set(key, Math.max(allowed.get(key) ?? 0, count));
    }
  }

  const emitted = new Map<string, number>();
  const result: ParsedMessage[] = [];
  for (const list of lists) {
    for (const m of list) {
      const key = messageKey(m);
      const used = emitted.get(key) ?? 0;
      if (used < (allowed.get(key) ?? 0)) {
        emitted.set(key, used + 1);
        result.push(m);
      }
    }
  }

  return sortMessagesByDate(result);
}

/** Ordenação estável por data/hora (não muta a lista original). */
export function sortMessagesByDate(messages: ParsedMessage[]): ParsedMessage[] {
  return [...messages].sort((a, b) => a.timestamp - b.timestamp);
}
