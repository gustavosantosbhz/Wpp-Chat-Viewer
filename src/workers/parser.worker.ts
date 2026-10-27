import { parseMessages } from '../utils/parser';

// Web Worker: o parsing de chats grandes roda fora da thread da UI
self.onmessage = (e: MessageEvent<{ text: string }>) => {
  const messages = parseMessages(e.data.text, (current, total) => {
    self.postMessage({ type: 'progress', current, total });
  });
  self.postMessage({ type: 'result', messages });
};
