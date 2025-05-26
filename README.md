# Api Translator

A lightweight and flexible library to integrate automatic translation into your web applications. It provides middleware for Express.js and other platforms, with support for multiple translation engines.

## Features

- 🌐 **Complete Translation:** Easily translate text, JSON objects, and API responses
- 🚀 **Express Middleware:** Seamless integration with Express applications
- 🧠 **Language Detection:** Automatic identification of source language
- ⚡ **Caching:** Built-in caching system to reduce API calls and improve performance
- 🔄 **Fallback Strategy:** Automatically switch between translation providers if one fails
- 🛠️ **Highly Configurable:** Customize to match your application's specific needs

## Installation

```bash
npm install apitranslator
```

## Express Middleware

Add translation capabilities to your Express.js application:

```javascript
import express from 'express';
import { createExpressTranslationMiddleware } from 'apitranslator';

const app = express();

// Config translator
const translator = new Translator({
  cacheSize: 1000
});

// Apply translation middleware
app.use(createExpressTranslationMiddleware(translator, {
  targetLang: 'es',             // Default target language
  fieldToTranslate: 'message',  // Field to translate in response
  responseField: 'translatedMessage', // Where to put the translated text
  preserveOriginal: true        // Keep original message
}));

// Your routes
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
  // With ?lang=es, response becomes:
  // { message: 'Hello, world!', translatedMessage: '¡Hola, mundo!' }
});

app.listen(3000);
```

## Direct Translation

Use the translator directly in your code:

```javascript
// Simple text translation
const translated = await translator.translateText('Hello, world!', 'fr');
console.log(translated); // 'Bonjour, monde!'

// Detect language
const language = await translator.detectLanguage('Hola mundo');
console.log(language); // 'es'

// Translate JSON objects
const translatedObj = await translator.translateObject(
  { title: 'Welcome', body: 'Thank you for visiting' },
  'de',
  ['title', 'body']
);
console.log(translatedObj);
// { title: 'Willkommen', body: 'Danke für Ihren Besuch' }
```

### Custom Response Handling

```javascript
app.use(createExpressTranslationMiddleware(translator, {
  targetLang: 'fr',
  fieldToTranslate: ['title', 'description', 'errors.message'],
  skipCondition: (req) => req.path.includes('/admin'),
  langQueryParam: 'language',
  langHeaderName: 'x-preferred-language'
}));
```

## API Reference

### `Translator` Class

The core class that manages translation requests.

### Middleware Options

- `targetLang`: Default target language
- `fieldToTranslate`: Field(s) to translate in response
- `responseField`: Where to put the translated text
- `preserveOriginal`: Keep original text
- `skipCondition`: Function to determine when to skip translation
- `langQueryParam`: Query parameter for language
- `langHeaderName`: Header name for language
- `detectSourceLanguage`: Auto-detect the source language

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT