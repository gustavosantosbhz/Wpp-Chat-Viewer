import { describe, expect, it } from 'vitest';
import { getMediaCaption, parseMessages } from './parser';

const ANDROID = `12/03/2023 09:15 - As mensagens são protegidas com a criptografia de ponta a ponta.
12/03/2023 09:16 - Ana: Bom dia!
12/03/2023 09:17 - Bruno: Bom dia
tudo bem?

Vamos almoçar?
12/03/2023 09:20 - Ana entrou usando o link de convite
12/03/2023 09:21 - Ana: IMG-20230312-WA0001.jpg (arquivo anexado)
Olha a foto`;

const IOS = `[12/03/2023 09:16:10] Ana: Bom dia!
[12/03/2023 09:17:42] Bruno: <anexado: 00000001-PHOTO-2023.jpg>
[12/03/2023 09:18:00] Bruno: <Mídia oculta>`;

describe('parseMessages', () => {
  it('lê o formato Android e separa mensagens de sistema', () => {
    const messages = parseMessages(ANDROID);

    expect(messages).toHaveLength(5);
    expect(messages[0]).toMatchObject({ isSystemMessage: true, sender: '' });
    expect(messages[1]).toMatchObject({ sender: 'Ana', text: 'Bom dia!', date: '12/03/2023', time: '09:16' });
    // Mensagem de sistema no meio do chat não pode ser engolida pela anterior
    expect(messages[3]).toMatchObject({ isSystemMessage: true, text: 'Ana entrou usando o link de convite' });
    expect(messages[2].text).toBe('Bom dia\ntudo bem?\n\nVamos almoçar?');
  });

  it('reconhece mídia anexada com legenda', () => {
    const media = parseMessages(ANDROID)[4];

    expect(media.mediaFilename).toBe('IMG-20230312-WA0001.jpg');
    expect(media.mediaType).toBe('image');
    expect(getMediaCaption(media.text)).toBe('Olha a foto');
  });

  it('lê o formato iOS com colchetes, segundos e <anexado: ...>', () => {
    const messages = parseMessages(IOS);

    expect(messages).toHaveLength(3);
    expect(messages[0]).toMatchObject({ sender: 'Ana', time: '09:16' });
    expect(messages[1]).toMatchObject({ mediaFilename: '00000001-PHOTO-2023.jpg', mediaType: 'image' });
    expect(messages[2].mediaFilename).toBeUndefined();
    expect(getMediaCaption(messages[2].text)).toBe('');
  });

  it('aceita BOM, CRLF e marcas invisíveis', () => {
    const text = '﻿‎[12/03/2023 09:16:10] Ana: oi\r\n‎[12/03/2023 09:17:00] Bruno: olá';
    expect(parseMessages(text).map(m => m.sender)).toEqual(['Ana', 'Bruno']);
  });

  it('normaliza data americana com AM/PM e ano de 2 dígitos', () => {
    const [first, second] = parseMessages(
      '3/25/23, 11:59 PM - Ana: boa noite\n3/26/23, 12:05 AM - Bruno: virou o dia'
    );

    expect(first).toMatchObject({ date: '25/03/2023', time: '23:59' });
    expect(second).toMatchObject({ date: '26/03/2023', time: '00:05' });
    expect(second.timestamp).toBeGreaterThan(first.timestamp);
  });

  it('assume DD/MM quando a data é ambígua', () => {
    const [message] = parseMessages('01/02/2023 10:00 - Ana: oi');
    expect(message.date).toBe('01/02/2023');
  });

  it('reporta progresso', () => {
    const calls: number[] = [];
    parseMessages(ANDROID, (current, total) => calls.push(current / total));
    expect(calls.at(-1)).toBe(1);
  });
});
