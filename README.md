# babel-extract-gettext [![CircleCI](https://circleci.com/gh/rtymchyk/babel-extract-gettext.svg?style=svg)](https://circleci.com/gh/rtymchyk/babel-extract-gettext)
Babel plugin to extract strings from React components and gettext-like functions into a gettext PO file.

### Features
- Extraction from gettext-like call expressions (e.g. `_('Hello World')`)
- Extraction from React components (e.g. `<LocalizedString id="Hello World"/>`)
- Customizable extraction (e.g. component name, function names and argument positions)
- Supports PO translator comments and context (comments only for components)
- Validation (e.g. props missing on component, non-string literals are used for call expression arguments)

### Example
⚙️ Plugin Configuration
```javascript
const babel = require('babel-core');

babel.transformFile('someCode.js', {
  plugins: [
    'syntax-jsx', // Required to be able to parse JSX
    ['babel-extract-gettext', {
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
});
```

⬅️️ Input (`someCode.js`):
```javascript
<LocalizedString
    id="You have a cat."
    idPlural="You have {cats} cats!"
    comment="User profile description for a public profile"
    count={numCats}
    cats={numCatsFormatted} />

_c('Flag', 'Physical Object');
 ```
  
➡️️ Output (`en-US.po`):
```
msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\n"
"Plural-Forms: nplurals=2; plural=(n!=1);\n"
"Language: en_US\n"
"PO-Revision-Date: 2017-02-08T05:27:35.094Z\n"

#: someCode.js
#. User profile description for a public profile
msgid "You have a cat."
msgid_plural "You have {cats} cats!"
msgstr[0] ""
msgstr[1] ""

#: someCode.js
msgctxt "Physical Object"
msgid "Flag"
msgstr ""
```
