const fs = require('fs');
const path = require('path');

const css = `
/* ---- PASTEL THEME OVERRIDES v2 ---- */
:root {
  --bg-mint: #D4E4DD;
  --bg-blue: #AEDFF7;
  --bg-pink: #F9D5E5;
  --bg-yellow: #FDF6B2;
  --bg-white: #FFFFFF;
  --text-dark: #2A2A2A;
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.05);
}

body {
  background-color: var(--bg-mint) !important;
  background-image: none !important;
  color: var(--text-dark) !important;
}

/* Force all text and icons to dark charcoal for legibility */
body *, .text-white, .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500, .text-slate-600, .text-slate-700, .text-slate-800, .text-slate-900,
.text-pink-100, .text-pink-200, .text-pink-300, .text-pink-400, .text-pink-500, .text-pink-600, .text-pink-700, .text-pink-800, .text-pink-900,
.text-amber-100, .text-amber-200, .text-amber-300, .text-amber-400, .text-amber-500, .text-amber-600, .text-amber-700, .text-amber-800, .text-amber-900,
.text-emerald-100, .text-emerald-200, .text-emerald-300, .text-emerald-400, .text-emerald-500, .text-emerald-600, .text-emerald-700, .text-emerald-800, .text-emerald-900,
.text-purple-100, .text-purple-200, .text-purple-300, .text-purple-400, .text-purple-500, .text-purple-600, .text-purple-700, .text-purple-800, .text-purple-900,
.text-sky-100, .text-sky-200, .text-sky-300, .text-sky-400, .text-sky-500, .text-sky-600, .text-sky-700, .text-sky-800, .text-sky-900 {
  color: var(--text-dark) !important;
}

/* Kill all dark background classes entirely */
[class*="dark:bg-slate-"], [class*="bg-slate-800"], [class*="bg-slate-900"], [class*="bg-slate-950"],
[class*="bg-gray-"], [class*="bg-zinc-"], [class*="bg-neutral-"], [class*="bg-stone-"] {
  background-color: transparent !important;
}

/* Fix SVG icon colors - force dark EXCEPT for the main central nav button */
svg {
  stroke: var(--text-dark) !important;
}
.fill-current {
  fill: var(--text-dark) !important;
}

/* Base styling for all top-level widget cards to alternate colors */
main .w-full.lg\\:w-1\\/3 > div:nth-child(1) { background-color: var(--bg-blue) !important; }
main .w-full.lg\\:w-1\\/3 > div:nth-child(2) { background-color: var(--bg-pink) !important; }
main .w-full.lg\\:w-1\\/3 > div:nth-child(3) { background-color: var(--bg-yellow) !important; }
main .w-full.lg\\:w-1\\/3 > div:nth-child(4) { background-color: var(--bg-white) !important; }
main .w-full.lg\\:w-1\\/3 > div:nth-child(5) { background-color: var(--bg-mint) !important; }
main .w-full.lg\\:w-1\\/3 > div:nth-child(6) { background-color: var(--bg-blue) !important; }

/* Apply shadow and border radius to all major cards uniformly */
main > div > div > div, .bg-white {
  box-shadow: var(--shadow-soft) !important;
  border-color: rgba(42, 42, 42, 0.05) !important;
  border-radius: 1.5rem !important; /* 24px */
}

/* Main Content Column Cards */
main .w-full.flex-1 > div {
  background-color: var(--bg-white) !important;
}
/* Ensure the inner cards inside the Results View or Questions Form don't look broken */
.bg-white\\/80, .bg-white\\/90, .bg-slate-50, .bg-slate-100 {
  background-color: rgba(255, 255, 255, 0.6) !important;
}

/* Buttons (CTA, active tabs) - Soft pastel yellow */
button.bg-pink-600, button.bg-amber-400, button.bg-emerald-600, button.bg-sky-600, button.pink-purple-gradient,
.bg-\\[\\#F5E050\\] {
  background-color: var(--bg-yellow) !important;
  color: var(--text-dark) !important;
  border-color: var(--bg-yellow) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}
/* Button Hover States */
button.bg-pink-600:hover, button.bg-amber-400:hover, button.bg-emerald-600:hover, button.bg-sky-600:hover {
  filter: brightness(0.95);
}

/* Nav Bar (Quick Actions) */
/* Normal tabs */
.bg-white.\\!text-\\[\\#1A1A1A\\] {
  background-color: var(--bg-white) !important;
  color: var(--text-dark) !important;
}
/* Active tabs */
.bg-\\[\\#F5E050\\].\\!text-\\[\\#1A1A1A\\] {
  background-color: var(--bg-yellow) !important;
  color: var(--text-dark) !important;
}
/* Central nav button */
.bg-\\[\\#1A1A1A\\].\\!text-white {
  background-color: var(--text-dark) !important;
  color: var(--bg-white) !important;
}
.bg-\\[\\#1A1A1A\\].\\!text-white svg {
  stroke: var(--bg-white) !important;
}
.bg-\\[\\#1A1A1A\\].\\!text-white span {
  color: var(--bg-white) !important;
}

/* Progress bars and charts */
.bg-amber-500, .bg-emerald-500, .bg-purple-500, .bg-pink-500, .bg-sky-500 {
  background-color: var(--bg-blue) !important;
}
.bg-emerald-500 { background-color: var(--bg-pink) !important; }
.bg-purple-500 { background-color: var(--bg-yellow) !important; }

/* Override any remaining dark elements (gradients, specific backgrounds) */
.bg-gradient-to-r, .bg-gradient-to-br, .pink-purple-gradient {
  background: transparent !important; /* Will fallback to the container color */
}

/* Prevent inner boxes (Spiritual Habits prayer times box) from being dark */
[class*="bg-emerald-50"], [class*="bg-sky-50"], [class*="bg-pink-50"] {
  background-color: rgba(255, 255, 255, 0.4) !important;
}
`;

let indexCssPath = 'src/index.css';
let content = fs.readFileSync(indexCssPath, 'utf8');

// Strip out the previous PASTEL THEME OVERRIDES block
const overrideStart = content.indexOf('/* ---- PASTEL THEME OVERRIDES');
if (overrideStart !== -1) {
  content = content.substring(0, overrideStart);
}

// Append new pastel theme
fs.writeFileSync(indexCssPath, content + '\n' + css);
console.log('Pastel theme v2 applied successfully to index.css');
