import { Language } from './languages';

/**
 * Configuration options for the translator instance
 */
export interface TranslatorConfig {
  /** Google API key for accessing Gemini API */
  apiKey: string;
  /** Default target language when not specified in requests */
  defaultTargetLanguage?: Language;
  /** Gemini model to use for translation */
  model?: string;
  /** Maximum timeout for translation requests in milliseconds */
  timeout?: number;
  /** Enable caching of translation results */
  enableCache?: boolean;
  /** Maximum size of translation cache (number of entries) */
  cacheSize?: number;
}

/**
 * Options for the translation middleware
 */
export interface TranslationMiddlewareOptions {
  /** Target language for translation */
  targetLang?: Language;
  /** Field(s) in response to translate */
  fieldToTranslate?: string | string[];
  /** Where to put the translated content */
  responseField?: string;
  /** Whether to keep the original content */
  preserveOriginal?: boolean;
  /** Function to determine if translation should be skipped */
  skipCondition?: (req: any) => boolean;
  /** Query parameter name to override target language */
  langQueryParam?: string;
  /** Header name to override target language */
  langHeaderName?: string;
  /** Use source language detection */
  detectSourceLanguage?: boolean;
}