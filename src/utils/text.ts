// Remove acentos e ignora maiúsculas: "Ação" e "acao" são equivalentes na busca
const COMBINING_MARKS = /\p{M}/gu;

export function foldText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

const foldedCache = new WeakMap<object, string>();

/** foldText com cache por objeto (mensagens são imutáveis depois de carregadas). */
export function foldCached(owner: object, text: string): string {
  let folded = foldedCache.get(owner);
  if (folded === undefined) {
    folded = foldText(text);
    foldedCache.set(owner, folded);
  }
  return folded;
}

/**
 * Localiza `term` em `text` ignorando acentos e caixa e devolve os intervalos
 * [início, fim) no texto ORIGINAL, para destacar sem alterar o conteúdo.
 */
export function findFoldedRanges(text: string, term: string): [number, number][] {
  const foldedTerm = foldText(term);
  if (!foldedTerm) return [];

  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;
  for (const char of text) {
    const piece = foldText(char);
    // Marca combinante solta: pertence ao caractere anterior
    if (piece === '' && ends.length > 0) ends[ends.length - 1] = offset + char.length;
    for (let i = 0; i < piece.length; i++) {
      starts.push(offset);
      ends.push(offset + char.length);
    }
    folded += piece;
    offset += char.length;
  }

  const ranges: [number, number][] = [];
  let from = 0;
  for (;;) {
    const index = folded.indexOf(foldedTerm, from);
    if (index === -1) break;
    ranges.push([starts[index], ends[index + foldedTerm.length - 1]]);
    from = index + foldedTerm.length;
  }
  return ranges;
}
