const { createExpressTranslationMiddleware } = require('api-translator-util');
const { Translator, GoogleTranslate } = require('api-translator-util');
const httpMocks = require('node-mocks-http');

// Mock Translator
jest.mock('api-translator-util', () => {
  const originalModule = jest.requireActual('api-translator-util');
  return {
    ...originalModule,
    Translator: jest.fn().mockImplementation(() => {
      return {
        translateObject: jest.fn().mockImplementation((obj, targetLang) => {
          const translated = { ...obj };
          Object.keys(translated).forEach(key => {
            if (typeof translated[key] === 'string') {
              translated[key] = `translated:${translated[key]}:${targetLang}`;
            }
          });
          return Promise.resolve(translated);
        }),
        detectLanguage: jest.fn().mockImplementation(() => Promise.resolve('en'))
      };
    })
  };
});

describe('Express Translation Middleware', () => {
  let translator;
  let middleware;
  let req;
  let res;
  let next;

  beforeEach(() => {
    translator = new Translator({
      provider: new GoogleTranslate({ apiKey: 'test-key' })
    });
    
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  describe('Basic functionality', () => {
    it('should pass through when no translation is needed', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        targetLang: 'es',
        fieldToTranslate: 'message'
      });

      req.query.lang = null;
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.locals.translate).toBeDefined();
    });

    it('should set up translation function in res.locals', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        targetLang: 'es',
        fieldToTranslate: 'message'
      });

      req.query.lang = 'fr';
      await middleware(req, res, next);
      
      expect(res.locals.translate).toBeDefined();
      expect(typeof res.locals.translate).toBe('function');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Response translation', () => {
    it('should translate response data when json is called', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        targetLang: 'es',
        fieldToTranslate: 'message',
        preserveOriginal: false
      });

      req.query.lang = 'fr';
      await middleware(req, res, next);
      
      // Override res.json to test translation
      const originalJson = res.json;
      res.json = jest.fn().mockImplementation(data => {
        expect(data.message).toBe('translated:Hello world:fr');
        return originalJson.call(res, data);
      });
      
      res.json({ message: 'Hello world' });
      expect(res.json).toHaveBeenCalled();
    });

    it('should preserve original message when configured', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        targetLang: 'es',
        fieldToTranslate: 'message',
        responseField: 'translatedMessage',
        preserveOriginal: true
      });

      req.query.lang = 'fr';
      await middleware(req, res, next);
      
      // Override res.json to test translation
      const originalJson = res.json;
      res.json = jest.fn().mockImplementation(data => {
        expect(data.message).toBe('Hello world');
        expect(data.translatedMessage).toBe('translated:Hello world:fr');
        return originalJson.call(res, data);
      });
      
      res.json({ message: 'Hello world' });
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Language detection', () => {
    it('should use lang query parameter', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        fieldToTranslate: 'message',
        langQueryParam: 'language'
      });

      req.query.language = 'de';
      await middleware(req, res, next);
      
      // Override res.json to test translation
      const originalJson = res.json;
      res.json = jest.fn().mockImplementation(data => {
        expect(translator.translateObject).toHaveBeenCalledWith(
          expect.anything(), 
          'de',
          expect.anything()
        );
        return originalJson.call(res, data);
      });
      
      res.json({ message: 'Hello world' });
    });

    it('should use lang header', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        fieldToTranslate: 'message',
        langHeaderName: 'x-lang'
      });

      req.headers['x-lang'] = 'it';
      await middleware(req, res, next);
      
      // Override res.json to test translation
      const originalJson = res.json;
      res.json = jest.fn().mockImplementation(data => {
        expect(translator.translateObject).toHaveBeenCalledWith(
          expect.anything(), 
          'it',
          expect.anything()
        );
        return originalJson.call(res, data);
      });
      
      res.json({ message: 'Hello world' });
    });
  });

  describe('Skip conditions', () => {
    it('should skip translation based on custom condition', async () => {
      middleware = createExpressTranslationMiddleware(translator, {
        fieldToTranslate: 'message',
        skipCondition: (req) => req.path.includes('/admin')
      });

      req.path = '/api/admin/users';
      req.query.lang = 'fr';
      await middleware(req, res, next);
      
      // Override res.json to verify no translation happens
      const originalJson = res.json;
      res.json = jest.fn().mockImplementation(data => {
        expect(data.message).toBe('Hello world'); // Not translated
        return originalJson.call(res, data);
      });
      
      res.json({ message: 'Hello world' });
    });
  });
});