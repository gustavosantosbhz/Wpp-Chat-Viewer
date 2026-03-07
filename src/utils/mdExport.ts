import type { ChatData } from '../types';

// Paleta de emojis indicadores por participante para diferenciação visual
const PARTICIPANT_INDICATORS = ['🟢', '🔵', '🟠', '🟣', '🔴', '🟡', '⚪', '🟤'];

export function generateMarkdown(chatData: ChatData): string {
  const { messages, participants, dateStart, dateEnd, totalMessages } = chatData;
  const names = participants.join(' e ');

  // Mapa de participante → indicador visual
  const participantIndicators = new Map<string, string>();
  participants.forEach((name, index) => {
    participantIndicators.set(name, PARTICIPANT_INDICATORS[index % PARTICIPANT_INDICATORS.length]);
  });

  let md = `# 💬 Conversa — ${names}\n\n`;
  md += `**Período:** ${dateStart} → ${dateEnd} | **Total:** ${totalMessages.toLocaleString('pt-BR')} mensagens\n\n`;

  // Legenda dos participantes
  md += `## Participantes\n\n`;
  for (const [name, indicator] of participantIndicators) {
    md += `${indicator} **${name}**\n`;
  }
  md += `\n---\n\n`;

  let currentDate = '';
  let lastSender = '';

  for (const msg of messages) {
    if (msg.isSystemMessage) {
      md += `> _⚙️ ${msg.text}_\n\n`;
      continue;
    }

    // Separador de data
    if (msg.date !== currentDate) {
      if (currentDate) md += `\n---\n\n`;
      md += `### 📅 ${msg.date}\n\n`;
      currentDate = msg.date;
      lastSender = '';
    }

    const indicator = participantIndicators.get(msg.sender) || '⬜';
    const showSender = msg.sender !== lastSender;
    lastSender = msg.sender;

    if (showSender) {
      md += `\n${indicator} **${msg.sender}**\n`;
    }

    // Conteúdo da mensagem com horário
    if (msg.mediaFilename) {
      if (msg.mediaType === 'image') {
        md += `> 📷 \`${msg.mediaFilename}\` · _${msg.time}_\n\n`;
      } else if (msg.mediaType === 'video') {
        md += `> 🎥 \`${msg.mediaFilename}\` · _${msg.time}_\n\n`;
      } else if (msg.mediaType === 'audio') {
        md += `> 🎵 \`${msg.mediaFilename}\` · _${msg.time}_\n\n`;
      } else {
        md += `> 📎 \`${msg.mediaFilename}\` · _${msg.time}_\n\n`;
      }
    } else {
      // Texto com blockquote para legibilidade
      const textLines = msg.text.split('\n');
      md += `> ${textLines.join('\n> ')} · _${msg.time}_\n\n`;
    }
  }

  return md;
}

export function downloadMarkdown(chatData: ChatData): void {
  const md = generateMarkdown(chatData);
  const names = chatData.participants.join('_').replace(/\s+/g, '');
  const filename = `conversa_${names}.md`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
