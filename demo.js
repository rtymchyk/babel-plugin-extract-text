const babel = require('babel-core');

babel.transformFile('sampleCode.js', {
  plugins: [
    'syntax-jsx', // Required to be able to parse JSX
    ['./index.js', {
      outputFile: 'en-US.po',
      includeReference: true,
      charset: 'UTF-8',
      headers: {
        'content-type': 'text/plain; charset=UTF-8',
        'plural-forms': 'nplurals=2; plural=(n!=1);',
        'language': 'en_US',
        'po-revision-date': new Date().toISOString(),
      },
    }],
  ],
}, (err) => console.log(err));
