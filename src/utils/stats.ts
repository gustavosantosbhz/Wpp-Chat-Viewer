import type { ParsedMessage, StatsData } from '../types';

export function calculateStats(messages: ParsedMessage[]): StatsData {
  const nonSystemMessages = messages.filter(m => !m.isSystemMessage);

  // Mensagens por participante
  const messagesByParticipant: Record<string, number> = {};
  for (const msg of nonSystemMessages) {
    messagesByParticipant[msg.sender] = (messagesByParticipant[msg.sender] || 0) + 1;
  }

  // Período
  const start = nonSystemMessages.length > 0 ? nonSystemMessages[0].date : '';
  const end = nonSystemMessages.length > 0 ? nonSystemMessages[nonSystemMessages.length - 1].date : '';

  // Dias únicos e média
  const uniqueDays = new Set(nonSystemMessages.map(m => m.date));
  const avgMessagesPerDay = uniqueDays.size > 0
    ? Math.round(nonSystemMessages.length / uniqueDays.size)
    : 0;

  // Mês mais ativo
  const monthCounts: Record<string, number> = {};
  for (const msg of nonSystemMessages) {
    const [, month, year] = msg.date.split('/');
    const key = `${month}/${year}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  }

  let mostActiveMonth = '';
  let maxCount = 0;
  for (const [month, count] of Object.entries(monthCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveMonth = month;
    }
  }

  return {
    totalMessages: nonSystemMessages.length,
    messagesByParticipant,
    period: { start, end },
    avgMessagesPerDay,
    mostActiveMonth,
  };
}
