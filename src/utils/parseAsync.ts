import type { ParsedMessage } from '../types';
import { parseMessages } from './parser';

type WorkerMessage =
  | { type: 'progress'; current: number; total: number }
  | { type: 'result'; messages: ParsedMessage[] };

/** Faz o parsing em Web Worker; se o worker falhar, cai para a thread principal. */
export function parseMessagesAsync(
  text: string,
  onProgress?: (current: number, total: number) => void
): Promise<ParsedMessage[]> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(parseMessages(text, onProgress));
  }

  return new Promise(resolve => {
    const worker = new Worker(new URL('../workers/parser.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'progress') {
        onProgress?.(e.data.current, e.data.total);
        return;
      }
      worker.terminate();
      resolve(e.data.messages);
    };

    worker.onerror = () => {
      worker.terminate();
      resolve(parseMessages(text, onProgress));
    };

    worker.postMessage({ text });
  });
}
