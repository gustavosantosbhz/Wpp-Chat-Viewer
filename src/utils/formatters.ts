import { findFoldedRanges } from './text';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Pontuação final que não faz parte da URL
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

/**
 * Aplica a formatação inline do WhatsApp ao texto e devolve HTML seguro.
 * *negrito* → <strong>, _itálico_ → <em>, ~tachado~ → <del>, `código` → <code>
 * e links. Se `searchTerm` for informado, destaca as ocorrências apenas no
 * texto visível (nunca dentro de tags ou entidades HTML).
 */
export function formatWhatsAppText(text: string, searchTerm?: string): string {
  // Trechos que não podem receber outras formatações (código e URLs) viram
  // marcadores e são restaurados no final.
  const stash: string[] = [];
  const hold = (html: string) => `\uE000${stash.push(html) - 1}\uE000`;

  let formatted = escapeHtml(text);

  formatted = formatted.replace(/`([^`\n]+)`/g, (_, code) => hold(`<code class="wpp-code">${code}</code>`));

  formatted = formatted.replace(/https?:\/\/[^\s\uE000]+/g, url => {
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] ?? '';
    const href = trailing ? url.slice(0, -trailing.length) : url;
    return hold(`<a href="${href}" target="_blank" rel="noopener noreferrer" class="wpp-link">${href}</a>`) + trailing;
  });

  // Marcadores só valem na borda de palavra: snake_case e 2*3*4 não formatam
  formatted = formatted
    .replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, '<strong>$1</strong>')
    .replace(/(?<![\w_])_([^_\n]+)_(?![\w_])/g, '<em>$1</em>')
    .replace(/(?<![\w~])~([^~\n]+)~(?![\w~])/g, '<del>$1</del>');

  formatted = formatted.replace(/\n/g, '<br/>');

  const html = formatted.replace(/\uE000(\d+)\uE000/g, (_, index) => stash[Number(index)]);
  return searchTerm?.trim() ? highlightText(html, searchTerm) : html;
}

/** Destaca o termo (sem diferenciar acentos) apenas no texto visível, preservando tags e entidades. */
function highlightText(html: string, searchTerm: string): string {
  return html
    .split(/(<[^>]*>|&(?:amp|lt|gt);)/)
    .map((part, i) => (i % 2 === 1 ? part : markRanges(part, findFoldedRanges(part, searchTerm))))
    .join('');
}

function markRanges(text: string, ranges: [number, number][]): string {
  let result = '';
  let cursor = 0;
  for (const [start, end] of ranges) {
    result += `${text.slice(cursor, start)}<mark class="search-highlight">${text.slice(start, end)}</mark>`;
    cursor = end;
  }
  return result + text.slice(cursor);
}
