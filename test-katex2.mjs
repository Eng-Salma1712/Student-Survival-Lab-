import katex from 'katex';
try {
  const html = katex.renderToString('8H_2SO_4_{(conc)} \\xrightarrow{\\Delta}', {
    throwOnError: false,
    strict: false
  });
  console.log("Output:", html);
} catch (e) {
  console.error("Error:", e.message);
}
