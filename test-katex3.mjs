import katex from 'katex';
try {
  const html = katex.renderToString('8H_2SO_4{}_{(conc)} \\xrightarrow{\\Delta}', {
    throwOnError: false
  });
  console.log("Output:", html);
} catch (e) {
  console.error("Error:", e.message);
}
