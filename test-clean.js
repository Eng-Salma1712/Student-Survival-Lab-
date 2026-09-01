function cleanLatex(text) {
  let prev;
  do {
    prev = text;
    text = text.replace(/_([a-zA-Z0-9]|\{[^}]*\})_/g, '_$1{}_');
    text = text.replace(/\^([a-zA-Z0-9]|\{[^}]*\})\^/g, '^$1{}^');
  } while (text !== prev);
  return text;
}

const tests = [
  '8H_2SO_4_{(conc)}',
  'x_1_2',
  'x_{12}_3',
  'Fe_2(SO_4)_3',
  'H_2O',
  'A_1_2_3',
  'B^1^2^3'
];
tests.forEach(t => console.log(cleanLatex(t)));
