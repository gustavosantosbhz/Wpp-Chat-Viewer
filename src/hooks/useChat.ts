import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import type { ParsedMessage, ChatData, MediaFile, ParserProgress } from '../types';
import { parseMessages } from '../utils/parser';
import { deduplicateMessages, sortMessagesByDate } from '../utils/dedup';

export function useChat() {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ParserProgress>({
    phase: 'reading',
    current: 0,
    total: 0,
    message: '',
  });

  const processFiles = useCallback(async (files: File[]) => {
    console.log('[useChat] processFiles chamado com', files.length, 'arquivo(s)');
    console.log('[useChat] Arquivos:', files.map(f => `${f.name} (${f.size} bytes, type: ${f.type})`));

    setIsLoading(true);
    setProgress({ phase: 'reading', current: 0, total: files.length, message: 'Lendo arquivos...' });

    try {
      const textContents: string[] = [];
      const mediaFiles = new Map<string, MediaFile>();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[useChat] Processando arquivo ${i + 1}: ${file.name}`);

        setProgress({
          phase: 'reading',
          current: i + 1,
          total: files.length,
          message: `Lendo ${file.name}...`,
        });

        if (file.name.toLowerCase().endsWith('.zip')) {
          console.log('[useChat] Detectado ZIP, extraindo...');
          const zip = await JSZip.loadAsync(file);
          const entries = Object.entries(zip.files);
          console.log('[useChat] ZIP contém', entries.length, 'entradas');

          for (const [path, zipEntry] of entries) {
            if (zipEntry.dir) continue;

            const filename = path.split('/').pop() || path;
            console.log('[useChat] ZIP entry:', filename);

            if (filename.toLowerCase().endsWith('.txt')) {
              const content = await zipEntry.async('string');
              console.log('[useChat] TXT extraído do ZIP:', filename, '- tamanho:', content.length);
              textContents.push(content);
            } else {
              const blob = await zipEntry.async('blob');
              const ext = filename.split('.').pop()?.toLowerCase() || '';
              let type: MediaFile['type'] = 'file';
              if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'image';
              else if (['mp4', 'mov', 'avi', 'webm', '3gp'].includes(ext)) type = 'video';
              else if (['opus', 'mp3', 'ogg', 'm4a', 'aac', 'ptt'].includes(ext)) type = 'audio';

              mediaFiles.set(filename, {
                name: filename,
                blob,
                url: URL.createObjectURL(blob),
                type,
              });
            }
          }
        } else if (file.name.toLowerCase().endsWith('.txt')) {
          const content = await file.text();
          console.log('[useChat] TXT lido:', file.name, '- tamanho:', content.length, 'chars');
          console.log('[useChat] Primeiros 200 chars:', JSON.stringify(content.substring(0, 200)));
          textContents.push(content);
        } else {
          console.log('[useChat] Arquivo ignorado (extensão não suportada):', file.name);
        }
      }

      console.log('[useChat] Total de textos a parsear:', textContents.length);

      if (textContents.length === 0) {
        console.warn('[useChat] Nenhum conteúdo de texto encontrado nos arquivos');
        setProgress({
          phase: 'done',
          current: 0,
          total: 0,
          message: 'Nenhum arquivo .txt encontrado.',
        });
        setIsLoading(false);
        return;
      }

      // Parsing de todos os textos
      setProgress({
        phase: 'parsing',
        current: 0,
        total: textContents.length,
        message: 'Analisando mensagens...',
      });

      let allMessages: ParsedMessage[] = [];

      for (let i = 0; i < textContents.length; i++) {
        console.log(`[useChat] Parseando texto ${i + 1} de ${textContents.length}`);

        setProgress({
          phase: 'parsing',
          current: i + 1,
          total: textContents.length,
          message: `Processando arquivo ${i + 1} de ${textContents.length}...`,
        });

        const messages = parseMessages(textContents[i], (current, total) => {
          setProgress({
            phase: 'parsing',
            current,
            total,
            message: `Analisando linhas... ${Math.round((current / total) * 100)}%`,
          });
        });

        console.log(`[useChat] Texto ${i + 1}: ${messages.length} mensagens parseadas`);
        if (messages.length > 0) {
          console.log('[useChat] Primeira msg:', JSON.stringify(messages[0]));
          console.log('[useChat] Última msg:', JSON.stringify(messages[messages.length - 1]));
        }

        allMessages = allMessages.concat(messages);
      }

      console.log('[useChat] Total de mensagens antes da dedup:', allMessages.length);

      // Deduplicação
      setProgress({
        phase: 'deduplicating',
        current: 0,
        total: allMessages.length,
        message: 'Removendo duplicatas...',
      });

      allMessages = deduplicateMessages(allMessages);
      allMessages = sortMessagesByDate(allMessages);

      console.log('[useChat] Total após dedup + sort:', allMessages.length);

      // Re-indexar IDs
      allMessages.forEach((msg, index) => {
        msg.id = index;
      });

      // Extrair participantes
      const participantsSet = new Set<string>();
      for (const msg of allMessages) {
        if (!msg.isSystemMessage && msg.sender) {
          participantsSet.add(msg.sender);
        }
      }

      const participants = Array.from(participantsSet);
      const firstSender = allMessages.find(m => !m.isSystemMessage)?.sender || '';
      const nonSystem = allMessages.filter(m => !m.isSystemMessage);

      console.log('[useChat] Participantes:', participants);
      console.log('[useChat] FirstSender:', firstSender);
      console.log('[useChat] Msgs não-sistema:', nonSystem.length);

      const newChatData: ChatData = {
        messages: allMessages,
        participants,
        dateStart: nonSystem.length > 0 ? nonSystem[0].date : '',
        dateEnd: nonSystem.length > 0 ? nonSystem[nonSystem.length - 1].date : '',
        totalMessages: nonSystem.length,
        mediaFiles,
        firstSender,
      };

      console.log('[useChat] ChatData criado:', {
        totalMessages: newChatData.totalMessages,
        participants: newChatData.participants,
        dateStart: newChatData.dateStart,
        dateEnd: newChatData.dateEnd,
      });

      setProgress({
        phase: 'done',
        current: allMessages.length,
        total: allMessages.length,
        message: `${allMessages.length.toLocaleString('pt-BR')} mensagens carregadas!`,
      });

      setChatData(newChatData);
      console.log('[useChat] setChatData chamado com sucesso');
    } catch (error) {
      console.error('[useChat] ERRO ao processar arquivos:', error);
      console.error('[useChat] Stack:', error instanceof Error ? error.stack : 'N/A');
      setProgress({
        phase: 'done',
        current: 0,
        total: 0,
        message: `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setIsLoading(false);
      console.log('[useChat] isLoading = false');
    }
  }, []);

  const resetChat = useCallback(() => {
    if (chatData) {
      chatData.mediaFiles.forEach(media => {
        URL.revokeObjectURL(media.url);
      });
    }
    setChatData(null);
    setIsLoading(false);
    setProgress({ phase: 'reading', current: 0, total: 0, message: '' });
  }, [chatData]);

  return {
    chatData,
    isLoading,
    progress,
    processFiles,
    resetChat,
  };
}
