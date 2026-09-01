import katex from 'katex';
try {
  const html = katex.renderToString('A_1{}_2{}_3', {
    throwOnError: false
  });
  console.log("Output:", html);
} catch (e) {
  console.error("Error:", e.message);
}
