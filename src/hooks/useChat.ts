import { useState, useCallback } from 'react';
import type { ParsedMessage, ChatData, MediaFile, ParserProgress } from '../types';
import { detectMediaType } from '../utils/parser';
import { parseMessagesAsync } from '../utils/parseAsync';
import { mergeMessageLists } from '../utils/dedup';

const EMPTY_PROGRESS: ParserProgress = { phase: 'reading', current: 0, total: 0, message: '' };

export function useChat() {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ParserProgress>(EMPTY_PROGRESS);

  const processFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setProgress({ phase: 'reading', current: 0, total: files.length, message: 'Lendo arquivos...' });

    try {
      const textContents: string[] = [];
      const mediaFiles = new Map<string, MediaFile>();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const lowerName = file.name.toLowerCase();

        setProgress({
          phase: 'reading',
          current: i + 1,
          total: files.length,
          message: `Lendo ${file.name}...`,
        });

        if (lowerName.endsWith('.zip')) {
          // JSZip só é baixado quando o usuário envia um ZIP
          const { default: JSZip } = await import('jszip');
          const zip = await JSZip.loadAsync(file);

          for (const [path, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) continue;

            const filename = path.split('/').pop() || path;
            if (filename.toLowerCase().endsWith('.txt')) {
              textContents.push(await zipEntry.async('string'));
            } else {
              // Mídia é descompactada sob demanda, apenas quando exibida
              let blobPromise: Promise<Blob> | undefined;
              mediaFiles.set(filename, {
                name: filename,
                type: detectMediaType(filename),
                load: () => (blobPromise ??= zipEntry.async('blob')),
              });
            }
          }
        } else if (lowerName.endsWith('.txt')) {
          textContents.push(await file.text());
        }
      }

      if (textContents.length === 0) {
        setProgress({ phase: 'done', current: 0, total: 0, message: 'Nenhum arquivo .txt encontrado.' });
        return;
      }

      setProgress({
        phase: 'parsing',
        current: 0,
        total: textContents.length,
        message: 'Analisando mensagens...',
      });

      const parsedLists: ParsedMessage[][] = [];
      for (let i = 0; i < textContents.length; i++) {
        const label = `Arquivo ${i + 1} de ${textContents.length}`;
        parsedLists.push(
          await parseMessagesAsync(textContents[i], (current, total) => {
            setProgress({
              phase: 'parsing',
              current,
              total,
              message: `${label}: analisando linhas... ${Math.round((current / total) * 100)}%`,
            });
          })
        );
      }

      setProgress({ phase: 'deduplicating', current: 0, total: 0, message: 'Organizando mensagens...' });

      const allMessages = mergeMessageLists(parsedLists).map((msg, index) => ({ ...msg, id: index }));

      const participants = Array.from(
        new Set(allMessages.filter(m => !m.isSystemMessage && m.sender).map(m => m.sender))
      );
      const nonSystem = allMessages.filter(m => !m.isSystemMessage);

      setChatData({
        messages: allMessages,
        participants,
        dateStart: nonSystem[0]?.date ?? '',
        dateEnd: nonSystem.at(-1)?.date ?? '',
        totalMessages: nonSystem.length,
        mediaFiles,
        firstSender: nonSystem[0]?.sender ?? '',
      });

      setProgress({
        phase: 'done',
        current: allMessages.length,
        total: allMessages.length,
        message: `${allMessages.length.toLocaleString('pt-BR')} mensagens carregadas!`,
      });
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      setProgress({
        phase: 'done',
        current: 0,
        total: 0,
        message: `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetChat = useCallback(() => {
    setChatData(null);
    setIsLoading(false);
    setProgress(EMPTY_PROGRESS);
  }, []);

  return { chatData, isLoading, progress, processFiles, resetChat };
}
