// Palavras muito comuns (pt-BR e en) ignoradas no ranking de palavras mais usadas.
// Comparadas já sem acento e em minúsculas (ver foldText).
export const STOP_WORDS = new Set(
  (
    // português
    'a o as os um uma uns umas de do da dos das em no na nos nas por pra para com sem sob sobre ate ' +
    'e ou mas se que qual quais quem como quando onde porque porem pois entao tambem ainda ja so ' +
    'eu tu ele ela nos vos eles elas voce voces me te lhe lhes meu minha meus minhas seu sua seus suas ' +
    'teu tua nosso nossa isso isto aquilo esse essa esses essas este esta estes estas aquele aquela ' +
    'ser sou eh e foi era sao estou esta estao estava tem tenho tinha ter vai vou vamos foi fui ' +
    'ao aos num numa nem mais menos muito muita muitos muitas bem la ai aqui ali so nao sim ' +
    'pq vc vcs tb tbm q d p n s ta to tava ne neh kkk kkkk kkkkk haha ' +
    'midia oculta arquivo anexado omitido mensagem apagada ' +
    // inglês
    'the an and or but if of to in on at by for with from as is are was were be been am it its this that ' +
    'these those i you he she we they me him her us them my your his our their not no yes do does did ' +
    'have has had will would can could just so ok media omitted file attached deleted message'
  ).split(/\s+/)
);
