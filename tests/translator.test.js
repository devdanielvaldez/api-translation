const { Translator } = require('api-translator-util');
const { GoogleTranslate, GeminiTranslate } = require('api-translator-util');

// Mock providers
jest.mock('api-translator-util/providers/google-translate', () => {
  return {
    GoogleTranslate: jest.fn().mockImplementation(() => {
      return {
        translateText: jest.fn().mockImplementation((text, targetLang, sourceLang) => {
          return Promise.resolve(`translated:${text}:${sourceLang || 'auto'}-${targetLang}`);
        }),
        detectLanguage: jest.fn().mockImplementation((text) => {
          return Promise.resolve('es');
        })
      };
    })
  };
});

describe('Translator', () => {
  let translator;
  
  beforeEach(() => {
    translator = new Translator({
      provider: new GoogleTranslate({ apiKey: 'test-key' })
    });
  });

  describe('translateText', () => {
    it('should translate text with provided target language', async () => {
      const result = await translator.translateText('Hello world', 'es');
      
      expect(result).toBe('translated:Hello world:auto-es');
    });

    it('should translate text with provided source and target languages', async () => {
      const result = await translator.translateText('Hello world', 'es', 'en');
      
      expect(result).toBe('translated:Hello world:en-es');
    });
  });

  describe('translateObject', () => {
    it('should translate specified fields in an object', async () => {
      const obj = {
        title: 'Welcome',
        body: 'Thank you for visiting',
        author: 'John Doe'
      };
      
      const result = await translator.translateObject(obj, 'es', ['title', 'body']);
      
      expect(result).toEqual({
        title: 'translated:Welcome:auto-es',
        body: 'translated:Thank you for visiting:auto-es',
        author: 'John Doe'
      });
    });

    it('should handle nested fields in an object', async () => {
      const obj = {
        title: 'Welcome',
        content: {
          body: 'Thank you for visiting',
          footer: 'Copyright 2023'
        }
      };
      
      const result = await translator.translateObject(obj, 'es', ['title', 'content.body']);
      
      expect(result).toEqual({
        title: 'translated:Welcome:auto-es',
        content: {
          body: 'translated:Thank you for visiting:auto-es',
          footer: 'Copyright 2023'
        }
      });
    });
  });

  describe('detectLanguage', () => {
    it('should detect the language of a text', async () => {
      const result = await translator.detectLanguage('Hola mundo');
      
      expect(result).toBe('es');
    });
  });
});