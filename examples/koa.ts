import Koa from 'koa';
import Router from '@koa/router';
import { 
  Translator, 
  createKoaTranslationMiddleware, 
  Language 
} from 'apitranslation';

const app = new Koa();
const router = new Router();

// Initialize the translator
const translator = new Translator({
  defaultTargetLanguage: Language.EN
});

// Apply the translation middleware
app.use(createKoaTranslationMiddleware(translator, {
  fieldToTranslate: 'message',
  preserveOriginal: true
}));

// Example route
router.get('/hello', (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'Hello! Welcome to our API.'
  };
});

app.use(router.routes());

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Try: http://localhost:3000/hello?lang=fr');
});