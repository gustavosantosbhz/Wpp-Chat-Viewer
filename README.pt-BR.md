# WhatsApp Chat Viewer

Português · [English](README.md)

Visualize, pesquise e exporte suas conversas do WhatsApp direto no navegador. Tudo roda **localmente** — nenhum arquivo é enviado a servidores.

## Recursos

- Carrega exportações `.txt` ou `.zip` (com mídia); vários arquivos do mesmo chat são unidos sem duplicar mensagens
- Exportações Android e iOS, datas `DD/MM` e `MM/DD`, horários em 24h e AM/PM
- Visual de celular que continua fluido com dezenas de milhares de mensagens (lista virtualizada e parsing em Web Worker)
- Formatação do WhatsApp (`*negrito*`, `_itálico_`, `~tachado~`, `` `código` ``), links, imagens, vídeos, áudios e arquivos
- Busca que ignora acentos e maiúsculas, com destaque; filtros por remetente, período, dia da semana, horário e tipo de conteúdo
- Estatísticas com gráficos (por horário, dia da semana e mês) e palavras mais usadas — cada barra, participante, mês e palavra é um filtro clicável
- Exportação em PDF (texto selecionável via impressão, ou imagem), Markdown, HTML, JSON e CSV (respeita os filtros ativos)
- Opção de lembrar conversas neste navegador (IndexedDB) e reabri-las depois
- PWA instalável que funciona offline após a primeira visita
- Temas escuro e claro

## Como exportar uma conversa no WhatsApp

Abra a conversa → ⋮ / nome do contato → **Exportar conversa** → escolha *Sem mídia* (`.txt`) ou *Incluir mídia* (`.zip`).

## Privacidade

Os arquivos nunca saem do navegador. "Lembrar esta conversa" vem desligado; quando ativado, os arquivos originais ficam no IndexedDB do navegador e podem ser excluídos a qualquer momento na tela inicial. Células do CSV que começam com `=`, `+`, `-` ou `@` recebem um apóstrofo na frente para que planilhas não as executem como fórmula (o JSON mantém o texto original).

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run lint     # ESLint
npm test         # testes unitários (Vitest)
npm run build    # checagem de tipos + build de produção
npm run preview  # serve o build de produção
```

O deploy no GitHub Pages é feito por `.github/workflows/deploy.yml` a cada push em `main`, após lint e testes passarem. Pull requests rodam lint, testes e build via `.github/workflows/ci.yml`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · react-window · JSZip · jsPDF + html2canvas · vite-plugin-pwa · Vitest

## Contribuições e suporte

Projeto pessoal, fornecido como está. **Não são aceitos issues, pull requests, perguntas nem sugestões** — veja [CONTRIBUTING.md](CONTRIBUTING.md). Forks e cópias são bem-vindos, conforme a licença abaixo.

## Licença

Licenciado sob a [PolyForm Noncommercial License 1.0.0](LICENSE): uso livre para fins pessoais, educacionais e outros não comerciais. Uso comercial exige autorização escrita do autor.

Required Notice: Copyright (c) 2026 Gustavo Santos
