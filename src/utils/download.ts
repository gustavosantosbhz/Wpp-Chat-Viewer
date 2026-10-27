import type { ChatData } from '../types';

/** Nome de arquivo seguro a partir dos participantes (remove caracteres inválidos). */
export function exportBaseName(chatData: ChatData): string {
  const names = chatData.participants.join('_').replace(/[^\p{L}\p{N}_-]+/gu, '');
  return `conversa_${names || 'whatsapp'}`;
}

export function downloadBlob(content: BlobPart, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Dá tempo ao navegador de iniciar o download antes de liberar a URL
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
