const { utils } = require('api-translator-util');

describe('Utility Functions', () => {
  describe('deepTranslate', () => {
    it('should translate all specified fields in a simple object', async () => {
      const obj = {
        title: 'Welcome',
        description: 'This is a test',
        author: 'John'
      };

      const translator = async (text) => `translated:${text}`;
      const fields = ['title', 'description'];
      
      const result = await utils.deepTranslate(obj, translator, fields);
      
      expect(result).toEqual({
        title: 'translated:Welcome',
        description: 'translated:This is a test',
        author: 'John'
      });
    });

    it('should translate nested fields using dot notation', async () => {
      const obj = {
        header: {
          title: 'Welcome',
          subtitle: 'Please enjoy our service'
        },
        body: {
          content: 'Main content here',
          sections: [
            { title: 'Section 1', content: 'First section content' },
            { title: 'Section 2', content: 'Second section content' }
          ]
        }
      };

      const translator = async (text) => `translated:${text}`;
      const fields = [
        'header.title', 
        'body.content', 
        'body.sections.*.title'
      ];
      
      const result = await utils.deepTranslate(obj, translator, fields);
      
      expect(result).toEqual({
        header: {
          title: 'translated:Welcome',
          subtitle: 'Please enjoy our service'
        },
        body: {
          content: 'translated:Main content here',
          sections: [
            { title: 'translated:Section 1', content: 'First section content' },
            { title: 'translated:Section 2', content: 'Second section content' }
          ]
        }
      });
    });
  });

  describe('parseLanguagePreference', () => {
    it('should extract language from query parameter', () => {
      const req = {
        query: { lang: 'fr' },
        headers: {}
      };

      const options = {
        langQueryParam: 'lang',
        langHeaderName: 'x-language',
        targetLang: 'en'
      };
      
      const result = utils.parseLanguagePreference(req, options);
      expect(result).toBe('fr');
    });

    it('should extract language from header', () => {
      const req = {
        query: {},
        headers: { 'x-language': 'de' }
      };

      const options = {
        langQueryParam: 'lang',
        langHeaderName: 'x-language',
        targetLang: 'en'
      };
      
      const result = utils.parseLanguagePreference(req, options);
      expect(result).toBe('de');
    });

    it('should use default target language when no preference is specified', () => {
      const req = {
        query: {},
        headers: {}
      };

      const options = {
        langQueryParam: 'lang',
        langHeaderName: 'x-language',
        targetLang: 'es'
      };
      
      const result = utils.parseLanguagePreference(req, options);
      expect(result).toBe('es');
    });
  });

  describe('createCache', () => {
    it('should cache and retrieve values', () => {
      const cache = utils.createCache(100, 3600);
      
      cache.set('key1', 'value1');
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should respect max size limit', () => {
      const cache = utils.createCache(2, 3600);
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      expect(cache.get('key1')).toBeUndefined(); // evicted
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });
  });
});