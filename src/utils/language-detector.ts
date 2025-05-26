import { Translator } from '../core/translator';
import { Language } from '../types/languages';

/**
 * Utility class for language detection
 */
export class LanguageDetector {
  private translator: Translator;
  private cache: Map<string, Language> = new Map();
  private cacheSize: number;

  /**
   * Create a new language detector instance
   * 
   * @param translator - Translator instance to use for detection
   * @param cacheSize - Maximum number of entries in the detection cache
   */
  constructor(translator: Translator, cacheSize = 1000) {
    this.translator = translator;
    this.cacheSize = cacheSize;
  }

  /**
   * Detect the language of a text
   * 
   * @param text - Text to analyze
   * @returns Detected language code
   */
  async detect(text: string): Promise<Language> {
    // Quick exit for empty text
    if (!text || text.trim().length === 0) {
      return Language.EN;
    }
    
    // Use shorter sample for long texts
    const sampleText = text.length > 200 
      ? text.substring(0, 200) 
      : text;
    
    // Check cache for this text sample
    const cacheKey = this.hashText(sampleText);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Perform detection
    const detectedLang = await this.translator.detectLanguage(sampleText);
    
    // Update cache
    if (this.cache.size >= this.cacheSize) {
      // Remove oldest entry if cache is full
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(cacheKey, detectedLang);
    
    return detectedLang;
  }

  /**
   * Clear the language detection cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Create a simple hash of the text for cache keys
   * 
   * @param text - Text to hash
   * @returns Simple hash string
   */
  private hashText(text: string): string {
    let hash = 0;
    if (text.length === 0) return hash.toString();
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  }
}