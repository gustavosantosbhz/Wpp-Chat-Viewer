import { useCallback, useEffect, useState } from 'react';
import type { ChatData } from '../types';
import {
  clearSavedChats,
  deleteSavedChat,
  listSavedChats,
  saveChat,
  savedChatId,
  type SavedChat,
} from '../utils/storage';

const REMEMBER_KEY = 'wpp-viewer-remember';

function readRemember(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1';
  } catch {
    return false;
  }
}

/** Biblioteca de conversas salvas no navegador. Salvar é opt-in (padrão: desligado). */
export function useSavedChats() {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [remember, setRememberState] = useState(readRemember);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setSavedChats(await listSavedChats());
    } catch {
      setSavedChats([]); // IndexedDB indisponível (modo privado, bloqueio de dados)
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listSavedChats()
      .then(chats => {
        if (!cancelled) setSavedChats(chats);
      })
      .catch(() => undefined); // IndexedDB indisponível (modo privado, bloqueio de dados)
    return () => {
      cancelled = true;
    };
  }, []);

  const setRemember = useCallback((value: boolean) => {
    setRememberState(value);
    try {
      localStorage.setItem(REMEMBER_KEY, value ? '1' : '0');
    } catch {
      // preferência só vale nesta sessão
    }
  }, []);

  const save = useCallback(
    async (files: File[], chat: ChatData) => {
      setError('');
      try {
        await saveChat({
          id: savedChatId(files),
          title: chat.participants.join(', ') || files[0]?.name || 'Conversa',
          savedAt: Date.now(),
          totalMessages: chat.totalMessages,
          dateStart: chat.dateStart,
          dateEnd: chat.dateEnd,
          totalBytes: files.reduce((sum, f) => sum + f.size, 0),
          files,
        });
        await refresh();
      } catch {
        setError('Não foi possível salvar a conversa neste navegador (espaço insuficiente ou armazenamento bloqueado).');
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteSavedChat(id).catch(() => undefined);
      await refresh();
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    await clearSavedChats().catch(() => undefined);
    await refresh();
  }, [refresh]);

  return { savedChats, remember, setRemember, error, save, remove, clearAll };
}
