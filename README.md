# LizKids — Plataforma Educacional Infantil

Plataforma educacional infantil completa em estilo cinematográfico Pixar/Disney, com sistema multi-perfil, painel da professora, jogos educativos e PWA instalável.

## Como executar

Como o projeto usa módulos ES6 (`import/export`), **não pode ser aberto direto com clique duplo no `index.html`**. É preciso servir os arquivos por HTTP.

Opção 1 — Python (mais simples, já vem no Mac/Linux/Windows):

```bash
cd lizkids
python3 -m http.server 8080
# Abra http://localhost:8080
```

Opção 2 — Node:

```bash
cd lizkids
npx serve -p 8080
```

Opção 3 — VS Code: instale a extensão "Live Server" e clique direito no `index.html` → "Open with Live Server".

## Funcionalidades

- **Sistema multi-perfil** estilo Netflix/Disney+ com avatar, nível, XP, moedas, estrelas
- **6 jogos jogáveis** (Memória, Matemática, Sequência Lógica, Contar, Comparar, Cores & Formas) + 6 espaços reservados para expansão
- **Salvamento automático** em LocalStorage com versionamento (chave `lizkids_v1`)
- **Painel da Professora** com estatísticas agregadas, ranking de alunos, gráfico de estrelas por jogo e log de atividades
- **Loja de recompensas** com desbloqueio de personagens por moedas
- **Áudio procedural** via Web Audio API (sem arquivos externos)
- **PWA instalável** com service worker para uso offline
- **Cenário animado** com céu, nuvens, sol, partículas e colinas
- **8 personagens SVG originais** (Lumi, Bobo, Pip, Robo, Mel, Drako, Owly, Zap)

## Estrutura

```
lizkids/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── service-worker.js       # Cache offline
├── assets/icons/           # Ícones PWA
├── css/
│   ├── design-system.css   # Tokens (cores, tipografia, espaçamento)
│   ├── animations.css      # Keyframes globais
│   ├── components.css      # Botões, cards, badges, modais
│   ├── screens.css         # Estilos por tela
│   └── games.css           # Estilos dos jogos
└── js/
    ├── main.js             # Bootstrap
    ├── core/               # Storage, State, Router, Audio, Particles, Utils
    ├── components/         # UI compartilhada (TopBar, SkyStage, ResultModal)
    ├── data/               # Personagens SVG + catálogo de jogos
    ├── screens/            # Splash, Profile, Home, Library, Teacher, Shop, GameHost
    └── games/              # Memory, Math, Sequence, Count, Compare, Shapes
```

## Fluxo de uso

1. **Splash** → carrega 2.6s, vai para seleção de perfil
2. **Profile Select** → escolher perfil existente, criar novo ou entrar no painel da professora
3. **Home** → cumprimento personalizado, mascote do perfil, atalhos para biblioteca e loja
4. **Library** → grid de jogos filtráveis por categoria, jogos travados por nível
5. **Game** → joga, ganha estrelas/moedas/XP, sobe de nível
6. **Shop** → gasta moedas para desbloquear novos personagens
7. **Teacher** → vê progresso da turma toda

## Atalhos de teclado

- `ESC` — voltar uma tela
- Primeiro clique/toque ativa o áudio (requisito dos browsers)

## Como expandir

Adicionar um novo jogo:
1. Criar `js/games/meu-jogo.js` exportando `{ mount(gameDef), unmount() }`
2. Importar em `js/screens/game-host.js` e registrar no `REGISTRY`
3. Adicionar entrada em `js/data/games-catalog.js`
