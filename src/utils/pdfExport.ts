import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ChatData } from '../types';

export interface PdfExportProgress {
  currentPage: number;
  totalPages: number;
}

export async function exportToPdf(
  chatData: ChatData,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<void> {
  const { participants, dateStart, dateEnd, messages } = chatData;
  const names = participants.join('_').replace(/\s+/g, '');
  const filename = `conversa_${names}_${dateStart.replace(/\//g, '-')}-${dateEnd.replace(/\//g, '-')}.pdf`;

  // Cria container temporário para renderizar as mensagens
  const container = document.createElement('div');
  container.id = 'pdf-render-container';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 794px;
    background: #111b21;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #e9edef;
  `;
  document.body.appendChild(container);

  const nonSystemMessages = messages.filter(m => !m.isSystemMessage);
  const CHUNK_SIZE = 50;
  const totalChunks = Math.ceil(nonSystemMessages.length / CHUNK_SIZE);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const headerHeight = 15;
  const contentWidth = pageWidth - margin * 2;

  let isFirstPage = true;

  for (let chunk = 0; chunk < totalChunks; chunk++) {
    if (onProgress) {
      onProgress({ currentPage: chunk + 1, totalPages: totalChunks });
    }

    const start = chunk * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, nonSystemMessages.length);
    const chunkMessages = nonSystemMessages.slice(start, end);

    // Renderiza chunk de mensagens
    container.innerHTML = '';

    let currentDate = '';
    for (const msg of chunkMessages) {
      // Separador de data
      if (msg.date !== currentDate) {
        currentDate = msg.date;
        const dateSep = document.createElement('div');
        dateSep.style.cssText = 'text-align:center; margin:12px 0; color:#8696a0; font-size:12px;';
        dateSep.innerHTML = `<span style="background:#1d2a31; padding:4px 12px; border-radius:8px;">${msg.date}</span>`;
        container.appendChild(dateSep);
      }

      // Bolha de mensagem
      const isFirstSender = msg.sender === chatData.firstSender;
      const bubble = document.createElement('div');
      bubble.style.cssText = `
        max-width: 65%;
        margin: 3px 0;
        padding: 6px 8px 4px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.4;
        ${isFirstSender
      ? 'margin-left: auto; background: #005c4b;'
      : 'margin-right: auto; background: #202c33;'
    }
      `;

      const senderEl = document.createElement('div');
      senderEl.style.cssText = 'font-size:11px; font-weight:600; margin-bottom:2px; color:#00a884;';
      senderEl.textContent = msg.sender;
      bubble.appendChild(senderEl);

      const textEl = document.createElement('div');
      textEl.style.cssText = 'color:#e9edef; word-wrap:break-word;';
      textEl.textContent = msg.mediaFilename ? `📎 ${msg.mediaFilename}` : msg.text;
      bubble.appendChild(textEl);

      const timeEl = document.createElement('div');
      timeEl.style.cssText = 'text-align:right; font-size:10px; color:#8696a0; margin-top:2px;';
      timeEl.textContent = msg.time;
      bubble.appendChild(timeEl);

      container.appendChild(bubble);
    }

    // Aguardar renderização
    await new Promise(r => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#111b21',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Dimensões para paginação
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Paginar se necessário
      let yOffset = 0;
      const availableHeight = pageHeight - margin * 2 - headerHeight;

      while (yOffset < imgHeight) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Header
        pdf.setFontSize(8);
        pdf.setTextColor(134, 150, 160);
        pdf.text(`Conversa: ${participants.join(', ')}`, margin, margin + 5);
        pdf.text(`Página ${pdf.getNumberOfPages()}`, pageWidth - margin - 20, margin + 5);

        // Conteúdo
        const sourceY = yOffset * (canvas.width / imgWidth);
        const sourceHeight = Math.min(
          availableHeight * (canvas.width / imgWidth),
          canvas.height - sourceY
        );

        if (sourceHeight > 0) {
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sourceHeight;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.85);
            const sliceImgHeight = (sourceHeight * imgWidth) / canvas.width;
            pdf.addImage(sliceData, 'JPEG', margin, margin + headerHeight, imgWidth, sliceImgHeight);
          }
        }

        yOffset += availableHeight;
      }
    } catch (err) {
      console.error('Erro ao renderizar chunk do PDF:', err);
    }
  }

  // Limpar container
  document.body.removeChild(container);

  // Salvar
  pdf.save(filename);
}
