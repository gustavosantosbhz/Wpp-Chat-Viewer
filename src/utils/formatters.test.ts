import { describe, expect, it } from 'vitest';
import { formatWhatsAppText } from './formatters';

describe('formatWhatsAppText', () => {
  it('escapa HTML', () => {
    expect(formatWhatsAppText('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('aplica negrito, itálico, tachado e código', () => {
    expect(formatWhatsAppText('*a* _b_ ~c~ `d`')).toBe(
      '<strong>a</strong> <em>b</em> <del>c</del> <code class="wpp-code">d</code>'
    );
  });

  it('não formata dentro de palavras (snake_case, 2*3*4)', () => {
    expect(formatWhatsAppText('meu_arquivo_final 2*3*4')).toBe('meu_arquivo_final 2*3*4');
  });

  it('mantém URLs intactas, sem aplicar formatação nem incluir pontuação final', () => {
    const html = formatWhatsAppText('veja https://exemplo.com/a_b_c*d*?x=1&y=2.');
    expect(html).toContain('href="https://exemplo.com/a_b_c*d*?x=1&amp;y=2"');
    expect(html).not.toContain('<em>');
    expect(html).not.toContain('<strong>');
    expect(html.endsWith('</a>.')).toBe(true);
  });

  it('não formata dentro de blocos de código', () => {
    expect(formatWhatsAppText('`*não*`')).toBe('<code class="wpp-code">*não*</code>');
  });

  it('destaca a busca sem quebrar tags nem entidades', () => {
    const html = formatWhatsAppText('*strong* & class amp', 'strong');
    expect(html).toBe('<strong><mark class="search-highlight">strong</mark></strong> &amp; class amp');

    expect(formatWhatsAppText('a & b', 'amp')).toBe('a &amp; b');
    expect(formatWhatsAppText('um\ndois', 'br')).toBe('um<br/>dois');
  });

  it('trata caracteres especiais de regex no termo de busca', () => {
    expect(formatWhatsAppText('preço (R$) a+b', '(R$)')).toContain('<mark class="search-highlight">(R$)</mark>');
  });
});
