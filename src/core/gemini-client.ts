import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Language } from '../types/languages';

/**
 * Client for interacting with Google Gemini API for translations
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly DEFAULT_MODEL = 'gemini-1.5-pro';
  private cache: Map<string, string> = new Map();
  private enableCache: boolean;
  private cacheSize: number;

  /**
   * Create a new Gemini API client for translations
   * 
   * @param apiKey - Google API key
   * @param modelName - Gemini model name
   * @param enableCache - Whether to cache translation results
   * @param cacheSize - Maximum number of entries in the translation cache
   */
  constructor(
    apiKey: string, 
    modelName?: string,
    enableCache = true,
    cacheSize = 1000
  ) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName || this.DEFAULT_MODEL });
    this.enableCache = enableCache;
    this.cacheSize = cacheSize;
  }

  /**
   * Translate text to the target language
   * 
   * @param text - Text to translate
   * @param targetLang - Target language
   * @param sourceLang - Source language (optional)
   * @returns Translated text
   */
  async translate(text: string, targetLang: Language, sourceLang?: Language): Promise<string> {
    // Skip translation if text is empty or target and source languages are the same
    if (!text || (sourceLang && sourceLang === targetLang)) {
      return text;
    }

    // Check cache first if enabled
    const cacheKey = `${text}:${targetLang}:${sourceLang || 'auto'}`;
    if (this.enableCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Create the prompt for Gemini based on whether source language is known
    let prompt: string;
    if (sourceLang) {
      prompt = `Translate this text from ${sourceLang} to ${targetLang}. Return only the translated text without explanations or notes.\n\nText: "${text}"`;
    } else {
      prompt = `Translate this text to ${targetLang}. Return only the translated text without explanations or notes.\n\nText: "${text}"`;
    }

    try {
      // Send request to Gemini
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const translatedText = response.text().trim();

      console.log(result);
      console.log(response);
      console.log(translatedText);

      // Cache the result if caching is enabled
      if (this.enableCache) {
        // If cache is at capacity, remove the oldest entry
        if (this.cache.size >= this.cacheSize) {
          const oldestKey = this.cache.keys().next().value;
          if (oldestKey !== undefined) {
            this.cache.delete(oldestKey);
          }
        }
        this.cache.set(cacheKey, translatedText);
      }

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }

  /**
   * Clear the translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Detect the language of a text using Gemini
   * 
   * @param text - Text to analyze
   * @returns Detected language code
   */
  async detectLanguage(text: string): Promise<Language> {
    const prompt = `Detect the language of the following text and respond with only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', etc.).\n\nText: "${text}"`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim().toLowerCase();
      
      // Ensure the response is a valid language code
      const isValidLanguageCode = Object.values(Language).includes(response as Language);
      return isValidLanguageCode ? (response as Language) : Language.EN;
    } catch (error) {
      console.error('Language detection error:', error);
      return Language.EN; // Default to English on error
    }
  }
}