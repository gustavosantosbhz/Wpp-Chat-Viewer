/**
 * Aplica formatação inline do WhatsApp ao texto.
 * *negrito* → <strong>
 * _itálico_ → <em>
 * ~tachado~ → <del>
 * `código`  → <code>
 */
export function formatWhatsAppText(text: string): string {
  // Escape HTML first
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Código (monospace) - processar antes para evitar conflitos
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="wpp-code">$1</code>');

  // Negrito
  formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

  // Itálico
  formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Tachado
  formatted = formatted.replace(/~([^~]+)~/g, '<del>$1</del>');

  // URLs
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="wpp-link">$1</a>'
  );

  // Quebras de linha
  formatted = formatted.replace(/\n/g, '<br/>');

  return formatted;
}
