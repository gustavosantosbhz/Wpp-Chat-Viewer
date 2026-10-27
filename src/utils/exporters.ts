import type { ChatData, ParsedMessage } from '../types';
import { downloadBlob, exportBaseName } from './download';
import { formatWhatsAppText } from './formatters';
import { getMediaCaption } from './parser';
import { getSenderColorMap, SENDER_COLORS } from './senderColors';

const MEDIA_ICONS = { image: '📷', video: '🎥', audio: '🎵', file: '📎' } as const;

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------- JSON

export function generateJson(chatData: ChatData): string {
  const { participants, dateStart, dateEnd, totalMessages, messages } = chatData;
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      participants,
      period: { start: dateStart, end: dateEnd },
      totalMessages,
      messages: messages.map(m => ({
        date: m.date,
        time: m.time,
        sender: m.sender,
        text: m.text,
        mediaFilename: m.mediaFilename ?? null,
        mediaType: m.mediaType ?? null,
        isSystemMessage: m.isSystemMessage,
      })),
    },
    null,
    2
  );
}

// ---------------------------------------------------------------- CSV

/**
 * Escapa uma célula CSV (RFC 4180). Células que começam com = + - @ seriam
 * executadas como fórmula no Excel/Sheets; recebem um apóstrofo na frente
 * (o JSON exportado mantém o texto original).
 */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function generateCsv(chatData: ChatData): string {
  const header = ['data', 'hora', 'remetente', 'texto', 'arquivo', 'tipo_midia', 'mensagem_sistema'];
  const rows = chatData.messages.map((m: ParsedMessage) =>
    [
      m.date,
      m.time,
      m.sender,
      m.mediaFilename ? getMediaCaption(m.text) : m.text,
      m.mediaFilename ?? '',
      m.mediaType ?? '',
      m.isSystemMessage ? 'sim' : 'nao',
    ]
      .map(csvCell)
      .join(',')
  );
  // BOM para o Excel reconhecer UTF-8 (acentos); CRLF conforme a RFC
  return '﻿' + [header.join(','), ...rows].join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------- HTML

const HTML_STYLE = `
  :root { color-scheme: dark light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0b141a; color: #e9edef; font: 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 1.3rem; margin: 0 0 4px; }
  .meta { color: #8696a0; font-size: 0.85rem; margin-bottom: 20px; }
  .day { text-align: center; margin: 16px 0 8px; }
  .day span { background: #1d2a31; color: #8696a0; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; }
  .system { text-align: center; color: #8696a0; font-size: 0.75rem; margin: 6px auto; max-width: 80%; }
  .row { display: flex; margin: 3px 0; }
  .row.me { justify-content: flex-end; }
  .bubble { max-width: 80%; padding: 6px 9px 4px; border-radius: 8px; background: #202c33; break-inside: avoid; overflow-wrap: anywhere; }
  .me .bubble { background: #005c4b; }
  .sender { font-size: 0.78rem; font-weight: 600; margin-bottom: 2px; }
  .media { opacity: 0.85; }
  .time { text-align: right; color: #8696a0; font-size: 0.68rem; margin-top: 2px; }
  a { color: #53bdeb; }
  code { font-family: ui-monospace, Menlo, Consolas, monospace; }
  mark { background: #f8c307; color: #111b21; }
  @media print {
    @page { margin: 12mm; }
    body { background: #fff; color: #111b21; }
    .meta, .day span, .system, .time { color: #54656f; }
    .day span { background: #e9edef; }
    .bubble { background: #f0f2f5; border: 1px solid #d1d7db; }
    .me .bubble { background: #d9fdd3; border-color: #b7e6ae; }
    .sender { filter: brightness(0.6); }
    a { color: #027eb5; }
  }
`;

/**
 * Documento HTML autocontido (sem scripts nem recursos externos).
 * Serve como arquivo para guardar e como base da impressão em PDF com texto selecionável.
 */
export function generateHtml(chatData: ChatData): string {
  const { messages, participants, dateStart, dateEnd, totalMessages, firstSender } = chatData;
  const colors = getSenderColorMap(participants);
  const title = `Conversa — ${participants.join(' e ')}`;

  const parts: string[] = [];
  let currentDate = '';

  for (const msg of messages) {
    if (msg.date !== currentDate) {
      currentDate = msg.date;
      parts.push(`<div class="day"><span>${escapeHtml(msg.date)}</span></div>`);
    }

    if (msg.isSystemMessage) {
      parts.push(`<div class="system">${escapeHtml(msg.text)}</div>`);
      continue;
    }

    const caption = msg.mediaFilename ? getMediaCaption(msg.text) : msg.text;
    const color = colors.get(msg.sender) ?? SENDER_COLORS[0];
    const media = msg.mediaFilename
      ? `<div class="media">${MEDIA_ICONS[msg.mediaType ?? 'file']} ${escapeHtml(msg.mediaFilename)}</div>`
      : '';
    const text = caption ? `<div>${formatWhatsAppText(caption)}</div>` : '';

    parts.push(
      `<div class="row${msg.sender === firstSender ? ' me' : ''}"><div class="bubble">` +
        `<div class="sender" style="color:${color}">${escapeHtml(msg.sender)}</div>${media}${text}` +
        `<div class="time">${escapeHtml(msg.time)}</div></div></div>`
    );
  }

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>${escapeHtml(title)}</title>
<style>${HTML_STYLE}</style>
</head>
<body>
<main>
<h1>${escapeHtml(title)}</h1>
<div class="meta">${escapeHtml(dateStart)} → ${escapeHtml(dateEnd)} · ${totalMessages.toLocaleString('pt-BR')} mensagens</div>
${parts.join('\n')}
</main>
</body>
</html>
`;
}

// ---------------------------------------------------------------- downloads

export function downloadJson(chatData: ChatData): void {
  downloadBlob(generateJson(chatData), `${exportBaseName(chatData)}.json`, 'application/json;charset=utf-8');
}

export function downloadCsv(chatData: ChatData): void {
  downloadBlob(generateCsv(chatData), `${exportBaseName(chatData)}.csv`, 'text/csv;charset=utf-8');
}

export function downloadHtml(chatData: ChatData): void {
  downloadBlob(generateHtml(chatData), `${exportBaseName(chatData)}.html`, 'text/html;charset=utf-8');
}

/**
 * Abre o diálogo de impressão do navegador com a conversa formatada para papel.
 * "Salvar como PDF" gera um PDF leve, com texto selecionável, acentos e emojis.
 */
export function printChat(chatData: ChatData): void {
  const url = URL.createObjectURL(new Blob([generateHtml(chatData)], { type: 'text/html;charset=utf-8' }));
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0;';
  frame.setAttribute('aria-hidden', 'true');

  const cleanup = () => {
    frame.remove();
    URL.revokeObjectURL(url);
  };

  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return cleanup();
    win.addEventListener('afterprint', cleanup);
    win.focus();
    win.print();
    // Rede de segurança: alguns navegadores não disparam afterprint
    setTimeout(cleanup, 5 * 60_000);
  };

  frame.src = url;
  document.body.appendChild(frame);
}
