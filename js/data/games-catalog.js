/* =========================================================================
   LIZKIDS — 5 JOGOS PREMIUM
   ========================================================================= */

export const CATEGORIES = [
  { id: 'all',    label: 'Todos',      color: '#4F7CFF' },
  { id: 'math',   label: 'Matemática', color: '#FF7BB5' },
  { id: 'lang',   label: 'Português',  color: '#5BE0A3' },
  { id: 'memory', label: 'Memória',    color: '#FFD23F' },
  { id: 'logic',  label: 'Raciocínio', color: '#B57BFF' },
];

export const GAMES = [
  {
    id: 'math-adventure',
    title: 'Aventura Matemática',
    desc: 'Desafie os personagens em batalhas matemáticas épicas!',
    category: 'math',
    color: '#FF7BB5',
    grad: 'linear-gradient(135deg,#FF7BB5,#B57BFF)',
    character: 'pip',
    minLevel: 1,
    levels: [
      { label: 'Fácil',     desc: 'Desafie o Bobo! Soma até 10'        },
      { label: 'Normal',    desc: 'A Mel desafia! Soma e subtração'     },
      { label: 'Difícil',   desc: 'Drako quer batalha! Multiplicação'   },
      { label: 'Mestre',    desc: 'Owly é o boss! Todas as operações'   },
    ],
  },
  {
    id: 'magic-words',
    title: 'Palavras Mágicas',
    desc: 'Forme palavras mágicas tocando as sílabas certas!',
    category: 'lang',
    color: '#5BE0A3',
    grad: 'linear-gradient(135deg,#7EE8D4,#1FA76A)',
    character: 'owly',
    minLevel: 1,
    levels: [
      { label: 'Fácil',   desc: 'Palavras de 2 sílabas'  },
      { label: 'Normal',  desc: 'Palavras de 3 sílabas'  },
      { label: 'Difícil', desc: 'Palavras de 4 sílabas'  },
      { label: 'Mestre',  desc: 'Mistura toda!'          },
    ],
  },
  {
    id: 'memory-magic',
    title: 'Memória Encantada',
    desc: 'Encontre todos os pares com sua memória mágica!',
    category: 'memory',
    color: '#FFD23F',
    grad: 'linear-gradient(135deg,#FFE894,#FF7BB5)',
    character: 'mel',
    minLevel: 1,
    levels: [
      { label: 'Fácil',   desc: '4 pares, sem tempo'    },
      { label: 'Normal',  desc: '6 pares, 90 segundos'  },
      { label: 'Difícil', desc: '8 pares, 70 segundos'  },
      { label: 'Mestre',  desc: '10 pares, 55 segundos' },
    ],
  },
  {
    id: 'logic-sequence',
    title: 'Sequência Lógica',
    desc: 'Descubra o padrão e complete a sequência!',
    category: 'logic',
    color: '#B57BFF',
    grad: 'linear-gradient(135deg,#DCC2FF,#7E47D4)',
    character: 'robo',
    minLevel: 1,
    levels: [
      { label: 'Fácil',   desc: '2 cores, padrão ABAB'        },
      { label: 'Normal',  desc: '3 cores e formas'            },
      { label: 'Difícil', desc: 'Padrões complexos'           },
      { label: 'Mestre',  desc: 'Sequências numéricas'        },
    ],
  },
  {
    id: 'shapes-sort',
    title: 'Cores e Formas',
    desc: 'Separe os objetos nas caixinhas certas!',
    category: 'logic',
    color: '#4F7CFF',
    grad: 'linear-gradient(135deg,#A3BFFF,#4F7CFF)',
    character: 'bobo',
    minLevel: 1,
    levels: [
      { label: 'Fácil',   desc: 'Separar por cor'             },
      { label: 'Normal',  desc: 'Separar por forma'           },
      { label: 'Difícil', desc: 'Cor E forma juntas'          },
      { label: 'Mestre',  desc: '4 categorias simultâneas'    },
    ],
  },
];

export const SHOP_ITEMS = [
  { id: 'unlock_drako', name: 'Dragão Drako',      price: 120, type: 'character', unlockCharacter: 'drako', art: 'drako' },
  { id: 'unlock_owly',  name: 'Coruja Owly',        price: 150, type: 'character', unlockCharacter: 'owly',  art: 'owly'  },
  { id: 'unlock_zap',   name: 'Coelho Zap',         price: 200, type: 'character', unlockCharacter: 'zap',   art: 'zap'   },
  { id: 'badge_math',   name: 'Medalha Matemática', price: 80,  type: 'badge',     art: 'medal'              },
  { id: 'badge_star',   name: 'Medalha Estrela',    price: 60,  type: 'badge',     art: 'star'               },
];
