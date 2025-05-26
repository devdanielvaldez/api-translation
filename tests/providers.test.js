const { GoogleTranslate, GeminiTranslate } = require('api-translator-util');
const axios = require('axios');

jest.mock('axios');

describe('Translation Providers', () => {
  describe('GoogleTranslate', () => {
    let googleTranslate;
    
    beforeEach(() => {
      googleTranslate = new GoogleTranslate({ apiKey: 'AIzaSyCUn2mq7nVCJjeiLG1p_MiUsjgzwe9Lg9Q' });
      
      // Mock axios response for Google Translate
      axios.post.mockImplementation((url, data, config) => {
        if (url.includes('language/translate/v2')) {
          if (data.q === 'Detect this language') {
            return Promise.resolve({
              data: {
                data: {
                  detections: [[{ language: 'en', confidence: 0.9 }]]
                }
              }
            });
          } else {
            return Promise.resolve({
              data: {
                data: {
                  translations: [{ 
                    translatedText: `Google translated: ${data.q}`,
                    detectedSourceLanguage: data.source || 'en'
                  }]
                }
              }
            });
          }
        }
        return Promise.reject(new Error('Unhandled request'));
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should translate text', async () => {
      const result = await googleTranslate.translateText('Hello', 'es');
      
      expect(result).toBe('Google translated: Hello');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('language/translate/v2'),
        expect.objectContaining({
          q: 'Hello',
          target: 'es'
        }),
        expect.anything()
      );
    });

    it('should detect language', async () => {
      const result = await googleTranslate.detectLanguage('Detect this language');
      
      expect(result).toBe('en');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('language/translate/v2/detect'),
        expect.objectContaining({
          q: 'Detect this language'
        }),
        expect.anything()
      );
    });

    it('should handle errors', async () => {
      axios.post.mockImplementationOnce(() => {
        return Promise.reject(new Error('API error'));
      });

      await expect(googleTranslate.translateText('Hello', 'es'))
        .rejects
        .toThrow('Translation failed: API error');
    });
  });

  describe('GeminiTranslate', () => {
    let geminiTranslate;
    
    beforeEach(() => {
      geminiTranslate = new GeminiTranslate({ apiKey: 'test-gemini-key' });
      
      // Mock axios response for Gemini AI
      axios.post.mockImplementation((url, data) => {
        if (url.includes('generateContent')) {
          if (data.contents[0].parts[0].text.includes('detect the language')) {
            return Promise.resolve({
              data: {
                candidates: [{
                  content: {
                    parts: [{ text: 'fr' }]
                  }
                }]
              }
            });
          } else {
            const sourceText = data.contents[0].parts[0].text.match(/translate "([^"]+)"/)[1];
            return Promise.resolve({
              data: {
                candidates: [{
                  content: {
                    parts: [{ text: `Gemini translated: ${sourceText}` }]
                  }
                }]
              }
            });
          }
        }
        return Promise.reject(new Error('Unhandled request'));
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should translate text', async () => {
      const result = await geminiTranslate.translateText('Hello', 'es');
      
      expect(result).toBe('Gemini translated: Hello');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('generateContent'),
        expect.objectContaining({
          contents: expect.arrayContaining([
            expect.objectContaining({
              parts: expect.arrayContaining([
                expect.objectContaining({
                  text: expect.stringContaining('translate "Hello"')
                })
              ])
            })
          ])
        }),
        expect.anything()
      );
    });

    it('should detect language', async () => {
      const result = await geminiTranslate.detectLanguage('Detect this language');
      
      expect(result).toBe('fr');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('generateContent'),
        expect.objectContaining({
          contents: expect.arrayContaining([
            expect.objectContaining({
              parts: expect.arrayContaining([
                expect.objectContaining({
                  text: expect.stringContaining('detect the language')
                })
              ])
            })
          ])
        }),
        expect.anything()
      );
    });

    it('should handle errors', async () => {
      axios.post.mockImplementationOnce(() => {
        return Promise.reject(new Error('API error'));
      });

      await expect(geminiTranslate.translateText('Hello', 'es'))
        .rejects
        .toThrow('Translation failed: API error');
    });
  });
});