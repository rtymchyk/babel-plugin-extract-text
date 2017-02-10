# babel-extract-gettext [![npm version](https://badge.fury.io/js/babel-extract-gettext.svg)](https://badge.fury.io/js/babel-extract-gettext) [![CircleCI](https://img.shields.io/circleci/project/github/RedSparr0w/node-csgo-parser.svg)](https://circleci.com/gh/rtymchyk/babel-extract-gettext)
Babel plugin to extract strings from React components and gettext-like functions into a gettext PO file.

## Features
- Extraction from gettext-like call expressions (e.g. `_('Hello World')`)
- Extraction from React components (e.g. `<LocalizedString id="Hello World"/>`)
- Customizable extraction (e.g. component name, function names and argument positions)
- Supports PO translator comments and context (comments only for components)
- Validation (e.g. props missing on component, non-string literals are used for call expression arguments)

## Example
Plugin Configuration
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

Input (`someCode.js`)
```javascript
<LocalizedString
    id="You have a cat."
    idPlural="You have {cats} cats!"
    comment="User profile description for a public profile"
    count={numCats}
    cats={numCatsFormatted} />

_c('Flag', 'Physical Object');
 ```

Output (`en-US.po`)
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

## Setup
First: `npm install babel-extract-gettext babel-plugin-syntax-jsx`

Then, in babel configuration:
`{ plugins: ['syntax-jsx', ['babel-extract-gettext', options]] }`

`babel-plugin-syntax-jsx` plugin is required only if you want to extract strings from JSX (React).

#### Options
This plugin allows a number of configurations to be passed:
- `outputFile`: Output PO file (default `strings.po`)
- `includeReference`: File name reference for PO entries (default `false`). May help clean up diffs for the PO file.
- `baseDir`: Root directory of project. Everything up to and including this will be stripped from entry references.
- `charset`: Character set for the PO (default `UTF-8`)
- `headers`: Object indicating all PO headers to include (default none).
- `component`/`function`: Objects customizing the extraction for component/function respectively. This includes the React component name to look for, the function names, and so on. See the [default arguments](https://github.com/rtymchyk/babel-extract-gettext/blob/master/arguments.js) for more details.

## Next Steps
1. <strong>How do I get these React components/functions to actually translate strings?</strong>

  You'll need to build these out and hook them up to a basic gettext client. Check out [Jed](https://github.com/messageformat/Jed).

2. <strong>How do I use a translated PO given back to me by translators?</strong>

  Check out [po2json](https://github.com/mikeedwards/po2json) to convert it to JSON, and serve the JSON as message bundles to clients to load into Jed.

## Motivation
1. <strong>Why not use ICU MessageFormat?</strong>

  ICU patterns strings are powerful, but are very clunky. Gettext style strings should be enough to cover the typical use cases. More importantly, ICU strings are not always supported by translators and translation providers, whereas PO strings are a de facto standard.

2. <strong>Why not use xgettext to extract?</strong>

  Among a number of reasons, xgettext will only support extraction from call expressions.

3. <strong>Why not use a simple JSON format for strings or format X?</strong>

  Many extraction tools invent their own format, or use a basic JSON structure, which is either too simple (e.g. not able to support pluralization) and/or not translator friendly (translators are used to working with certain formats). Gettext/PO is a proven method for translation that satisfies all stakeholders (translators, developers, product, and user).

## Credits
Thanks to the folks over at Sentry for their [blog post](https://blog.sentry.io/2016/01/07/react-i18n.html), and their [extractor](https://github.com/getsentry/babel-gettext-extractor) that served as an inspiration for me to utilize Babel to extend the extraction process to React.
