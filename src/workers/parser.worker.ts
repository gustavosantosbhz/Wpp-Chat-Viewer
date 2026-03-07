import { parseMessages } from '../utils/parser';

// Web Worker para parsing assíncrono
self.onmessage = function (e: MessageEvent) {
  const { text, fileIndex, totalFiles } = e.data;

  self.postMessage({
    type: 'progress',
    phase: 'parsing',
    current: fileIndex,
    total: totalFiles,
    message: `Processando arquivo ${fileIndex + 1} de ${totalFiles}...`,
  });

  const messages = parseMessages(text, (current, total) => {
    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      current,
      total,
      message: `Analisando linhas... ${Math.round((current / total) * 100)}%`,
    });
  });

  self.postMessage({
    type: 'result',
    messages,
    fileIndex,
  });
};
