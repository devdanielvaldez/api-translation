import { GeminiClient } from './gemini-client';
import { Language, getLanguageName } from '../types/languages';
import { TranslatorConfig } from '../types/options';

/**
 * Main translator class for managing translations
 */
export class Translator {
  private client: GeminiClient;
  private config: TranslatorConfig;

  /**
   * Create a new translator instance
   * 
   * @param config - Configuration for the translator
   */
  constructor(config: TranslatorConfig) {
    this.config = {
      defaultTargetLanguage: Language.EN,
      timeout: 10000,
      enableCache: true,
      cacheSize: 1000,
      ...config
    };

    this.client = new GeminiClient(
      this.config.enableCache,
      this.config.cacheSize
    );
  }

  /**
   * Translate a single text string
   * 
   * @param text - Text to translate
   * @param targetLang - Target language (defaults to config setting)
   * @param sourceLang - Source language (optional)
   * @returns Translated text
   */
  async translateText(
    text: string, 
    targetLang: Language = this.config.defaultTargetLanguage!, 
    sourceLang?: Language
  ): Promise<string> {
    return this.client.translate(text, targetLang, sourceLang);
  }

  /**
   * Translate specific fields in an object
   * 
   * @param obj - Object containing fields to translate
   * @param fields - Field names to translate
   * @param targetLang - Target language
   * @returns Object with translated fields
   */
  async translateObject<T extends Record<string, any>>(
    obj: T, 
    fields: string | string[], 
    targetLang: Language = this.config.defaultTargetLanguage!
  ): Promise<T> {
    if (!obj) return obj;
    
    const fieldList = Array.isArray(fields) ? fields : [fields];
    const result: any = { ...obj };
    
    // Process each field
    for (const field of fieldList) {
      // Handle nested fields with dot notation
      if (field.includes('.')) {
        const parts = field.split('.');
        let current: any = result;
        let parent: any = null;
        let lastKey = '';
        
        // Navigate to the nested object
        for (let i = 0; i < parts.length - 1; i++) {
          if (current && typeof current === 'object') {
            parent = current;
            lastKey = parts[i];
            current = current[parts[i]];
          } else {
            break;
          }
        }
        
        // If we found the proper nested object, translate it
        if (parent && current) {
          const lastPart = parts[parts.length - 1];
          if (current[lastPart] && typeof current[lastPart] === 'string') {
            current[lastPart] = await this.translateText(current[lastPart], targetLang);
          }
        }
      } 
      // Simple top-level field
      else if (result[field] && typeof result[field] === 'string') {
        result[field] = await this.translateText(result[field], targetLang);
      }
    }
    
    return result;
  }

  /**
   * Detect the language of a text
   * 
   * @param text - Text to analyze
   * @returns Detected language code
   */
  async detectLanguage(text: string): Promise<Language> {
    return this.client.detectLanguage(text);
  }

  /**
   * Clear the translation cache
   */
  clearCache(): void {
    this.client.clearCache();
  }

  /**
   * Get the language name from a language code
   * 
   * @param language - Language code
   * @returns Full language name
   */
  getLanguageName(language: Language): string {
    return getLanguageName(language);
  }
}