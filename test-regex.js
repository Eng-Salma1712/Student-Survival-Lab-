const tests = [
  '8H_2SO_4_{(conc)}',
  'x_1_2',
  'Fe_2(SO_4)_3',
  'H_2O'
];
tests.forEach(t => console.log(t.replace(/_([0-9a-zA-Z]+)_/g, '_$1{}_')));
