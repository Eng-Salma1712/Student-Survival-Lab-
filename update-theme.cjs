const fs = require('fs');

const css = `
/* ---- AI DESIGN THEME OVERRIDES ---- */
:root {
  --bg-mint: #D4E4DD;
  --accent-yellow: #F5E050;
  --surface-white: #FFFFFF;
  --text-charcoal: #1A1A1A;
  --text-muted: #8A8A8A;
}

body {
  background-color: var(--bg-mint) !important;
  background-image: none !important;
  color: var(--text-charcoal) !important;
}

/* Force all app backgrounds to Mint/Teal */
.bg-\\[\\#F8F9FA\\], .min-h-screen {
  background-color: var(--bg-mint) !important;
}

/* Clean up all cards to be solid white with soft shadow */
.bg-white, .bg-slate-50, .bg-white\\/80 {
  background-color: var(--surface-white) !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04) !important;
  border-color: #E8F0ED !important;
}

/* Transform primary actions into pastel yellow */
.bg-pink-600, .bg-amber-400, .bg-emerald-600, .bg-sky-600, .pink-purple-gradient, .bg-gradient-to-br, .bg-gradient-to-r {
  background: var(--accent-yellow) !important;
  color: var(--text-charcoal) !important;
  border-color: var(--accent-yellow) !important;
  box-shadow: 0 4px 12px rgba(245, 224, 80, 0.4) !important;
}

/* Ensure text and icons inside yellow buttons are charcoal */
.bg-pink-600 *, .bg-amber-400 *, .bg-emerald-600 *, .bg-sky-600 *, .pink-purple-gradient *, .bg-gradient-to-br *, .bg-gradient-to-r * {
  color: var(--text-charcoal) !important;
}

/* Transform charts and progress bars */
.bg-amber-500, .bg-emerald-500, .bg-purple-500, .bg-pink-500 {
  background-color: var(--accent-yellow) !important;
}

/* Text definitions */
.text-slate-900, .text-slate-800, .text-pink-900, .text-pink-700 {
  color: var(--text-charcoal) !important;
}
.text-slate-500, .text-slate-600, .text-slate-400, .text-pink-100 {
  color: var(--text-muted) !important;
}

/* Accent text */
.text-amber-500, .text-amber-300, .text-purple-300, .text-pink-600, .text-purple-600 {
  color: var(--text-charcoal) !important;
}
`;
let content = fs.readFileSync('src/index.css', 'utf8');
if (!content.includes('--bg-mint')) {
  fs.writeFileSync('src/index.css', content + '\n' + css);
}
