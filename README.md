# babel-extract-gettext [![npm version](https://badge.fury.io/js/babel-extract-gettext.svg)](https://badge.fury.io/js/babel-extract-gettext) [![CircleCI](https://img.shields.io/circleci/project/github/RedSparr0w/node-csgo-parser.svg)](https://circleci.com/gh/rtymchyk/babel-extract-gettext) [![David](https://david-dm.org/rtymchyk/babel-extract-gettext.svg)](https://david-dm.org/rtymchyk/babel-extract-gettext)
Babel plugin to extract strings from React components and gettext-like functions into a gettext PO file.

## Features
- Extraction from gettext-like functions (e.g. `_('Hello World')`)
- Extraction from React components (e.g. `<LocalizedString id="Hello World"/>`)
- Customizable extraction (e.g. component name, function names and function argument positions)
- Supports translator comments and context (comments are only available for components)
- Validation (e.g. props missing on component, non-string literals are used for call expression arguments)

## Setup
Begin with installing this plugin and the JSX plugin for Babel
```
npm install babel-extract-gettext babel-plugin-syntax-jsx
```
In a babel configuration, add both plugins and set the options
```
{ plugins: ['syntax-jsx', ['babel-extract-gettext', { ... options ... }]] }
```

#### Options
This plugin allows a number of configurations to be passed:
- `outputFile`: Output PO file (default `strings.po`)
- `includeReference`: Whether to include a file reference for PO entries (default `false`)
- `baseDir`: Root directory of project. Everything up to and including this will be stripped from entry references.
- `charset`: Character set for the PO (default `UTF-8`)
- `headers`: Object indicating all PO headers to include. See the default headers [here](https://github.com/rtymchyk/babel-extract-gettext/blob/master/builders.js#L20).
- `component`/`function`: Objects customizing the extraction for component/function respectively. This includes the React component name to look for, the function names, and so on. See the default configuration [here](https://github.com/rtymchyk/babel-extract-gettext/blob/master/arguments.js).

## Example
Plugin Configuration
```javascript
const babel = require('babel-core');

babel.transformFile('someCode.js', {
  plugins: [
    'syntax-jsx',
    ['babel-extract-gettext', {
      outputFile: 'en-US.po',
      includeReference: true,
      headers: {
        'po-revision-date': new Date().toISOString(),
      },
      component: {
        name: 'Message',
        singular: 'id',
        plural: 'idPlural',
        context: 'context',
        comment: 'comment',
      },
    }],
  ],
});
```

Input (`someCode.js`)
```javascript
<Message
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

## Next Steps
1. <strong>How do I get these React components/functions to actually translate strings?</strong>

  You'll need to build these out and hook them up to a basic gettext client. Check out [Jed](https://github.com/messageformat/Jed).

2. <strong>How do I use a translated PO given back to me by translators?</strong>

  Check out [po2json](https://github.com/mikeedwards/po2json) to convert it to JSON, and serve the JSON as message bundles to clients to load into Jed.

## Motivation
1. <strong>Why not use ICU MessageFormat?</strong>

  ICU patterns strings, while pretty powerful, can become clunkly very fast. Gettext style strings should be enough to cover the typical use cases and are easy to use and understand. More importantly, ICU strings are not always supported by translators and translation providers, whereas the PO format is a de facto standard.

2. <strong>Why not use xgettext to extract?</strong>

  xgettext is a difficult dependency to install and manage since it's not native to the JS ecosystem. Also, xgettext will only support extraction from call expressions. Regardless, the tool definitely does not support JSX/ES6, so you'll be running your code through Babel anyway.

3. <strong>Why not use a simple JSON format for strings (or some format X)?</strong>

  Many extraction tools invent their own format, or use a basic JSON structure, which either ends up being too simple (e.g. not able to support pluralization) and/or not translator friendly (translators are used to working with certain formats). Gettext/PO is a proven method for translation that satisfies everyone: translators, developers, product, and users.

## Acknowledgements
Thanks to the folks over at Sentry for their [blog post](https://blog.sentry.io/2016/01/07/react-i18n.html), and their [extractor](https://github.com/getsentry/babel-gettext-extractor) tool, both of which served as an inspiration for me to utilize Babel to extend the extraction process to React.
