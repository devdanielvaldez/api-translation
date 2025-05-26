/**
 * Central export file for all type definitions in the library
 */

// Export language-related types and utilities
import { Language, getLanguageName } from './languages';

// Export configuration-related types
import { 
  TranslatorConfig,
  TranslationMiddlewareOptions 
} from './options';

// Additional types for response handling
export interface TranslationResult {
  /** Original text that was translated */
  originalText: string;
  /** Translated text */
  translatedText: string;
  /** Source language (detected or specified) */
  sourceLanguage: Language;
  /** Target language of the translation */
  targetLanguage: Language;
  /** Whether the source language was auto-detected */
  autoDetected?: boolean;
  /** Translation timestamp */
  timestamp: string;
}

export interface TranslationMetadata {
  /** Source language of the translation */
  sourceLanguage: Language;
  /** Target language of the translation */
  targetLanguage: Language;
  /** Names of fields that were translated */
  translatedFields: string[];
  /** ISO timestamp of when the translation occurred */
  translatedAt: string;
  /** Whether source language was auto-detected */
  autoDetected?: boolean;
  /** Model used for translation */
  model?: string;
}

export interface TranslationError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Original text that failed to translate */
  originalText?: string;
  /** Source language */
  sourceLanguage?: Language;
  /** Target language */
  targetLanguage?: Language;
  /** Timestamp of the error */
  timestamp: string;
}

/**
 * Status of a translation operation
 */
export enum TranslationStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

/**
 * Options for batch translation operations
 */
export interface BatchTranslationOptions {
  /** Number of concurrent translation operations */
  concurrency?: number;
  /** Whether to continue on error */
  continueOnError?: boolean;
  /** Timeout for each translation in milliseconds */
  timeout?: number;
  /** Whether to include progress events */
  includeProgress?: boolean;
}

// Re-export all types
export {
  Language,
  getLanguageName,
  TranslatorConfig,
  TranslationMiddlewareOptions
};