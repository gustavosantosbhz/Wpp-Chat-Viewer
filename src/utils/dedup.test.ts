import { describe, expect, it } from 'vitest';
import { mergeMessageLists } from './dedup';
import { parseMessages } from './parser';

describe('mergeMessageLists', () => {
  it('preserva mensagens idênticas legítimas dentro de um único arquivo', () => {
    const list = parseMessages('12/03/2023 09:00 - Ana: ok\n12/03/2023 09:00 - Ana: ok');
    expect(mergeMessageLists([list])).toHaveLength(2);
  });

  it('remove a sobreposição entre exportações do mesmo chat', () => {
    const first = parseMessages(
      '12/03/2023 09:00 - Ana: oi\n12/03/2023 09:01 - Bruno: ok\n12/03/2023 09:01 - Bruno: ok'
    );
    const second = parseMessages(
      '12/03/2023 09:01 - Bruno: ok\n12/03/2023 09:01 - Bruno: ok\n12/03/2023 09:05 - Ana: fim'
    );

    const merged = mergeMessageLists([first, second]);

    expect(merged.map(m => m.text)).toEqual(['oi', 'ok', 'ok', 'fim']);
  });

  it('ordena cronologicamente ao juntar arquivos fora de ordem', () => {
    const later = parseMessages('13/03/2023 10:00 - Ana: depois');
    const earlier = parseMessages('12/03/2023 10:00 - Ana: antes');

    expect(mergeMessageLists([later, earlier]).map(m => m.text)).toEqual(['antes', 'depois']);
  });
});
