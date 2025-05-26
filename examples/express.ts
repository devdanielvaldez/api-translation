import express from 'express';
import { 
  Translator, 
  createExpressTranslationMiddleware, 
  Language 
} from 'apitranslation';

const app = express();

// Initialize the translator
const translator = new Translator({
  defaultTargetLanguage: Language.EN
});

// Apply the translation middleware
app.use(createExpressTranslationMiddleware(translator, {
  fieldToTranslate: ['message', 'description'],
  preserveOriginal: true,
  detectSourceLanguage: true,
  langQueryParam: 'lang'
}));

// Example route
app.get('/hello', (req, res) => {
  res.json({
    status: 'success',
    message: 'Hello! Welcome to our API.',
    description: 'This message will be automatically translated based on the lang parameter.'
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Try: http://localhost:3000/hello?lang=es');
});