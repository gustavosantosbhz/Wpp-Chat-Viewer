// Paleta de cores por remetente
export const SENDER_COLORS = [
  '#00a884', '#53bdeb', '#e9a740', '#e96c6c', '#b980f0',
  '#f06292', '#4dd0e1', '#aed581', '#ff8a65', '#7986cb',
  '#ce93d8', '#80cbc4', '#ffb74d', '#a1887f', '#90a4ae',
];

export function getSenderColorMap(participants: string[]): Map<string, string> {
  const map = new Map<string, string>();
  participants.forEach((name, index) => {
    map.set(name, SENDER_COLORS[index % SENDER_COLORS.length]);
  });
  return map;
}
