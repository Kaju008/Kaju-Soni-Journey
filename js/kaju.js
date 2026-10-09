/* Kaju — the cashew. Pure SVG so it stays razor sharp at any size and weighs a few KB.
   Nested groups let several animations stack without fighting:
   #k-pos (scroll: position/rotation) > #k-pop (intro pop) > #k-squash (squash & stretch) > #k-idle (breathing bob) */
window.KAJU_SVG = `
<svg class="kaju" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-label="Kaju, a cartoon cashew nut" role="img">
  <defs>
    <radialGradient id="kBody" cx="34%" cy="26%" r="82%">
      <stop offset="0" stop-color="#FFF8EA"/>
      <stop offset="0.3" stop-color="#F8E4C0"/>
      <stop offset="0.62" stop-color="#ECC994"/>
      <stop offset="0.88" stop-color="#D3A363"/>
      <stop offset="1" stop-color="#A9783B"/>
    </radialGradient>
    <linearGradient id="kRim" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#FFD9A0" stop-opacity="0.9"/>
      <stop offset="0.25" stop-color="#FFD9A0" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="kSpec" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="kLimb" cx="35%" cy="30%" r="80%">
      <stop offset="0" stop-color="#FCEBCB"/>
      <stop offset="0.6" stop-color="#E6C08A"/>
      <stop offset="1" stop-color="#B0803F"/>
    </radialGradient>
    <radialGradient id="kEyeW" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.8" stop-color="#F3F0EA"/>
      <stop offset="1" stop-color="#D9D2C6"/>
    </radialGradient>
    <radialGradient id="kIris" cx="50%" cy="65%" r="60%">
      <stop offset="0" stop-color="#C98A4B"/>
      <stop offset="0.55" stop-color="#7A4419"/>
      <stop offset="1" stop-color="#3B1D08"/>
    </radialGradient>
    <radialGradient id="kCheek" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FF8A7A" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FF8A7A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="kMouth" cx="50%" cy="30%" r="80%">
      <stop offset="0" stop-color="#7A2A1A"/>
      <stop offset="1" stop-color="#3D0F08"/>
    </radialGradient>
    <clipPath id="kMouthClip"><path d="M118 214 Q150 222 182 214 Q178 252 150 254 Q122 252 118 214 Z"/></clipPath>
    <clipPath id="kBodyClip"><path id="kBodyPathC" d="M142 22 C216 16 268 70 264 146 C260 194 230 212 214 240 C198 270 214 304 240 322 C262 338 240 376 198 380 C130 386 70 352 52 292 C36 238 40 172 52 124 C66 66 98 26 142 22 Z"/></clipPath>
    <filter id="kSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="kSoftS" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>

  <g id="k-pos"><g id="k-pop"><g id="k-squash"><g id="k-idle">
    <!-- feet -->
    <g id="k-feet">
      <ellipse cx="116" cy="382" rx="26" ry="15" fill="url(#kLimb)"/>
      <ellipse cx="196" cy="382" rx="26" ry="15" fill="url(#kLimb)"/>
      <ellipse cx="108" cy="376" rx="9" ry="4" fill="#fff" opacity="0.5"/>
      <ellipse cx="188" cy="376" rx="9" ry="4" fill="#fff" opacity="0.5"/>
    </g>

    <!-- arm (viewer's left), resting -->
    <g id="k-armL">
      <path d="M52 236 C30 246 20 266 18 286" stroke="url(#kLimb)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <circle cx="18" cy="292" r="15" fill="url(#kLimb)"/>
      <ellipse cx="13" cy="286" rx="5" ry="3" fill="#fff" opacity="0.55"/>
    </g>
    <!-- arm (viewer's right), the waving one -->
    <g id="k-armR">
      <path d="M246 196 C268 186 280 168 284 148" stroke="url(#kLimb)" stroke-width="20" stroke-linecap="round" fill="none"/>
      <circle cx="285" cy="140" r="15" fill="url(#kLimb)"/>
      <ellipse cx="280" cy="134" rx="5" ry="3" fill="#fff" opacity="0.55"/>
    </g>

    <!-- body -->
    <g id="k-body">
      <path d="M142 22 C216 16 268 70 264 146 C260 194 230 212 214 240 C198 270 214 304 240 322 C262 338 240 376 198 380 C130 386 70 352 52 292 C36 238 40 172 52 124 C66 66 98 26 142 22 Z" fill="url(#kBody)"/>
      <g clip-path="url(#kBodyClip)">
        <!-- inner crease shadow along the cashew's curve -->
        <path d="M266 146 C256 200 222 218 206 246 C192 274 212 306 236 326 L300 400 L300 120 Z" fill="#8F5E25" opacity="0.30" filter="url(#kSoft)"/>
        <path d="M218 236 C202 262 210 296 236 318" stroke="#9C6A2C" stroke-width="10" fill="none" opacity="0.35" filter="url(#kSoftS)"/>
        <!-- bottom occlusion -->
        <ellipse cx="150" cy="392" rx="140" ry="44" fill="#8A5A22" opacity="0.32" filter="url(#kSoft)"/>
        <!-- rim light (back light on the right edge) -->
        <path d="M142 22 C216 16 268 70 264 146 C260 194 230 212 214 240" stroke="#FFF0D6" stroke-width="5" fill="none" opacity="0.7" filter="url(#kSoftS)"/>
        <!-- subtle nut texture streaks -->
        <path d="M86 92 C78 150 76 230 96 310" stroke="#CFA36A" stroke-width="3" fill="none" opacity="0.25" stroke-linecap="round"/>
        <path d="M70 140 C64 200 66 260 82 300" stroke="#CFA36A" stroke-width="2" fill="none" opacity="0.2" stroke-linecap="round"/>
      </g>
      <!-- glossy highlights -->
      <ellipse cx="104" cy="78" rx="34" ry="20" fill="url(#kSpec)" transform="rotate(-28 104 78)" opacity="0.9"/>
      <ellipse cx="90" cy="70" rx="8" ry="5" fill="#fff" transform="rotate(-28 90 70)"/>
      <ellipse cx="70" cy="250" rx="7" ry="22" fill="url(#kSpec)" opacity="0.45"/>
    </g>

    <!-- face -->
    <g id="k-face">
      <ellipse cx="92" cy="200" rx="22" ry="13" fill="url(#kCheek)"/>
      <ellipse cx="208" cy="200" rx="22" ry="13" fill="url(#kCheek)"/>

      <g id="k-browL"><path d="M84 112 Q106 98 128 108" stroke="#4A2710" stroke-width="9" stroke-linecap="round" fill="none"/></g>
      <g id="k-browR"><path d="M168 106 Q192 96 214 110" stroke="#4A2710" stroke-width="9" stroke-linecap="round" fill="none"/></g>

      <g id="k-eyeL" class="k-eye">
        <ellipse cx="108" cy="152" rx="27" ry="32" fill="url(#kEyeW)"/>
        <g class="k-look">
          <circle cx="112" cy="158" r="18" fill="url(#kIris)"/>
          <circle cx="113" cy="160" r="9" fill="#120600"/>
          <circle cx="104" cy="149" r="6" fill="#fff"/>
          <circle cx="119" cy="167" r="2.6" fill="#fff" opacity="0.85"/>
        </g>
        <path d="M81 146 Q108 116 135 146" stroke="#6B3A15" stroke-width="3" fill="none" opacity="0.35"/>
      </g>
      <g id="k-eyeR" class="k-eye">
        <ellipse cx="190" cy="150" rx="27" ry="32" fill="url(#kEyeW)"/>
        <g class="k-look">
          <circle cx="194" cy="156" r="18" fill="url(#kIris)"/>
          <circle cx="195" cy="158" r="9" fill="#120600"/>
          <circle cx="186" cy="147" r="6" fill="#fff"/>
          <circle cx="201" cy="165" r="2.6" fill="#fff" opacity="0.85"/>
        </g>
        <path d="M163 144 Q190 114 217 144" stroke="#6B3A15" stroke-width="3" fill="none" opacity="0.35"/>
      </g>
      <!-- closed, sleepy eyes (shown underground) -->
      <g id="k-sleep" opacity="0">
        <path d="M86 158 Q108 172 130 158" stroke="#4A2710" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M168 156 Q190 170 212 156" stroke="#4A2710" stroke-width="6" stroke-linecap="round" fill="none"/>
      </g>

      <g id="k-mouth">
        <path d="M118 214 Q150 222 182 214 Q178 252 150 254 Q122 252 118 214 Z" fill="url(#kMouth)"/>
        <g clip-path="url(#kMouthClip)">
          <ellipse cx="150" cy="252" rx="22" ry="13" fill="#FF7A6B"/>
          <rect x="126" y="212" width="48" height="9" rx="4" fill="#FFF8EE"/>
        </g>
        <path d="M112 212 Q118 210 120 216" stroke="#6B3A15" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
        <path d="M188 212 Q182 210 180 216" stroke="#6B3A15" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
      </g>
    </g>
  </g></g></g></g>
</svg>`;
