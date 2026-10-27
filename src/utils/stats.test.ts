import { describe, expect, it } from 'vitest';
import { parseMessages } from './parser';
import { calculateStats, monthRange } from './stats';

const CHAT = `12/03/2023 09:15 - Ana: Reunião amanhã na reunião de projeto
12/03/2023 09:16 - Bruno: reunião confirmada https://exemplo.com/reuniao
13/03/2023 22:05 - Ana: IMG-1.jpg (arquivo anexado)
14/04/2023 22:30 - Ana entrou no grupo
14/04/2023 22:31 - Bruno: projeto aprovado`;

describe('calculateStats', () => {
  const stats = calculateStats(parseMessages(CHAT));

  it('distribui mensagens por horário, dia da semana e mês', () => {
    expect(stats.byHour[9]).toBe(2);
    expect(stats.byHour[22]).toBe(2);
    // 12/03/2023 foi domingo
    expect(stats.byWeekday[0]).toBe(2);
    expect(stats.byMonth).toEqual([
      { key: '03/2023', count: 3 },
      { key: '04/2023', count: 1 },
    ]);
    expect(stats.mostActiveMonth).toBe('03/2023');
  });

  it('ranqueia palavras ignorando stopwords, URLs e marcadores de mídia', () => {
    const words = stats.topWords.map(w => w.word);
    expect(stats.topWords[0]).toEqual({ word: 'reunião', count: 3 });
    expect(words).toContain('projeto');
    expect(words).not.toContain('na');
    expect(words).not.toContain('anexado');
    expect(words.join(' ')).not.toContain('exemplo');
  });
});

describe('monthRange', () => {
  it('calcula o último dia do mês', () => {
    expect(monthRange('02/2024')).toEqual(['01/02/2024', '29/02/2024']);
    expect(monthRange('12/2023')).toEqual(['01/12/2023', '31/12/2023']);
  });
});
