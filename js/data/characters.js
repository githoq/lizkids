/* =========================================================================
   LIZKIDS — BIBLIOTECA DE PERSONAGENS SVG ORIGINAIS
   Personagens inspirados em estilo Pixar/Disney: olhos grandes, formas
   arredondadas, gradientes suaves, sombras cinematográficas.
   ========================================================================= */

export const CHARACTERS = {

  /* ----- LUMI — Mascote oficial da LizKids (estrela mágica) ----- */
  lumi: (opts = {}) => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lumiBody" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#FFF6C2"/>
          <stop offset="55%" stop-color="#FFD23F"/>
          <stop offset="100%" stop-color="#F4A300"/>
        </radialGradient>
        <radialGradient id="lumiCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FF7BB5" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#FF7BB5" stop-opacity="0"/>
        </radialGradient>
        <filter id="lumiShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <!-- Sombra inferior -->
      <ellipse cx="120" cy="220" rx="58" ry="9" fill="#2E2257" opacity="0.18" filter="url(#lumiShadow)"/>
      <!-- Brilho aurora atrás -->
      <circle cx="120" cy="115" r="100" fill="#FFD23F" opacity="0.18" filter="url(#lumiShadow)"/>
      <!-- Corpo da estrela 5 pontas, arredondada -->
      <path d="M120 20
               C 130 20 138 32 144 52
               C 150 72 162 78 184 78
               C 206 78 218 90 214 108
               C 210 126 198 134 184 148
               C 170 162 174 178 184 198
               C 194 218 178 230 158 222
               C 138 214 128 220 120 230
               C 112 220 102 214 82 222
               C 62 230 46 218 56 198
               C 66 178 70 162 56 148
               C 42 134 30 126 26 108
               C 22 90 34 78 56 78
               C 78 78 90 72 96 52
               C 102 32 110 20 120 20 Z"
            fill="url(#lumiBody)"
            stroke="#C97700" stroke-width="3"
            stroke-linejoin="round"/>
      <!-- Highlight -->
      <path d="M82 60 Q 100 50 110 62 Q 90 70 78 80 Z" fill="#FFF" opacity="0.45"/>
      <!-- Bochechas -->
      <circle cx="80" cy="130" r="14" fill="url(#lumiCheek)"/>
      <circle cx="160" cy="130" r="14" fill="url(#lumiCheek)"/>
      <!-- Olhos grandes -->
      <g class="char-eyes">
        <ellipse cx="98"  cy="112" rx="14" ry="18" fill="#2E2257"/>
        <ellipse cx="142" cy="112" rx="14" ry="18" fill="#2E2257"/>
        <circle  cx="102" cy="106" r="6" fill="#fff"/>
        <circle  cx="146" cy="106" r="6" fill="#fff"/>
        <circle  cx="95"  cy="120" r="3" fill="#fff"/>
        <circle  cx="139" cy="120" r="3" fill="#fff"/>
      </g>
      <!-- Sorriso -->
      <path d="M100 142 Q 120 162 140 142"
            stroke="#2E2257" stroke-width="5"
            fill="#5C1A3A" stroke-linecap="round" stroke-linejoin="round"
            class="char-mouth"/>
      <path d="M104 148 Q 120 158 136 148 Q 130 154 120 156 Q 110 154 104 148Z"
            fill="#FF7BB5" opacity="0.6"/>
    </svg>`,

  /* ----- BOBO — criatura azul fofa ----- */
  bobo: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="boboBody" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#A3BFFF"/>
          <stop offset="60%" stop-color="#4F7CFF"/>
          <stop offset="100%" stop-color="#2F4FCC"/>
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="220" rx="60" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Corpinho redondo com orelhinhas -->
      <path d="M70 80 Q 60 30 100 50 Q 120 30 140 50 Q 180 30 170 80
               Q 210 110 200 160 Q 190 220 120 220 Q 50 220 40 160 Q 30 110 70 80 Z"
            fill="url(#boboBody)" stroke="#1F3399" stroke-width="3" stroke-linejoin="round"/>
      <!-- Barriguinha -->
      <ellipse cx="120" cy="160" rx="55" ry="50" fill="#DCEBFF" opacity="0.55"/>
      <!-- Bochechas -->
      <circle cx="78"  cy="148" r="12" fill="#FF7BB5" opacity="0.65"/>
      <circle cx="162" cy="148" r="12" fill="#FF7BB5" opacity="0.65"/>
      <!-- Olhos -->
      <g class="char-eyes">
        <ellipse cx="98"  cy="120" rx="13" ry="17" fill="#2E2257"/>
        <ellipse cx="142" cy="120" rx="13" ry="17" fill="#2E2257"/>
        <circle  cx="102" cy="114" r="5" fill="#fff"/>
        <circle  cx="146" cy="114" r="5" fill="#fff"/>
      </g>
      <!-- Sorrisinho -->
      <path d="M102 158 Q 120 174 138 158" stroke="#2E2257" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <!-- Antena -->
      <path d="M120 50 L 120 25" stroke="#1F3399" stroke-width="4" stroke-linecap="round"/>
      <circle cx="120" cy="22" r="9" fill="#FFD23F" stroke="#F4A300" stroke-width="2"/>
    </svg>`,

  /* ----- PIP — criaturinha rosa de orelhas grandes ----- */
  pip: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pipBody" cx="40%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#FFC2DD"/>
          <stop offset="60%" stop-color="#FF7BB5"/>
          <stop offset="100%" stop-color="#D94B8C"/>
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="222" rx="58" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Orelhas -->
      <path d="M55 70 Q 30 25 75 40 Q 80 80 75 110 Z" fill="url(#pipBody)" stroke="#A82D6C" stroke-width="3" stroke-linejoin="round"/>
      <path d="M185 70 Q 210 25 165 40 Q 160 80 165 110 Z" fill="url(#pipBody)" stroke="#A82D6C" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="62" cy="65" rx="8" ry="20" fill="#FFE6F2" transform="rotate(-15 62 65)"/>
      <ellipse cx="178" cy="65" rx="8" ry="20" fill="#FFE6F2" transform="rotate(15 178 65)"/>
      <!-- Corpo -->
      <ellipse cx="120" cy="140" rx="76" ry="78" fill="url(#pipBody)" stroke="#A82D6C" stroke-width="3"/>
      <!-- Barriga -->
      <ellipse cx="120" cy="160" rx="50" ry="42" fill="#FFE6F2" opacity="0.5"/>
      <!-- Bochechas -->
      <circle cx="78"  cy="152" r="11" fill="#FF4D8B" opacity="0.7"/>
      <circle cx="162" cy="152" r="11" fill="#FF4D8B" opacity="0.7"/>
      <!-- Olhos grandes -->
      <g class="char-eyes">
        <ellipse cx="98"  cy="128" rx="13" ry="17" fill="#2E2257"/>
        <ellipse cx="142" cy="128" rx="13" ry="17" fill="#2E2257"/>
        <circle  cx="102" cy="122" r="5" fill="#fff"/>
        <circle  cx="146" cy="122" r="5" fill="#fff"/>
        <circle  cx="95"  cy="135" r="2.5" fill="#fff"/>
        <circle  cx="139" cy="135" r="2.5" fill="#fff"/>
      </g>
      <!-- Boquinha pequena -->
      <path d="M112 165 Q 120 175 128 165" stroke="#2E2257" stroke-width="4" fill="#5C1A3A" stroke-linecap="round"/>
    </svg>`,

  /* ----- ROBO — robozinho amigável ----- */
  robo: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roboBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stop-color="#DCC2FF"/>
          <stop offset="60%" stop-color="#B57BFF"/>
          <stop offset="100%" stop-color="#7E47D4"/>
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="222" rx="58" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Antena -->
      <line x1="120" y1="50" x2="120" y2="28" stroke="#6A3CC2" stroke-width="4" stroke-linecap="round"/>
      <circle cx="120" cy="24" r="9" fill="#5BE0A3" stroke="#1FA76A" stroke-width="2">
        <animate attributeName="fill" values="#5BE0A3;#FFD23F;#5BE0A3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <!-- Cabeça -->
      <rect x="58" y="50" width="124" height="98" rx="32" fill="url(#roboBody)" stroke="#5728A1" stroke-width="3"/>
      <!-- Painel olho -->
      <rect x="72" y="78" width="96" height="44" rx="22" fill="#2E2257"/>
      <circle cx="100" cy="100" r="11" fill="#5BE0A3"/>
      <circle cx="140" cy="100" r="11" fill="#5BE0A3"/>
      <circle cx="103" cy="96" r="3" fill="#fff"/>
      <circle cx="143" cy="96" r="3" fill="#fff"/>
      <!-- Bochecha LED -->
      <circle cx="74"  cy="130" r="6" fill="#FF7BB5"/>
      <circle cx="166" cy="130" r="6" fill="#FF7BB5"/>
      <!-- Corpo -->
      <rect x="70" y="148" width="100" height="64" rx="22" fill="url(#roboBody)" stroke="#5728A1" stroke-width="3"/>
      <rect x="86" y="166" width="68" height="24" rx="10" fill="#FFE894" opacity="0.7"/>
      <circle cx="100" cy="178" r="4" fill="#F4A300"/>
      <circle cx="120" cy="178" r="4" fill="#5BE0A3"/>
      <circle cx="140" cy="178" r="4" fill="#FF7BB5"/>
    </svg>`,

  /* ----- MEL — gatinha mágica ----- */
  mel: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="melBody" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#FFE894"/>
          <stop offset="60%" stop-color="#FFD23F"/>
          <stop offset="100%" stop-color="#C97700"/>
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="222" rx="58" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Orelhas -->
      <path d="M70 70 L 60 30 L 100 55 Z" fill="url(#melBody)" stroke="#8A4D00" stroke-width="3" stroke-linejoin="round"/>
      <path d="M170 70 L 180 30 L 140 55 Z" fill="url(#melBody)" stroke="#8A4D00" stroke-width="3" stroke-linejoin="round"/>
      <path d="M76 60 L 70 40 L 92 56 Z" fill="#FF7BB5"/>
      <path d="M164 60 L 170 40 L 148 56 Z" fill="#FF7BB5"/>
      <!-- Cabeça -->
      <ellipse cx="120" cy="130" rx="78" ry="80" fill="url(#melBody)" stroke="#8A4D00" stroke-width="3"/>
      <!-- Bochechas -->
      <circle cx="75"  cy="142" r="12" fill="#FF7BB5" opacity="0.7"/>
      <circle cx="165" cy="142" r="12" fill="#FF7BB5" opacity="0.7"/>
      <!-- Olhos -->
      <g class="char-eyes">
        <ellipse cx="96"  cy="118" rx="11" ry="16" fill="#2E2257"/>
        <ellipse cx="144" cy="118" rx="11" ry="16" fill="#2E2257"/>
        <circle  cx="100" cy="112" r="4" fill="#fff"/>
        <circle  cx="148" cy="112" r="4" fill="#fff"/>
      </g>
      <!-- Narizinho -->
      <path d="M115 138 L 125 138 L 120 145 Z" fill="#FF4D8B"/>
      <!-- Boquinha -->
      <path d="M120 145 Q 115 155 108 152" stroke="#2E2257" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M120 145 Q 125 155 132 152" stroke="#2E2257" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Bigodes -->
      <line x1="60" y1="135" x2="85" y2="138" stroke="#8A4D00" stroke-width="2" stroke-linecap="round"/>
      <line x1="60" y1="145" x2="85" y2="146" stroke="#8A4D00" stroke-width="2" stroke-linecap="round"/>
      <line x1="180" y1="135" x2="155" y2="138" stroke="#8A4D00" stroke-width="2" stroke-linecap="round"/>
      <line x1="180" y1="145" x2="155" y2="146" stroke="#8A4D00" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  /* ----- DRAKO — dragãozinho verde ----- */
  drako: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="drakoBody" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#B7F2D7"/>
          <stop offset="55%" stop-color="#5BE0A3"/>
          <stop offset="100%" stop-color="#1FA76A"/>
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="222" rx="60" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Espinhos -->
      <path d="M70 92 L 60 70 L 80 80 M 95 70 L 90 50 L 110 65 M 130 65 L 140 50 L 150 70 M 160 80 L 180 70 L 170 92"
            stroke="#0F6B41" stroke-width="3" fill="#1FA76A" stroke-linejoin="round"/>
      <!-- Cabeça grande -->
      <ellipse cx="120" cy="135" rx="80" ry="80" fill="url(#drakoBody)" stroke="#0F6B41" stroke-width="3"/>
      <!-- Barriga -->
      <ellipse cx="120" cy="160" rx="46" ry="38" fill="#E7FCF1" opacity="0.6"/>
      <!-- Bochechas -->
      <circle cx="76"  cy="148" r="11" fill="#FF7BB5" opacity="0.65"/>
      <circle cx="164" cy="148" r="11" fill="#FF7BB5" opacity="0.65"/>
      <!-- Olhos -->
      <g class="char-eyes">
        <ellipse cx="96"  cy="118" rx="13" ry="17" fill="#2E2257"/>
        <ellipse cx="144" cy="118" rx="13" ry="17" fill="#2E2257"/>
        <circle  cx="100" cy="112" r="5" fill="#fff"/>
        <circle  cx="148" cy="112" r="5" fill="#fff"/>
      </g>
      <!-- Narinas -->
      <ellipse cx="110" cy="148" rx="3" ry="2" fill="#0F6B41"/>
      <ellipse cx="130" cy="148" rx="3" ry="2" fill="#0F6B41"/>
      <!-- Sorrindo com dentinho -->
      <path d="M96 165 Q 120 188 144 165" stroke="#2E2257" stroke-width="4.5" fill="#5C1A3A" stroke-linecap="round"/>
      <path d="M112 175 L 116 184 L 120 175" fill="#fff" stroke="#2E2257" stroke-width="1.5"/>
    </svg>`,

  /* ----- CORUJINHA OWLY ----- */
  owly: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="owlyBody" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#DCC2FF"/>
          <stop offset="60%" stop-color="#7E47D4"/>
          <stop offset="100%" stop-color="#5728A1"/>
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="222" rx="58" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Tufos -->
      <path d="M68 65 L 60 35 L 90 60 Z" fill="#5728A1"/>
      <path d="M172 65 L 180 35 L 150 60 Z" fill="#5728A1"/>
      <!-- Corpo -->
      <ellipse cx="120" cy="135" rx="78" ry="84" fill="url(#owlyBody)" stroke="#3E1A7A" stroke-width="3"/>
      <!-- Peito -->
      <ellipse cx="120" cy="155" rx="48" ry="58" fill="#FFE894" opacity="0.95"/>
      <!-- Olhos enormes -->
      <circle cx="92"  cy="115" r="26" fill="#fff" stroke="#3E1A7A" stroke-width="3"/>
      <circle cx="148" cy="115" r="26" fill="#fff" stroke="#3E1A7A" stroke-width="3"/>
      <g class="char-eyes">
        <circle cx="94"  cy="118" r="14" fill="#2E2257"/>
        <circle cx="146" cy="118" r="14" fill="#2E2257"/>
        <circle cx="98"  cy="114" r="5" fill="#fff"/>
        <circle cx="150" cy="114" r="5" fill="#fff"/>
      </g>
      <!-- Bico -->
      <path d="M120 138 L 110 152 L 130 152 Z" fill="#FFD23F" stroke="#C97700" stroke-width="2"/>
      <!-- Asas -->
      <path d="M48 130 Q 30 170 60 195 Q 75 175 70 145 Z" fill="#5728A1" stroke="#3E1A7A" stroke-width="3"/>
      <path d="M192 130 Q 210 170 180 195 Q 165 175 170 145 Z" fill="#5728A1" stroke="#3E1A7A" stroke-width="3"/>
    </svg>`,

  /* ----- ZAP — coelho amarelo ----- */
  zap: () => `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="zapBody" cx="35%" cy="30%" r="80%">
          <stop offset="0%"  stop-color="#FFF9D6"/>
          <stop offset="55%" stop-color="#FFE894"/>
          <stop offset="100%" stop-color="#F4A300"/>
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="222" rx="60" ry="9" fill="#2E2257" opacity="0.2"/>
      <!-- Orelhas longas -->
      <ellipse cx="90"  cy="50" rx="14" ry="40" fill="url(#zapBody)" stroke="#C97700" stroke-width="3" transform="rotate(-12 90 50)"/>
      <ellipse cx="150" cy="50" rx="14" ry="40" fill="url(#zapBody)" stroke="#C97700" stroke-width="3" transform="rotate(12 150 50)"/>
      <ellipse cx="90"  cy="55" rx="6" ry="22" fill="#FF7BB5" transform="rotate(-12 90 55)"/>
      <ellipse cx="150" cy="55" rx="6" ry="22" fill="#FF7BB5" transform="rotate(12 150 55)"/>
      <!-- Cabeça -->
      <ellipse cx="120" cy="140" rx="78" ry="74" fill="url(#zapBody)" stroke="#C97700" stroke-width="3"/>
      <!-- Bochechas -->
      <circle cx="78"  cy="150" r="11" fill="#FF7BB5" opacity="0.65"/>
      <circle cx="162" cy="150" r="11" fill="#FF7BB5" opacity="0.65"/>
      <!-- Olhos -->
      <g class="char-eyes">
        <ellipse cx="98"  cy="126" rx="11" ry="15" fill="#2E2257"/>
        <ellipse cx="142" cy="126" rx="11" ry="15" fill="#2E2257"/>
        <circle  cx="101" cy="121" r="4" fill="#fff"/>
        <circle  cx="145" cy="121" r="4" fill="#fff"/>
      </g>
      <!-- Nariz -->
      <ellipse cx="120" cy="152" rx="6" ry="4" fill="#FF4D8B"/>
      <!-- Boquinha + dentinhos -->
      <path d="M120 156 L 120 168" stroke="#2E2257" stroke-width="3" stroke-linecap="round"/>
      <path d="M120 168 Q 110 178 100 170" stroke="#2E2257" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M120 168 Q 130 178 140 170" stroke="#2E2257" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <rect x="114" y="167" width="5" height="9" fill="#fff" stroke="#2E2257" stroke-width="1.2"/>
      <rect x="121" y="167" width="5" height="9" fill="#fff" stroke="#2E2257" stroke-width="1.2"/>
    </svg>`,
};

