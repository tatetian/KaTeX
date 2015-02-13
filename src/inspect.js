console.log('Starting inspect.js...');
var Parser = require('./Parser');
var traceParser = require('./traceParser');
traceParser();

var inputs = [
    '\\text{1}',
    '{2*1-3}',
    '\\frac{m}{n}',
    'x^2',
    '\\cos(x)',
    '\\hat f',
    '\\sum_{i=1}^n'/*,
   'f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\,e^{2 \\pi i \\xi x} \\,d\\xi'*/
];
for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var parser = new Parser(input);
    var result = parser.parse(input);
    console.log('\n');
}
