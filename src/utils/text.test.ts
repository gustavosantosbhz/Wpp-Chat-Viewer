import { describe, expect, it } from 'vitest';
import { findFoldedRanges, foldText } from './text';
import { formatWhatsAppText } from './formatters';

describe('busca sem acentos', () => {
  it('ignora acentos e caixa', () => {
    expect(foldText('AÇÃO Já')).toBe('acao ja');
  });

  it('devolve intervalos no texto original', () => {
    expect(findFoldedRanges('Reunião às 15h, reuniao amanhã', 'reuniao')).toEqual([
      [0, 7],
      [16, 23],
    ]);
  });

  it('funciona com emojis e letras decompostas', () => {
    expect(findFoldedRanges('😀 café!', 'café')).toEqual([[3, 8]]);
  });

  it('destaca sem diferenciar acentos', () => {
    expect(formatWhatsAppText('Olá, ola!', 'ola')).toBe(
      '<mark class="search-highlight">Olá</mark>, <mark class="search-highlight">ola</mark>!'
    );
  });
});
