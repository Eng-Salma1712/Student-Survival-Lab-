import katex from 'katex';
try {
  const html = katex.renderToString('8H_2SO_4_{(conc)} \\xrightarrow{\\Delta} FeSO_4 + Fe_2(SO_4)_3 + 4SO_2\\uparrow + 8H_2O', {
    throwOnError: true
  });
  console.log("Success:", html);
} catch (e) {
  console.error("Error:", e.message);
}
