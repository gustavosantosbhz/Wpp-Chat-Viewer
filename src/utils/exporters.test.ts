import { describe, expect, it } from 'vitest';
import type { ChatData } from '../types';
import { csvCell, generateCsv, generateHtml, generateJson } from './exporters';
import { parseMessages } from './parser';

function chatFrom(text: string): ChatData {
  const messages = parseMessages(text);
  const nonSystem = messages.filter(m => !m.isSystemMessage);
  return {
    messages,
    participants: [...new Set(nonSystem.map(m => m.sender))],
    dateStart: nonSystem[0].date,
    dateEnd: nonSystem.at(-1)!.date,
    totalMessages: nonSystem.length,
    mediaFiles: new Map(),
    firstSender: nonSystem[0].sender,
  };
}

const CHAT = chatFrom(`12/03/2023 09:16 - Ana: Olá, "tudo bem"?
segunda linha
12/03/2023 09:17 - Bruno: =SOMA(A1:A2)
12/03/2023 09:18 - Bruno: <img src=x onerror=alert(1)>
12/03/2023 09:19 - Ana: IMG-1.jpg (arquivo anexado)
legenda
12/03/2023 09:20 - Ana saiu`);

describe('csv', () => {
  it('escapa aspas, vírgulas e quebras de linha', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('diz "oi"')).toBe('"diz ""oi"""');
    expect(csvCell('linha1\nlinha2')).toBe('"linha1\nlinha2"');
  });

  it('neutraliza células que o Excel executaria como fórmula', () => {
    expect(csvCell('=SOMA(A1)')).toBe("'=SOMA(A1)");
    expect(csvCell('@usuario')).toBe("'@usuario");
    expect(csvCell('texto normal')).toBe('texto normal');
  });

  it('gera cabeçalho, BOM e uma linha por mensagem', () => {
    const csv = generateCsv(CHAT);
    expect(csv.startsWith('﻿data,hora,remetente,texto')).toBe(true);
    expect(csv.trimEnd().split('\r\n')).toHaveLength(1 + CHAT.messages.length);
    expect(csv).toContain('IMG-1.jpg,image,nao');
    expect(csv).toContain(',sim');
  });
});

describe('json', () => {
  it('exporta metadados e mensagens sem campos internos', () => {
    const data = JSON.parse(generateJson(CHAT)) as { participants: string[]; messages: unknown[] };
    expect(data.participants).toEqual(['Ana', 'Bruno']);
    expect(data.messages).toHaveLength(5);
    expect(data.messages[0]).toEqual({
      date: '12/03/2023',
      time: '09:16',
      sender: 'Ana',
      text: 'Olá, "tudo bem"?\nsegunda linha',
      mediaFilename: null,
      mediaType: null,
      isSystemMessage: false,
    });
  });
});

describe('html', () => {
  const html = generateHtml(CHAT);

  it('escapa conteúdo vindo da conversa', () => {
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('é autocontido e bloqueia scripts e recursos externos', () => {
    expect(html).toContain("default-src 'none'");
    expect(html).not.toMatch(/<script|<link|src="http/i);
  });

  it('inclui mensagens de sistema, mídia e legenda', () => {
    expect(html).toContain('Ana saiu');
    expect(html).toContain('📷 IMG-1.jpg');
    expect(html).toContain('legenda');
  });
});
