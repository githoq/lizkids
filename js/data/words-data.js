/* =========================================================================
   LIZKIDS — BANCO DE PALAVRAS COM SVG ART
   Palavras PT-BR organizadas por nível de sílabas.
   Cada palavra tem: word, syllables[], image (SVG), distractors[]
   ========================================================================= */

/* ─── SVG Art ────────────────────────────────────────────────────────── */
const ART = {
  /* ── 2 sílabas ── */
  bola: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="#FF7BB5" stroke="#D94B8C" stroke-width="3"/><path d="M18 26 C30 18 50 18 62 26" fill="none" stroke="white" stroke-width="3.5" opacity="0.55"/><path d="M9 44 C24 36 56 36 71 44" fill="none" stroke="white" stroke-width="3.5" opacity="0.55"/><ellipse cx="28" cy="28" rx="9" ry="5" fill="white" opacity="0.3"/></svg>`,

  gato: `<svg viewBox="0 0 80 80"><polygon points="14,30 24,8 34,30" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><polygon points="46,30 56,8 66,30" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><polygon points="18,29 24,14 30,29" fill="#FF9BB5"/><polygon points="50,29 56,14 62,29" fill="#FF9BB5"/><circle cx="40" cy="48" r="26" fill="#FFD23F" stroke="#C97700" stroke-width="2.5"/><ellipse cx="30" cy="44" rx="5.5" ry="7" fill="#2E2257"/><ellipse cx="50" cy="44" rx="5.5" ry="7" fill="#2E2257"/><circle cx="32" cy="42" r="2" fill="white"/><circle cx="52" cy="42" r="2" fill="white"/><ellipse cx="40" cy="53" rx="4" ry="3" fill="#E84899"/><path d="M40 56 Q34 61 28 59" stroke="#5C1A3A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M40 56 Q46 61 52 59" stroke="#5C1A3A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,

  casa: `<svg viewBox="0 0 80 80"><polygon points="40,6 76,36 4,36" fill="#FF8A65" stroke="#C84800" stroke-width="2.5"/><rect x="10" y="35" width="60" height="40" rx="3" fill="#FFE894" stroke="#C97700" stroke-width="2.5"/><rect x="30" y="52" width="20" height="23" rx="3" fill="#B57BFF"/><rect x="14" y="42" width="14" height="14" rx="2" fill="#7EE8D4" stroke="#1A9C8C" stroke-width="1.5"/><rect x="52" y="42" width="14" height="14" rx="2" fill="#7EE8D4" stroke="#1A9C8C" stroke-width="1.5"/><circle cx="40" cy="59" r="2" fill="#FFD23F"/></svg>`,

  pato: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="56" rx="26" ry="18" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><circle cx="40" cy="34" r="18" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><path d="M52 32 Q66 28 66 36 Q66 42 52 40 Z" fill="#FF8A65"/><ellipse cx="47" cy="30" rx="5" ry="6" fill="#2E2257"/><circle cx="49" cy="29" r="2" fill="white"/><ellipse cx="32" cy="58" rx="11" ry="7" fill="#C97700" opacity="0.5" transform="rotate(-20 32 58)"/></svg>`,

  urso: `<svg viewBox="0 0 80 80"><circle cx="22" cy="24" r="12" fill="#C07000"/><circle cx="58" cy="24" r="12" fill="#C07000"/><circle cx="40" cy="46" r="30" fill="#C07000" stroke="#7A4500" stroke-width="2"/><ellipse cx="40" cy="58" rx="16" ry="11" fill="#E8B868"/><ellipse cx="28" cy="40" rx="5.5" ry="7" fill="#2E2257"/><ellipse cx="52" cy="40" rx="5.5" ry="7" fill="#2E2257"/><circle cx="30" cy="38" r="2" fill="white"/><circle cx="54" cy="38" r="2" fill="white"/><ellipse cx="40" cy="50" rx="4" ry="3" fill="#7A4500"/><path d="M40 53 Q35 58 30 56" stroke="#7A4500" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M40 53 Q45 58 50 56" stroke="#7A4500" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,

  leao: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" fill="#FF8A65" opacity="0.85"/><circle cx="40" cy="44" r="22" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><ellipse cx="29" cy="40" rx="5" ry="6.5" fill="#2E2257"/><ellipse cx="51" cy="40" rx="5" ry="6.5" fill="#2E2257"/><circle cx="31" cy="38.5" r="2" fill="white"/><circle cx="53" cy="38.5" r="2" fill="white"/><ellipse cx="40" cy="50" rx="4" ry="3" fill="#E84899"/><path d="M40 53 Q34 58 28 56" stroke="#5C1A3A" stroke-width="2" fill="none"/><path d="M40 53 Q46 58 52 56" stroke="#5C1A3A" stroke-width="2" fill="none"/><path d="M40 6 Q40 14 40 20" stroke="#C97700" stroke-width="3" stroke-linecap="round"/></svg>`,

  lobo: `<svg viewBox="0 0 80 80"><polygon points="24,32 18,10 34,28" fill="#9090B0"/><polygon points="56,32 62,10 46,28" fill="#9090B0"/><polygon points="26,31 22,16 32,29" fill="#E8E8FF"/><polygon points="54,31 58,16 48,29" fill="#E8E8FF"/><circle cx="40" cy="48" r="26" fill="#9090B0" stroke="#6060A0" stroke-width="2"/><ellipse cx="40" cy="58" rx="14" ry="9" fill="#D0D0EE"/><ellipse cx="28" cy="42" rx="5.5" ry="7" fill="#2E2257"/><ellipse cx="52" cy="42" rx="5.5" ry="7" fill="#2E2257"/><circle cx="30" cy="40" r="2" fill="#7EC8E0"/><circle cx="54" cy="40" r="2" fill="#7EC8E0"/><ellipse cx="40" cy="50" rx="4" ry="3" fill="#E84899"/></svg>`,

  foca: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="50" rx="28" ry="22" fill="#6090C0" stroke="#3060A0" stroke-width="2"/><circle cx="40" cy="28" r="20" fill="#6090C0" stroke="#3060A0" stroke-width="2"/><ellipse cx="28" cy="25" rx="5" ry="7" fill="#2E2257"/><ellipse cx="52" cy="25" rx="5" ry="7" fill="#2E2257"/><circle cx="30" cy="23" r="2" fill="white"/><circle cx="54" cy="23" r="2" fill="white"/><ellipse cx="40" cy="35" rx="5" ry="3" fill="#2E2257"/><ellipse cx="14" cy="58" rx="10" ry="5" fill="#4070A0" transform="rotate(-30 14 58)"/><ellipse cx="66" cy="58" rx="10" ry="5" fill="#4070A0" transform="rotate(30 66 58)"/></svg>`,

  /* ── 3 sílabas ── */
  macaco: `<svg viewBox="0 0 80 80"><circle cx="18" cy="36" r="12" fill="#C07000"/><circle cx="62" cy="36" r="12" fill="#C07000"/><circle cx="40" cy="44" r="28" fill="#C07000" stroke="#7A4500" stroke-width="2"/><ellipse cx="40" cy="54" rx="18" ry="12" fill="#E8B868"/><ellipse cx="27" cy="38" rx="6" ry="7.5" fill="#2E2257"/><ellipse cx="53" cy="38" rx="6" ry="7.5" fill="#2E2257"/><circle cx="29" cy="36" r="2.5" fill="white"/><circle cx="55" cy="36" r="2.5" fill="white"/><ellipse cx="40" cy="50" rx="5" ry="4" fill="#7A4500"/><path d="M40 10 Q50 6 55 14 Q58 20 50 22" stroke="#C07000" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,

  girafa: `<svg viewBox="0 0 80 80"><rect x="34" y="2" width="16" height="38" rx="8" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><circle cx="40" cy="20" r="14" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><ellipse cx="33" cy="14" rx="4" ry="6" fill="#2E2257"/><ellipse cx="47" cy="14" rx="4" ry="6" fill="#2E2257"/><circle cx="34.5" cy="12.5" r="1.5" fill="white"/><circle cx="48.5" cy="12.5" r="1.5" fill="white"/><ellipse cx="40" cy="56" rx="28" ry="18" fill="#FFD23F" stroke="#C97700" stroke-width="2"/><circle cx="28" cy="44" r="6" fill="#C97700" opacity="0.5"/><circle cx="52" cy="50" r="5" fill="#C97700" opacity="0.5"/><circle cx="40" cy="40" r="4" fill="#C97700" opacity="0.5"/></svg>`,

  banana: `<svg viewBox="0 0 80 80"><path d="M16 60 C20 30 44 12 62 18 C72 22 72 36 60 40 C46 44 30 44 24 68 Z" fill="#FFD23F" stroke="#C97700" stroke-width="3"/><path d="M18 58 C22 34 44 16 62 22" fill="none" stroke="#C97700" stroke-width="2" opacity="0.5"/><circle cx="62" cy="18" r="4" fill="#C97700"/><circle cx="22" cy="68" r="4" fill="#C97700"/></svg>`,

  cavalo: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="54" rx="28" ry="18" fill="#C07040"/><rect x="20" y="62" width="8" height="16" rx="4" fill="#C07040"/><rect x="34" y="64" width="8" height="14" rx="4" fill="#C07040"/><rect x="48" y="62" width="8" height="16" rx="4" fill="#C07040"/><ellipse cx="58" cy="36" rx="14" ry="20" fill="#C07040" stroke="#904020" stroke-width="2"/><ellipse cx="52" cy="22" rx="4" ry="8" fill="#C07040"/><ellipse cx="64" cy="22" rx="4" ry="8" fill="#C07040"/><ellipse cx="61" cy="34" rx="5" ry="6" fill="#2E2257"/><circle cx="63" cy="32" r="2" fill="white"/><path d="M68 46 C74 44 78 52 76 58" stroke="#904020" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,

  janela: `<svg viewBox="0 0 80 80"><rect x="8" y="10" width="64" height="60" rx="4" fill="#7EE8D4" stroke="#1A9C8C" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="70" stroke="#1A9C8C" stroke-width="3"/><line x1="8" y1="40" x2="72" y2="40" stroke="#1A9C8C" stroke-width="3"/><rect x="12" y="14" width="24" height="22" rx="2" fill="white" opacity="0.6"/><rect x="44" y="14" width="24" height="22" rx="2" fill="#FFE894" opacity="0.8"/><circle cx="14" cy="72" r="4" fill="#C97700"/><circle cx="66" cy="72" r="4" fill="#C97700"/></svg>`,

  tomate: `<svg viewBox="0 0 80 80"><path d="M40 14 C16 14 6 34 8 52 C10 68 24 76 40 76 C56 76 70 68 72 52 C74 34 64 14 40 14 Z" fill="#FF4040" stroke="#C80000" stroke-width="2.5"/><ellipse cx="40" cy="28" rx="20" ry="10" fill="#FF7070" opacity="0.4"/><path d="M36 14 C36 6 40 2 44 8" stroke="#1FA76A" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 14 C40 4 46 2 48 8" stroke="#1FA76A" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M30 16 C26 6 20 6 20 12" stroke="#1FA76A" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,

  sapato: `<svg viewBox="0 0 80 80"><path d="M8 60 C8 48 16 44 26 44 C32 44 38 42 44 38 C52 32 62 28 70 32 C76 36 76 46 68 52 C60 58 44 60 28 62 C18 64 8 68 8 60 Z" fill="#B57BFF" stroke="#7E47D4" stroke-width="2.5"/><path d="M8 60 C14 58 26 56 36 56 C44 56 54 56 64 52" fill="none" stroke="#7E47D4" stroke-width="2"/><ellipse cx="20" cy="48" rx="6" ry="4" fill="white" opacity="0.4"/><path d="M26 44 C28 38 32 34 36 36" stroke="#7E47D4" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,

  cebola: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="54" rx="28" ry="22" fill="#B57BFF" stroke="#7E47D4" stroke-width="2.5"/><ellipse cx="40" cy="54" rx="20" ry="15" fill="#DCC2FF" opacity="0.6"/><path d="M34 32 C34 18 40 12 40 12 C40 12 46 18 46 32" stroke="#7E47D4" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M36 12 C32 6 26 8 26 14" stroke="#1FA76A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 12 C48 6 54 8 54 14" stroke="#1FA76A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,

  /* ── 4 sílabas ── */
  borboleta: `<svg viewBox="0 0 80 80"><ellipse cx="20" cy="28" rx="18" ry="24" fill="#FF7BB5" stroke="#D94B8C" stroke-width="2" transform="rotate(-20 20 28)" opacity="0.9"/><ellipse cx="60" cy="28" rx="18" ry="24" fill="#FF7BB5" stroke="#D94B8C" stroke-width="2" transform="rotate(20 60 28)" opacity="0.9"/><ellipse cx="24" cy="58" rx="14" ry="18" fill="#FFD23F" stroke="#C97700" stroke-width="2" transform="rotate(-10 24 58)" opacity="0.85"/><ellipse cx="56" cy="58" rx="14" ry="18" fill="#FFD23F" stroke="#C97700" stroke-width="2" transform="rotate(10 56 58)" opacity="0.85"/><ellipse cx="40" cy="40" rx="5" ry="24" fill="#2E2257" stroke="#2E2257" stroke-width="1"/><circle cx="40" cy="20" r="6" fill="#2E2257"/><line x1="36" y1="18" x2="24" y2="10" stroke="#2E2257" stroke-width="2"/><line x1="44" y1="18" x2="56" y2="10" stroke="#2E2257" stroke-width="2"/></svg>`,

  tartaruga: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="30" ry="22" fill="#1FA76A" stroke="#0B6438" stroke-width="3"/><ellipse cx="40" cy="42" rx="24" ry="18" fill="#5BE0A3"/><path d="M22 38 L34 28 L46 28 L58 38" stroke="#0B6438" stroke-width="2" fill="none"/><path d="M28 42 L28 28" stroke="#0B6438" stroke-width="1.5"/><path d="M40 42 L40 28" stroke="#0B6438" stroke-width="1.5"/><path d="M52 42 L52 28" stroke="#0B6438" stroke-width="1.5"/><circle cx="40" cy="26" r="10" fill="#1FA76A" stroke="#0B6438" stroke-width="2.5"/><ellipse cx="36" cy="24" rx="3.5" ry="5" fill="#2E2257"/><ellipse cx="44" cy="24" rx="3.5" ry="5" fill="#2E2257"/><circle cx="37" cy="22" r="1.5" fill="white"/><circle cx="45" cy="22" r="1.5" fill="white"/><ellipse cx="16" cy="52" rx="8" ry="5" fill="#1FA76A" stroke="#0B6438" stroke-width="2"/><ellipse cx="64" cy="52" rx="8" ry="5" fill="#1FA76A" stroke="#0B6438" stroke-width="2"/><ellipse cx="22" cy="62" rx="8" ry="5" fill="#1FA76A" stroke="#0B6438" stroke-width="2"/><ellipse cx="58" cy="62" rx="8" ry="5" fill="#1FA76A" stroke="#0B6438" stroke-width="2"/></svg>`,

  bicicleta: `<svg viewBox="0 0 80 80"><circle cx="20" cy="56" r="16" fill="none" stroke="#4F7CFF" stroke-width="4"/><circle cx="60" cy="56" r="16" fill="none" stroke="#4F7CFF" stroke-width="4"/><circle cx="20" cy="56" r="3" fill="#4F7CFF"/><circle cx="60" cy="56" r="3" fill="#4F7CFF"/><path d="M20 56 L36 36 L50 36 L60 56" stroke="#4F7CFF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 36 L40 56" stroke="#4F7CFF" stroke-width="3" fill="none"/><path d="M32 36 L40 36" stroke="#4F7CFF" stroke-width="3" stroke-linecap="round"/><rect x="38" y="28" width="8" height="10" rx="3" fill="#FF7BB5"/></svg>`,

  elefante: `<svg viewBox="0 0 80 80"><ellipse cx="42" cy="50" rx="30" ry="22" fill="#9090C0"/><circle cx="24" cy="36" r="18" fill="#9090C0" stroke="#6060A0" stroke-width="2"/><ellipse cx="16" cy="26" rx="7" ry="12" fill="#9090C0" stroke="#6060A0" stroke-width="2"/><ellipse cx="32" cy="26" rx="7" ry="12" fill="#9090C0" stroke="#6060A0" stroke-width="2"/><ellipse cx="20" cy="34" rx="5.5" ry="7" fill="#2E2257"/><ellipse cx="28" cy="34" rx="5.5" ry="7" fill="#2E2257"/><circle cx="22" cy="32" r="2" fill="white"/><circle cx="30" cy="32" r="2" fill="white"/><path d="M24 48 C24 52 22 60 26 70 C28 76 22 78 20 74 C18 70 20 64 20 58" stroke="#9090C0" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="62" cy="34" rx="8" ry="20" fill="#9090C0" stroke="#6060A0" stroke-width="2"/></svg>`,

  televisao: `<svg viewBox="0 0 80 80"><rect x="8" y="12" width="64" height="48" rx="8" fill="#2E2257" stroke="#1A1240" stroke-width="3"/><rect x="14" y="18" width="52" height="36" rx="4" fill="#7EE8D4"/><rect x="14" y="18" width="52" height="10" rx="0" fill="#4F7CFF" opacity="0.5" rx="4"/><ellipse cx="40" cy="36" rx="14" ry="14" fill="#FFD23F" opacity="0.8"/><ellipse cx="40" cy="34" rx="6" ry="8" fill="#FF7BB5" opacity="0.9"/><rect x="30" y="60" width="20" height="8" rx="2" fill="#6060A0"/><rect x="20" y="68" width="40" height="6" rx="3" fill="#4040A0"/><circle cx="62" cy="26" r="4" fill="#FF7BB5"/><circle cx="62" cy="36" r="3" fill="#5BE0A3"/><circle cx="62" cy="44" r="3" fill="#FFD23F"/></svg>`,
};

/* ─── Banco de palavras por nível ───────────────────────────────────── */
export const WORDS = {
  1: [
    { word: 'BOLA',  syllables: ['BO','LA'],  art: ART.bola,  distract: ['GA','CA','PA'] },
    { word: 'GATO',  syllables: ['GA','TO'],  art: ART.gato,  distract: ['BO','LO','CA'] },
    { word: 'CASA',  syllables: ['CA','SA'],  art: ART.casa,  distract: ['GA','BO','LA'] },
    { word: 'PATO',  syllables: ['PA','TO'],  art: ART.pato,  distract: ['GA','CA','BO'] },
    { word: 'URSO',  syllables: ['UR','SO'],  art: ART.urso,  distract: ['GA','CA','TO'] },
    { word: 'LEÃO',  syllables: ['LE','ÃO'],  art: ART.leao,  distract: ['GA','CA','BO'] },
    { word: 'LOBO',  syllables: ['LO','BO'],  art: ART.lobo,  distract: ['GA','CA','TO'] },
    { word: 'FOCA',  syllables: ['FO','CA'],  art: ART.foca,  distract: ['GA','BO','LO'] },
  ],
  2: [
    { word: 'MACACO',  syllables: ['MA','CA','CO'],  art: ART.macaco,  distract: ['BO','LA','GA','TO'] },
    { word: 'GIRAFA',  syllables: ['GI','RA','FA'],  art: ART.girafa,  distract: ['BO','CA','TO','LA'] },
    { word: 'BANANA',  syllables: ['BA','NA','NA'],  art: ART.banana,  distract: ['BO','CA','GA','TO'] },
    { word: 'CAVALO',  syllables: ['CA','VA','LO'],  art: ART.cavalo,  distract: ['BO','GA','TO','NA'] },
    { word: 'JANELA',  syllables: ['JA','NE','LA'],  art: ART.janela,  distract: ['BO','CA','GA','MA'] },
    { word: 'TOMATE',  syllables: ['TO','MA','TE'],  art: ART.tomate,  distract: ['BO','CA','GA','LA'] },
    { word: 'SAPATO',  syllables: ['SA','PA','TO'],  art: ART.sapato,  distract: ['BO','CA','GA','LA'] },
    { word: 'CEBOLA',  syllables: ['CE','BO','LA'],  art: ART.cebola,  distract: ['GA','TO','CA','MA'] },
  ],
  3: [
    { word: 'BORBOLETA',  syllables: ['BOR','BO','LE','TA'],  art: ART.borboleta,  distract: ['GA','CA','TO','MA'] },
    { word: 'TARTARUGA',  syllables: ['TAR','TA','RU','GA'],  art: ART.tartaruga,  distract: ['BO','LE','CA','TO'] },
    { word: 'BICICLETA',  syllables: ['BI','CI','CLE','TA'],  art: ART.bicicleta,  distract: ['BO','CA','GA','TO'] },
    { word: 'ELEFANTE',   syllables: ['E','LE','FAN','TE'],   art: ART.elefante,   distract: ['BO','CA','GA','TO'] },
    { word: 'TELEVISÃO',  syllables: ['TE','LE','VI','SÃO'],  art: ART.televisao,  distract: ['BO','CA','GA','TO'] },
  ],
};

/* Nível 4: mix aleatório de 2+3+4 sílabas */
WORDS[4] = [...WORDS[1], ...WORDS[2], ...WORDS[3]];
