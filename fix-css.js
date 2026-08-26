const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/button\.bg-\\\\\[\\\\#1A1A1A\\\\\]/g, 'button.bg-\\[\\#1A1A1A\\]');
css = css.replace(/\.bg-\\\\\[\\\\#1A1A1A\\\\\]/g, '.bg-\\[\\#1A1A1A\\]');
css = css.replace(/\.bg-\\\\\[\\\\#F5E050\\\\\]/g, '.bg-\\[\\#F5E050\\]');
fs.writeFileSync('src/index.css', css);