/* =========================================================================
   ICONES & RECOMPENSAS
   ========================================================================= */

export const ICONS = {
  star: () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 6.91-1.01z"/></svg>`,

  coin: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="coinG" cx="35%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFF6C2"/><stop offset="60%" stop-color="#FFD23F"/><stop offset="100%" stop-color="#C97700"/></radialGradient></defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinG)" stroke="#8A4D00" stroke-width="1.2"/>
    <circle cx="12" cy="12" r="7" fill="none" stroke="#8A4D00" stroke-width="0.8" opacity="0.6"/>
    <text x="12" y="16.2" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10" fill="#8A4D00">L</text>
  </svg>`,

  gem: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gemG" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#B7F2D7"/><stop offset="1" stop-color="#1FA76A"/></linearGradient></defs>
    <path d="M12 2 L 22 9 L 12 22 L 2 9 Z" fill="url(#gemG)" stroke="#0F6B41" stroke-width="1"/>
    <path d="M12 2 L 8 9 L 12 22 L 16 9 Z" fill="#fff" opacity="0.25"/>
  </svg>`,

  trophy: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="trG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE894"/><stop offset="1" stop-color="#F4A300"/></linearGradient></defs>
    <path d="M7 3h10v3a5 5 0 01-10 0V3z" fill="url(#trG)" stroke="#8A4D00" stroke-width="1"/>
    <path d="M5 5H3a2 2 0 002 4M19 5h2a2 2 0 01-2 4" stroke="#8A4D00" stroke-width="1.2" fill="none"/>
    <path d="M10 11h4v4h-4z" fill="url(#trG)" stroke="#8A4D00" stroke-width="1"/>
    <path d="M8 16h8v3H8z" fill="#8A4D00" rx="1"/>
  </svg>`,

  medal: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2l1.5 3L8 8 12 7l4 1-1.5-3L16 2z" fill="#FF7BB5"/>
    <circle cx="12" cy="14" r="6" fill="#FFD23F" stroke="#C97700" stroke-width="1"/>
    <text x="12" y="17" text-anchor="middle" font-size="6" font-weight="900" fill="#8A4D00">1</text>
  </svg>`,

  back: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,

  play: () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,

  settings: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,

  home: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M3 12L12 3l9 9M5 10v10h14V10"/></svg>`,

  lock: () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6z"/></svg>`,

  plus: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,

  user: () => `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`,

  trash: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/></svg>`,

  clock: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,

  chart: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V9m6 12V5m6 16v-9"/></svg>`,

  flame: () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2s4 5 4 9c0 3-2 5-5 5s-5-2-5-5c0-2 1-3 2-4 0 2 1 3 2 3-1-2 2-5 2-8z"/><path d="M12 22c4 0 7-2 7-6 0-2-1-3-2-4 0 2-1 4-3 4-1 0-2-1-2-3 0 2-2 3-2 5 0 2 1 4 2 4z"/></svg>`,

  music: () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17V5l10-2v12"/><circle cx="6" cy="17" r="3"/><circle cx="16" cy="15" r="3"/></svg>`,
};
