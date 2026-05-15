/* =========================================================================
   LIZKIDS — PERSONAGENS SVG PREMIUM
   Redesenhados com: olhos Pixar (6 camadas), gradientes 5-stop, rim light,
   highlights múltiplos, blush radial, braços arredondados.
   ========================================================================= */

export const CHARACTERS = {

  /* ───── LUMI — Mascote oficial (estrela mágica) ───── */
  lumi: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="lbody" cx="36%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#FFFCE6"/>
      <stop offset="22%"  stop-color="#FFF0A0"/>
      <stop offset="52%"  stop-color="#FFD23F"/>
      <stop offset="82%"  stop-color="#E8A800"/>
      <stop offset="100%" stop-color="#C97700"/>
    </radialGradient>
    <radialGradient id="lrim" cx="80%" cy="76%" r="55%">
      <stop offset="0%"   stop-color="#FFE580" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#FFE580" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="leyeL" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#7B62D4"/>
      <stop offset="52%"  stop-color="#3D2A9E"/>
      <stop offset="100%" stop-color="#18103C"/>
    </radialGradient>
    <radialGradient id="leyeR" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#7B62D4"/>
      <stop offset="52%"  stop-color="#3D2A9E"/>
      <stop offset="100%" stop-color="#18103C"/>
    </radialGradient>
    <radialGradient id="lsclera" cx="44%" cy="32%" r="68%">
      <stop offset="0%"   stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#EDE8FF"/>
    </radialGradient>
    <radialGradient id="lcheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#FF7BAA" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#FF7BAA" stop-opacity="0"/>
    </radialGradient>
    <filter id="ldropshadow" x="-22%" y="-10%" width="144%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#B87000" flood-opacity="0.28"/>
    </filter>
  </defs>
  <!-- Cast shadow -->
  <ellipse cx="130" cy="254" rx="66" ry="7" fill="#C97700" opacity="0.14"/>
  <!-- Aura behind body -->
  <circle cx="130" cy="126" r="105" fill="#FFD23F" opacity="0.09"/>
  <!-- Body star (softer, more organic) -->
  <path d="M130 16 C140 16,148 30,154 50 C160 70,173 77,196 76 C219 75,230 89,225 108
           C220 127,207 136,193 151 C179 166,183 185,193 206 C203 227,186 238,164 229
           C142 220,131 228,130 238 C129 228,118 220,96 229 C74 238,57 227,67 206
           C77 185,81 166,67 151 C53 136,40 127,35 108 C30 89,41 75,64 76
           C87 77,100 70,106 50 C112 30,120 16,130 16 Z"
        fill="url(#lbody)" filter="url(#ldropshadow)"
        stroke="#B07000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Rim light overlay -->
  <path d="M130 16 C140 16,148 30,154 50 C160 70,173 77,196 76 C219 75,230 89,225 108
           C220 127,207 136,193 151 C179 166,183 185,193 206 C203 227,186 238,164 229
           C142 220,131 228,130 238 C129 228,118 220,96 229 C74 238,57 227,67 206
           C77 185,81 166,67 151 C53 136,40 127,35 108 C30 89,41 75,64 76
           C87 77,100 70,106 50 C112 30,120 16,130 16 Z" fill="url(#lrim)" stroke="none"/>
  <!-- Body highlight (top-left sheen) -->
  <path d="M84 54 Q103 38 122 52 Q102 60 86 76 Z" fill="#FFFCE6" opacity="0.55"/>
  <!-- Arms (stubby, cute) -->
  <ellipse cx="60"  cy="130" rx="14" ry="18" fill="#FFD23F" stroke="#B07000" stroke-width="2" transform="rotate(-20 60 130)"/>
  <ellipse cx="200" cy="130" rx="14" ry="18" fill="#FFD23F" stroke="#B07000" stroke-width="2" transform="rotate(20 200 130)"/>
  <ellipse cx="60"  cy="128" rx="7"  ry="9"  fill="#FFF0A0" opacity="0.55" transform="rotate(-20 60 128)"/>
  <ellipse cx="200" cy="128" rx="7"  ry="9"  fill="#FFF0A0" opacity="0.55" transform="rotate(20 200 128)"/>
  <!-- Blush cheeks -->
  <ellipse cx="82"  cy="154" rx="20" ry="14" fill="url(#lcheek)"/>
  <ellipse cx="178" cy="154" rx="20" ry="14" fill="url(#lcheek)"/>
  <!-- ═══ LEFT EYE (Pixar 6-layer) ═══ -->
  <!-- Sclera -->
  <ellipse cx="102" cy="124" rx="20" ry="24" fill="url(#lsclera)"/>
  <!-- Brow shadow -->
  <path d="M85 115 Q102 108 119 115 Q102 112 85 115 Z" fill="#C8BEEC" opacity="0.3"/>
  <!-- Iris -->
  <ellipse cx="102" cy="128" rx="15" ry="17" fill="url(#leyeL)"/>
  <!-- Pupil -->
  <ellipse cx="103" cy="130" rx="8"  ry="9"  fill="#0C0820"/>
  <!-- Primary catchlight: large white -->
  <ellipse cx="108" cy="122" rx="6"  ry="7"  fill="#FFFFFF" opacity="0.96"/>
  <!-- Secondary catchlight: tiny dot -->
  <circle  cx="97"  cy="137" r="2.8" fill="#D8EEFF" opacity="0.78"/>
  <!-- Iris depth line (bottom crescent) -->
  <path d="M90 140 Q102 148 114 140" stroke="#6B52C0" stroke-width="1.8" fill="none" opacity="0.4"/>
  <!-- Lower lid crease -->
  <path d="M83 142 Q102 152 121 142" stroke="#2E1A5A" stroke-width="1.2" fill="none" opacity="0.2"/>
  <!-- ═══ RIGHT EYE (Pixar 6-layer) ═══ -->
  <ellipse cx="158" cy="124" rx="20" ry="24" fill="url(#lsclera)"/>
  <path d="M141 115 Q158 108 175 115 Q158 112 141 115 Z" fill="#C8BEEC" opacity="0.3"/>
  <ellipse cx="158" cy="128" rx="15" ry="17" fill="url(#leyeR)"/>
  <ellipse cx="159" cy="130" rx="8"  ry="9"  fill="#0C0820"/>
  <ellipse cx="164" cy="122" rx="6"  ry="7"  fill="#FFFFFF" opacity="0.96"/>
  <circle  cx="153" cy="137" r="2.8" fill="#D8EEFF" opacity="0.78"/>
  <path d="M146 140 Q158 148 170 140" stroke="#6B52C0" stroke-width="1.8" fill="none" opacity="0.4"/>
  <path d="M139 142 Q158 152 177 142" stroke="#2E1A5A" stroke-width="1.2" fill="none" opacity="0.2"/>
  <!-- Smile (warm, wide) -->
  <path d="M108 166 Q130 192 152 166" stroke="#5C1A3A" stroke-width="4.5" fill="#D94B8C" stroke-linecap="round"/>
  <path d="M112 171 Q130 186 148 171 Q139 180 130 182 Q121 180 112 171 Z" fill="#FF7BAA" opacity="0.65"/>
  <!-- Tiny teeth -->
  <path d="M120 169 L123 176 M130 170 L130 177 M140 169 L137 176" stroke="#FFF0F6" stroke-width="2" stroke-linecap="round" opacity="0.88"/>
</svg>`,

  /* ───── BOBO — criatura azul fofa ───── */
  bobo: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bbbody" cx="38%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#B8D4FF"/>
      <stop offset="30%"  stop-color="#6B9EFF"/>
      <stop offset="65%"  stop-color="#4F7CFF"/>
      <stop offset="88%"  stop-color="#2F4FCC"/>
      <stop offset="100%" stop-color="#1A2FA0"/>
    </radialGradient>
    <radialGradient id="bbbelly" cx="48%" cy="38%" r="70%">
      <stop offset="0%"  stop-color="#E0EBFF"/>
      <stop offset="100%" stop-color="#C4D8FF"/>
    </radialGradient>
    <radialGradient id="bbeye" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#6BE8A8"/>
      <stop offset="55%"  stop-color="#22B870"/>
      <stop offset="100%" stop-color="#0A6E40"/>
    </radialGradient>
    <radialGradient id="bbcheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#FF7BAA" stop-opacity="0.58"/>
      <stop offset="100%" stop-color="#FF7BAA" stop-opacity="0"/>
    </radialGradient>
    <filter id="bbshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#1A2FA0" flood-opacity="0.25"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="64" ry="7" fill="#1A2FA0" opacity="0.14"/>
  <!-- Body -->
  <ellipse cx="130" cy="152" rx="82" ry="88" fill="url(#bbbody)" filter="url(#bbshadow)" stroke="#1A2FA0" stroke-width="2.5"/>
  <!-- Belly -->
  <ellipse cx="130" cy="166" rx="56" ry="52" fill="url(#bbbelly)" opacity="0.55"/>
  <!-- Ear/antena -->
  <line x1="130" y1="66" x2="130" y2="38" stroke="#1A2FA0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="130" cy="32" r="11" fill="#FFD23F" stroke="#C97700" stroke-width="2">
    <animate attributeName="r" values="11;13;11" dur="2s" repeatCount="indefinite"/>
  </circle>
  <!-- Highlight -->
  <path d="M78 82 Q100 66 118 78 Q98 86 80 102 Z" fill="#B8D4FF" opacity="0.48"/>
  <!-- Cheeks -->
  <ellipse cx="76"  cy="158" rx="18" ry="13" fill="url(#bbcheek)"/>
  <ellipse cx="184" cy="158" rx="18" ry="13" fill="url(#bbcheek)"/>
  <!-- Left eye -->
  <ellipse cx="104" cy="128" rx="20" ry="23" fill="white"/>
  <path d="M87 119 Q104 113 121 119 Q104 116 87 119 Z" fill="#A8C0F0" opacity="0.3"/>
  <ellipse cx="104" cy="132" rx="15" ry="16" fill="url(#bbeye)"/>
  <ellipse cx="105" cy="134" rx="8" ry="9" fill="#062018"/>
  <ellipse cx="110" cy="125" rx="6" ry="7" fill="white" opacity="0.95"/>
  <circle  cx="98"  cy="140" r="2.5" fill="#AAFFD8" opacity="0.72"/>
  <!-- Right eye -->
  <ellipse cx="156" cy="128" rx="20" ry="23" fill="white"/>
  <path d="M139 119 Q156 113 173 119 Q156 116 139 119 Z" fill="#A8C0F0" opacity="0.3"/>
  <ellipse cx="156" cy="132" rx="15" ry="16" fill="url(#bbeye)"/>
  <ellipse cx="157" cy="134" rx="8" ry="9" fill="#062018"/>
  <ellipse cx="162" cy="125" rx="6" ry="7" fill="white" opacity="0.95"/>
  <circle  cx="150" cy="140" r="2.5" fill="#AAFFD8" opacity="0.72"/>
  <!-- Mouth -->
  <path d="M110 168 Q130 188 150 168" stroke="#1A2FA0" stroke-width="4.5" fill="#5BE0A3" stroke-linecap="round"/>
  <path d="M114 173 Q130 184 146 173 Q138 180 130 182 Q122 180 114 173 Z" fill="#A8F4D8" opacity="0.7"/>
</svg>`,

  /* ───── PIP — criaturinha rosa ───── */
  pip: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ppbody" cx="38%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#FFD8EC"/>
      <stop offset="28%"  stop-color="#FFA8CE"/>
      <stop offset="60%"  stop-color="#FF7BB5"/>
      <stop offset="86%"  stop-color="#E84899"/>
      <stop offset="100%" stop-color="#C02878"/>
    </radialGradient>
    <radialGradient id="ppeye" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#A070E0"/>
      <stop offset="55%"  stop-color="#5B30B0"/>
      <stop offset="100%" stop-color="#2A1268"/>
    </radialGradient>
    <radialGradient id="ppcheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#FF4D8B" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#FF4D8B" stop-opacity="0"/>
    </radialGradient>
    <filter id="ppshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#C02878" flood-opacity="0.24"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="64" ry="7" fill="#C02878" opacity="0.13"/>
  <!-- Big ears -->
  <ellipse cx="82"  cy="62" rx="20" ry="44" fill="#FF7BB5" stroke="#C02878" stroke-width="2.5" transform="rotate(-15 82 62)"/>
  <ellipse cx="178" cy="62" rx="20" ry="44" fill="#FF7BB5" stroke="#C02878" stroke-width="2.5" transform="rotate(15 178 62)"/>
  <ellipse cx="82"  cy="62" rx="10" ry="26" fill="#FFD8EC" opacity="0.85" transform="rotate(-15 82 62)"/>
  <ellipse cx="178" cy="62" rx="10" ry="26" fill="#FFD8EC" opacity="0.85" transform="rotate(15 178 62)"/>
  <!-- Body -->
  <ellipse cx="130" cy="154" rx="80" ry="84" fill="url(#ppbody)" filter="url(#ppshadow)" stroke="#C02878" stroke-width="2.5"/>
  <!-- Belly -->
  <ellipse cx="130" cy="170" rx="50" ry="45" fill="#FFD8EC" opacity="0.45"/>
  <!-- Highlight -->
  <path d="M80 82 Q100 66 118 80 Q98 88 82 104 Z" fill="#FFD8EC" opacity="0.5"/>
  <!-- Cheeks -->
  <ellipse cx="76"  cy="155" rx="18" ry="13" fill="url(#ppcheek)"/>
  <ellipse cx="184" cy="155" rx="18" ry="13" fill="url(#ppcheek)"/>
  <!-- Left eye -->
  <ellipse cx="104" cy="126" rx="19" ry="22" fill="white"/>
  <path d="M88 117 Q104 111 120 117 Q104 114 88 117 Z" fill="#E8C0D8" opacity="0.3"/>
  <ellipse cx="104" cy="130" rx="14" ry="16" fill="url(#ppeye)"/>
  <ellipse cx="105" cy="132" rx="7.5" ry="8.5" fill="#0C0824"/>
  <ellipse cx="110" cy="123" rx="5.5" ry="6.5" fill="white" opacity="0.95"/>
  <circle  cx="98"  cy="138" r="2.4" fill="#DDD0FF" opacity="0.75"/>
  <!-- Right eye -->
  <ellipse cx="156" cy="126" rx="19" ry="22" fill="white"/>
  <path d="M140 117 Q156 111 172 117 Q156 114 140 117 Z" fill="#E8C0D8" opacity="0.3"/>
  <ellipse cx="156" cy="130" rx="14" ry="16" fill="url(#ppeye)"/>
  <ellipse cx="157" cy="132" rx="7.5" ry="8.5" fill="#0C0824"/>
  <ellipse cx="162" cy="123" rx="5.5" ry="6.5" fill="white" opacity="0.95"/>
  <circle  cx="150" cy="138" r="2.4" fill="#DDD0FF" opacity="0.75"/>
  <!-- Tiny nose + mouth -->
  <ellipse cx="130" cy="152" rx="5" ry="3.5" fill="#E84899"/>
  <path d="M116 163 Q130 180 144 163" stroke="#5C1A3A" stroke-width="4" fill="#FF7BB5" stroke-linecap="round"/>
</svg>`,

  /* ───── ROBO — robozinho lilás ───── */
  robo: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="robody" x1="0.2" x2="0.8" y1="0" y2="1">
      <stop offset="0%"   stop-color="#E8D8FF"/>
      <stop offset="30%"  stop-color="#C8AAFF"/>
      <stop offset="65%"  stop-color="#B57BFF"/>
      <stop offset="88%"  stop-color="#8044E0"/>
      <stop offset="100%" stop-color="#5E28C0"/>
    </linearGradient>
    <radialGradient id="roscreen" cx="40%" cy="30%" r="72%">
      <stop offset="0%"   stop-color="#1A3A2A"/>
      <stop offset="100%" stop-color="#050F08"/>
    </radialGradient>
    <filter id="roshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#5E28C0" flood-opacity="0.28"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="60" ry="7" fill="#5E28C0" opacity="0.15"/>
  <!-- Antena -->
  <line x1="130" y1="56" x2="130" y2="30" stroke="#5E28C0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="130" cy="24" r="10" fill="#5BE0A3" stroke="#1FA76A" stroke-width="2">
    <animate attributeName="fill" values="#5BE0A3;#FFD23F;#FF7BB5;#5BE0A3" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- Head -->
  <rect x="58" y="56" width="144" height="104" rx="32" fill="url(#robody)" filter="url(#roshadow)" stroke="#5E28C0" stroke-width="2.5"/>
  <!-- Screen visor -->
  <rect x="72" y="76" width="116" height="52" rx="22" fill="url(#roscreen)"/>
  <!-- Left eye LED -->
  <circle cx="102" cy="102" r="15" fill="#5BE0A3" opacity="0.9">
    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="102" cy="102" r="9" fill="#062018"/>
  <circle cx="107" cy="96"  r="5" fill="white" opacity="0.9"/>
  <circle cx="97"  cy="110" r="2" fill="#AAFFD8" opacity="0.7"/>
  <!-- Right eye LED -->
  <circle cx="158" cy="102" r="15" fill="#5BE0A3" opacity="0.9">
    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="158" cy="102" r="9" fill="#062018"/>
  <circle cx="163" cy="96"  r="5" fill="white" opacity="0.9"/>
  <circle cx="153" cy="110" r="2" fill="#AAFFD8" opacity="0.7"/>
  <!-- Cheek LED indicators -->
  <circle cx="72"  cy="140" r="7" fill="#FF7BB5"><animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite"/></circle>
  <circle cx="188" cy="140" r="7" fill="#FF7BB5"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/></circle>
  <!-- Head highlight -->
  <path d="M68 72 Q90 62 115 72 Q88 78 70 94 Z" fill="#E8D8FF" opacity="0.42"/>
  <!-- Body -->
  <rect x="66" y="160" width="128" height="78" rx="28" fill="url(#robody)" stroke="#5E28C0" stroke-width="2.5"/>
  <!-- Body panel -->
  <rect x="82" y="176" width="96" height="32" rx="14" fill="#FFE894" opacity="0.65"/>
  <circle cx="102" cy="192" r="5" fill="#F4A300"/>
  <circle cx="130" cy="192" r="5" fill="#5BE0A3"/>
  <circle cx="158" cy="192" r="5" fill="#FF7BB5"/>
  <!-- Mouth LED strip -->
  <rect x="90" y="214" width="80" height="10" rx="5" fill="#0A2018" stroke="#1FA76A" stroke-width="1"/>
  <path d="M96 219 Q130 226 164 219" stroke="#5BE0A3" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
</svg>`,

  /* ───── MEL — gatinha amarela ───── */
  mel: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="melbody" cx="38%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#FFFBD4"/>
      <stop offset="24%"  stop-color="#FFE880"/>
      <stop offset="55%"  stop-color="#FFD23F"/>
      <stop offset="84%"  stop-color="#E8A800"/>
      <stop offset="100%" stop-color="#C07000"/>
    </radialGradient>
    <radialGradient id="meleye" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#78D870"/>
      <stop offset="55%"  stop-color="#289020"/>
      <stop offset="100%" stop-color="#104010"/>
    </radialGradient>
    <radialGradient id="melcheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#FF7BAA" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#FF7BAA" stop-opacity="0"/>
    </radialGradient>
    <filter id="melshadow">
      <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#C07000" flood-opacity="0.24"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="64" ry="7" fill="#C07000" opacity="0.13"/>
  <!-- Ears (triangle with inner pink) -->
  <path d="M72 80 L58 36 L104 62 Z" fill="#FFD23F" stroke="#C07000" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M188 80 L202 36 L156 62 Z" fill="#FFD23F" stroke="#C07000" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M77 74 L66 46 L96 62 Z" fill="#FF9BB5"/>
  <path d="M183 74 L194 46 L164 62 Z" fill="#FF9BB5"/>
  <!-- Head -->
  <ellipse cx="130" cy="154" rx="82" ry="84" fill="url(#melbody)" filter="url(#melshadow)" stroke="#C07000" stroke-width="2.5"/>
  <!-- Highlight -->
  <path d="M78 84 Q100 68 118 82 Q98 90 80 108 Z" fill="#FFFBD4" opacity="0.52"/>
  <!-- Cheeks -->
  <ellipse cx="77"  cy="157" rx="19" ry="13" fill="url(#melcheek)"/>
  <ellipse cx="183" cy="157" rx="19" ry="13" fill="url(#melcheek)"/>
  <!-- Left eye -->
  <ellipse cx="104" cy="128" rx="18" ry="21" fill="white"/>
  <path d="M88 119 Q104 113 120 119 Q104 116 88 119 Z" fill="#D8C888" opacity="0.32"/>
  <ellipse cx="104" cy="132" rx="13" ry="15" fill="url(#meleye)"/>
  <ellipse cx="105" cy="134" rx="7" ry="8" fill="#060C06"/>
  <ellipse cx="110" cy="125" rx="5.5" ry="6" fill="white" opacity="0.95"/>
  <circle  cx="98"  cy="140" r="2.3" fill="#C8FFD0" opacity="0.72"/>
  <!-- Right eye -->
  <ellipse cx="156" cy="128" rx="18" ry="21" fill="white"/>
  <path d="M140 119 Q156 113 172 119 Q156 116 140 119 Z" fill="#D8C888" opacity="0.32"/>
  <ellipse cx="156" cy="132" rx="13" ry="15" fill="url(#meleye)"/>
  <ellipse cx="157" cy="134" rx="7" ry="8" fill="#060C06"/>
  <ellipse cx="162" cy="125" rx="5.5" ry="6" fill="white" opacity="0.95"/>
  <circle  cx="150" cy="140" r="2.3" fill="#C8FFD0" opacity="0.72"/>
  <!-- Nose -->
  <path d="M125 154 L135 154 L130 162 Z" fill="#E84899"/>
  <!-- Mouth + whiskers -->
  <path d="M130 162 Q124 172 116 168" stroke="#5C1A3A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M130 162 Q136 172 144 168" stroke="#5C1A3A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <line x1="56"  y1="144" x2="82"  y2="148" stroke="#C07000" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="56"  y1="155" x2="82"  y2="157" stroke="#C07000" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="204" y1="144" x2="178" y2="148" stroke="#C07000" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="204" y1="155" x2="178" y2="157" stroke="#C07000" stroke-width="1.8" stroke-linecap="round"/>
</svg>`,

  /* ───── DRAKO — dragãozinho verde ───── */
  drako: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="drbody" cx="38%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#CCFADF"/>
      <stop offset="25%"  stop-color="#80E8A8"/>
      <stop offset="58%"  stop-color="#5BE0A3"/>
      <stop offset="84%"  stop-color="#1FA76A"/>
      <stop offset="100%" stop-color="#0B6438"/>
    </radialGradient>
    <radialGradient id="dreye" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#FF9B50"/>
      <stop offset="55%"  stop-color="#E05800"/>
      <stop offset="100%" stop-color="#7A2800"/>
    </radialGradient>
    <radialGradient id="drcheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#FF7BAA" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#FF7BAA" stop-opacity="0"/>
    </radialGradient>
    <filter id="drshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0B6438" flood-opacity="0.25"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="64" ry="7" fill="#0B6438" opacity="0.14"/>
  <!-- Spikes on head -->
  <path d="M90 88 L80 56 L104 78" fill="#1FA76A" stroke="#0B6438" stroke-width="2" stroke-linejoin="round"/>
  <path d="M118 74 L114 44 L138 70" fill="#1FA76A" stroke="#0B6438" stroke-width="2" stroke-linejoin="round"/>
  <path d="M148 72 L158 42 L170 74" fill="#1FA76A" stroke="#0B6438" stroke-width="2" stroke-linejoin="round"/>
  <!-- Body -->
  <ellipse cx="130" cy="152" rx="82" ry="84" fill="url(#drbody)" filter="url(#drshadow)" stroke="#0B6438" stroke-width="2.5"/>
  <!-- Belly scales -->
  <ellipse cx="130" cy="170" rx="52" ry="48" fill="#E8FAF0" opacity="0.55"/>
  <!-- Highlight -->
  <path d="M78 86 Q100 70 118 84 Q98 92 80 110 Z" fill="#CCFADF" opacity="0.5"/>
  <!-- Cheeks -->
  <ellipse cx="77"  cy="156" rx="18" ry="12" fill="url(#drcheek)"/>
  <ellipse cx="183" cy="156" rx="18" ry="12" fill="url(#drcheek)"/>
  <!-- Left eye -->
  <ellipse cx="104" cy="126" rx="19" ry="22" fill="white"/>
  <path d="M87 117 Q104 111 121 117 Q104 114 87 117 Z" fill="#B0E8C0" opacity="0.32"/>
  <ellipse cx="104" cy="130" rx="14" ry="16" fill="url(#dreye)"/>
  <ellipse cx="105" cy="132" rx="7.5" ry="8.5" fill="#200800"/>
  <ellipse cx="110" cy="123" rx="6" ry="7" fill="white" opacity="0.95"/>
  <circle  cx="98"  cy="139" r="2.4" fill="#FFDDB0" opacity="0.72"/>
  <!-- Right eye -->
  <ellipse cx="156" cy="126" rx="19" ry="22" fill="white"/>
  <path d="M139 117 Q156 111 173 117 Q156 114 139 117 Z" fill="#B0E8C0" opacity="0.32"/>
  <ellipse cx="156" cy="130" rx="14" ry="16" fill="url(#dreye)"/>
  <ellipse cx="157" cy="132" rx="7.5" ry="8.5" fill="#200800"/>
  <ellipse cx="162" cy="123" rx="6" ry="7" fill="white" opacity="0.95"/>
  <circle  cx="150" cy="139" r="2.4" fill="#FFDDB0" opacity="0.72"/>
  <!-- Nostrils -->
  <ellipse cx="122" cy="153" rx="3.5" ry="2.5" fill="#0B6438" opacity="0.5"/>
  <ellipse cx="138" cy="153" rx="3.5" ry="2.5" fill="#0B6438" opacity="0.5"/>
  <!-- Smile + fang -->
  <path d="M108 167 Q130 192 152 167" stroke="#0B6438" stroke-width="4.5" fill="#5C1A3A" stroke-linecap="round"/>
  <path d="M112 172 Q130 186 148 172 Q138 180 130 182 Q122 180 112 172 Z" fill="#80E8A8" opacity="0.55"/>
  <path d="M128 170 L124 180" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`,

  /* ───── OWLY — corujinha lilás ───── */
  owly: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="owbody" cx="38%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#E8D4FF"/>
      <stop offset="26%"  stop-color="#C8A0FF"/>
      <stop offset="58%"  stop-color="#9B5EFF"/>
      <stop offset="84%"  stop-color="#6A28E0"/>
      <stop offset="100%" stop-color="#440EA8"/>
    </radialGradient>
    <radialGradient id="oweye" cx="36%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#FFE060"/>
      <stop offset="55%"  stop-color="#E8A800"/>
      <stop offset="100%" stop-color="#884800"/>
    </radialGradient>
    <filter id="owshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#440EA8" flood-opacity="0.28"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="60" ry="7" fill="#440EA8" opacity="0.14"/>
  <!-- Ear tufts -->
  <path d="M74 72 L62 34 L96 62 Z" fill="#6A28E0" stroke="#440EA8" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M186 72 L198 34 L164 62 Z" fill="#6A28E0" stroke="#440EA8" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Body -->
  <ellipse cx="130" cy="152" rx="82" ry="86" fill="url(#owbody)" filter="url(#owshadow)" stroke="#440EA8" stroke-width="2.5"/>
  <!-- Chest: warm yellow feathers -->
  <ellipse cx="130" cy="172" rx="52" ry="62" fill="#FFE894" opacity="0.9"/>
  <path d="M90 152 Q110 145 130 150 Q150 145 170 152 Q150 158 130 162 Q110 158 90 152 Z" fill="#FFD23F" opacity="0.4"/>
  <!-- Highlight -->
  <path d="M76 82 Q98 66 116 80 Q96 90 78 108 Z" fill="#E8D4FF" opacity="0.48"/>
  <!-- Wings -->
  <path d="M48 140 Q30 188 60 210 Q76 188 72 156 Z" fill="#6A28E0" stroke="#440EA8" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M212 140 Q230 188 200 210 Q184 188 188 156 Z" fill="#6A28E0" stroke="#440EA8" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- HUGE OWL EYES -->
  <!-- Left eye ring -->
  <circle cx="96"  cy="120" r="30" fill="white" stroke="#440EA8" stroke-width="3"/>
  <path d="M68 111 Q96 104 124 111 Q96 108 68 111 Z" fill="#C8A0FF" opacity="0.3"/>
  <circle cx="96"  cy="124" r="20" fill="url(#oweye)"/>
  <circle cx="97"  cy="126" r="11" fill="#180A08"/>
  <ellipse cx="102" cy="116" rx="7" ry="8" fill="white" opacity="0.95"/>
  <circle  cx="90"  cy="132" r="3"  fill="#FFE8A0" opacity="0.68"/>
  <!-- Right eye ring -->
  <circle cx="164" cy="120" r="30" fill="white" stroke="#440EA8" stroke-width="3"/>
  <path d="M136 111 Q164 104 192 111 Q164 108 136 111 Z" fill="#C8A0FF" opacity="0.3"/>
  <circle cx="164" cy="124" r="20" fill="url(#oweye)"/>
  <circle cx="165" cy="126" r="11" fill="#180A08"/>
  <ellipse cx="170" cy="116" rx="7" ry="8" fill="white" opacity="0.95"/>
  <circle  cx="158" cy="132" r="3"  fill="#FFE8A0" opacity="0.68"/>
  <!-- Beak -->
  <path d="M130 148 L120 162 L140 162 Z" fill="#FFD23F" stroke="#C97700" stroke-width="2" stroke-linejoin="round"/>
</svg>`,

  /* ───── ZAP — coelho dinâmico ───── */
  zap: () => `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="zapbody" cx="38%" cy="28%" r="76%">
      <stop offset="0%"   stop-color="#FFFDE8"/>
      <stop offset="24%"  stop-color="#FFF4A8"/>
      <stop offset="56%"  stop-color="#FFE880"/>
      <stop offset="84%"  stop-color="#E8C800"/>
      <stop offset="100%" stop-color="#C09000"/>
    </radialGradient>
    <radialGradient id="zapeye" cx="34%" cy="28%" r="72%">
      <stop offset="0%"   stop-color="#68BCFF"/>
      <stop offset="55%"  stop-color="#1880E0"/>
      <stop offset="100%" stop-color="#083A80"/>
    </radialGradient>
    <radialGradient id="zapcheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#FF7BAA" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#FF7BAA" stop-opacity="0"/>
    </radialGradient>
    <filter id="zapshadow">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#C09000" flood-opacity="0.22"/>
    </filter>
  </defs>
  <ellipse cx="130" cy="252" rx="64" ry="7" fill="#C09000" opacity="0.13"/>
  <!-- Long ears -->
  <ellipse cx="94"  cy="60" rx="18" ry="50" fill="#FFE880" stroke="#C09000" stroke-width="2.5" transform="rotate(-14 94 60)"/>
  <ellipse cx="166" cy="60" rx="18" ry="50" fill="#FFE880" stroke="#C09000" stroke-width="2.5" transform="rotate(14 166 60)"/>
  <ellipse cx="94"  cy="62" rx="8"  ry="30" fill="#FF9BB5" transform="rotate(-14 94 62)"/>
  <ellipse cx="166" cy="62" rx="8"  ry="30" fill="#FF9BB5" transform="rotate(14 166 62)"/>
  <!-- Body -->
  <ellipse cx="130" cy="154" rx="82" ry="84" fill="url(#zapbody)" filter="url(#zapshadow)" stroke="#C09000" stroke-width="2.5"/>
  <!-- Belly patch -->
  <ellipse cx="130" cy="170" rx="50" ry="46" fill="#FFFDE8" opacity="0.5"/>
  <!-- Highlight -->
  <path d="M80 86 Q100 70 118 84 Q98 92 82 110 Z" fill="#FFFDE8" opacity="0.52"/>
  <!-- Cheeks -->
  <ellipse cx="77"  cy="158" rx="19" ry="13" fill="url(#zapcheek)"/>
  <ellipse cx="183" cy="158" rx="19" ry="13" fill="url(#zapcheek)"/>
  <!-- Left eye -->
  <ellipse cx="104" cy="128" rx="18" ry="21" fill="white"/>
  <path d="M88 119 Q104 113 120 119 Q104 116 88 119 Z" fill="#D8D0A0" opacity="0.3"/>
  <ellipse cx="104" cy="132" rx="13" ry="15" fill="url(#zapeye)"/>
  <ellipse cx="105" cy="134" rx="7" ry="8" fill="#06101A"/>
  <ellipse cx="110" cy="125" rx="5.5" ry="6" fill="white" opacity="0.95"/>
  <circle  cx="98"  cy="140" r="2.3" fill="#C0E8FF" opacity="0.72"/>
  <!-- Right eye -->
  <ellipse cx="156" cy="128" rx="18" ry="21" fill="white"/>
  <path d="M140 119 Q156 113 172 119 Q156 116 140 119 Z" fill="#D8D0A0" opacity="0.3"/>
  <ellipse cx="156" cy="132" rx="13" ry="15" fill="url(#zapeye)"/>
  <ellipse cx="157" cy="134" rx="7" ry="8" fill="#06101A"/>
  <ellipse cx="162" cy="125" rx="5.5" ry="6" fill="white" opacity="0.95"/>
  <circle  cx="150" cy="140" r="2.3" fill="#C0E8FF" opacity="0.72"/>
  <!-- Nose + mouth + teeth -->
  <ellipse cx="130" cy="154" rx="6" ry="4.5" fill="#E84899"/>
  <path d="M130 158 L130 170" stroke="#5C1A3A" stroke-width="3" stroke-linecap="round"/>
  <path d="M130 170 Q122 180 114 174" stroke="#5C1A3A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M130 170 Q138 180 146 174" stroke="#5C1A3A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <rect x="124" y="169" width="5.5" height="10" rx="2" fill="white" stroke="#5C1A3A" stroke-width="1.2"/>
  <rect x="130.5" y="169" width="5.5" height="10" rx="2" fill="white" stroke="#5C1A3A" stroke-width="1.2"/>
</svg>`,
};

/* =========================================================================
   ÍCONES
   ========================================================================= */

export const ICONS = {
  star: () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 6.91-1.01z"/></svg>`,

  coin: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="cg" cx="35%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFF6C2"/><stop offset="60%" stop-color="#FFD23F"/><stop offset="100%" stop-color="#C97700"/></radialGradient></defs>
    <circle cx="12" cy="12" r="10" fill="url(#cg)" stroke="#8A4D00" stroke-width="1.2"/>
    <circle cx="12" cy="12" r="7" fill="none" stroke="#8A4D00" stroke-width="0.7" opacity="0.55"/>
    <text x="12" y="16.2" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="10" fill="#8A4D00">L</text>
  </svg>`,

  gem: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#B7F2D7"/><stop offset="1" stop-color="#1FA76A"/></linearGradient></defs>
    <path d="M12 2 L22 9 L12 22 L2 9 Z" fill="url(#gg)" stroke="#0F6B41" stroke-width="1"/>
    <path d="M12 2 L8 9 L12 22 L16 9 Z" fill="rgba(255,255,255,0.28)"/>
    <path d="M2 9 L22 9" stroke="#0F6B41" stroke-width="0.8" opacity="0.5"/>
  </svg>`,

  trophy: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="tg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE894"/><stop offset="1" stop-color="#F4A300"/></linearGradient></defs>
    <path d="M7 3h10v3a5 5 0 01-10 0V3z" fill="url(#tg)" stroke="#8A4D00" stroke-width="1"/>
    <path d="M5 5H3a2 2 0 002 4M19 5h2a2 2 0 01-2 4" stroke="#8A4D00" stroke-width="1.2" fill="none"/>
    <path d="M10 11h4v4h-4z" fill="url(#tg)" stroke="#8A4D00" stroke-width="1"/>
    <rect x="8" y="16" width="8" height="3" rx="1" fill="#8A4D00"/>
    <circle cx="12" cy="7" r="2" fill="rgba(255,255,255,0.5)"/>
  </svg>`,

  medal: () => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2l1.5 3.5L8 8.5l4-.5 4 .5-1.5-3L16 2z" fill="#FF7BB5"/>
    <circle cx="12" cy="15" r="7" fill="#FFD23F" stroke="#C97700" stroke-width="1.2"/>
    <circle cx="12" cy="15" r="5" fill="none" stroke="#C97700" stroke-width="0.7" opacity="0.5"/>
    <text x="12" y="19" text-anchor="middle" font-size="6" font-weight="900" fill="#8A4D00" font-family="Fredoka,sans-serif">1</text>
  </svg>`,

  back:     () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  play:     () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  settings: () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  home:     () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><path d="M3 12L12 3l9 9M5 10v10h14V10"/></svg>`,
  lock:     () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6z"/></svg>`,
  plus:     () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  user:     () => `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`,
  trash:    () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/></svg>`,
  clock:    () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  chart:    () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V9m6 12V5m6 16v-9"/></svg>`,
  flame:    () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2s4 5 4 9c0 3-2 5-5 5s-5-2-5-5c0-2 1-3 2-4 0 2 1 3 2 3-1-2 2-5 2-8z"/><path d="M12 22c4 0 7-2 7-6 0-2-1-3-2-4 0 2-1 4-3 4-1 0-2-1-2-3 0 2-2 3-2 5 0 2 1 4 2 4z"/></svg>`,
  music:    () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17V5l10-2v12"/><circle cx="6" cy="17" r="3"/><circle cx="16" cy="15" r="3"/></svg>`,
  target:   () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  check:    () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  bolt:     () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.09 12.26a1 1 0 00.91 1.74H11l-1 8 8.91-10.26a1 1 0 00-.91-1.74H13l1-8z"/></svg>`,
};
