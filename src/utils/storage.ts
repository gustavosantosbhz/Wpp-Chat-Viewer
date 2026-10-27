// Conversas salvas no navegador (IndexedDB). Os arquivos originais são guardados
// como Blobs (o navegador os mantém em disco) e reprocessados ao abrir.

const DB_NAME = 'wpp-chat-viewer';
const STORE = 'chats';

export interface SavedChat {
  id: string;
  title: string;
  savedAt: number;
  totalMessages: number;
  dateStart: string;
  dateEnd: string;
  totalBytes: number;
  files: File[];
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB indisponível'));
  });
}

async function run<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = operation(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? new Error('Transação abortada'));
      tx.onerror = () => reject(tx.error ?? new Error('Falha no IndexedDB'));
    });
  } finally {
    db.close();
  }
}

/** O mesmo conjunto de arquivos (nome + tamanho) sobrescreve a versão anterior. */
export function savedChatId(files: File[]): string {
  return files
    .map(f => `${f.name}:${f.size}`)
    .sort()
    .join('|');
}

export async function saveChat(chat: SavedChat): Promise<void> {
  await run('readwrite', store => store.put(chat));
  // Pede ao navegador para não descartar os dados quando faltar espaço
  await navigator.storage?.persist?.().catch(() => false);
}

export async function listSavedChats(): Promise<SavedChat[]> {
  const chats = await run<SavedChat[]>('readonly', store => store.getAll() as IDBRequest<SavedChat[]>);
  return chats.sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteSavedChat(id: string): Promise<void> {
  await run('readwrite', store => store.delete(id));
}

export async function clearSavedChats(): Promise<void> {
  await run('readwrite', store => store.clear());
}
