// Export main classes
import { Translator } from './core/translator';
import { GeminiClient } from './core/gemini-client';
import { LanguageDetector } from './utils/language-detector';
import { createExpressTranslationMiddleware } from './middleware/express';
import { createKoaTranslationMiddleware } from './middleware/koa';
import { createFastifyTranslationMiddleware } from './middleware/fastify';
import { createGenericTranslationMiddleware } from './middleware/generic';

// Export types
import { Language, getLanguageName } from './types/languages';
import { TranslatorConfig, TranslationMiddlewareOptions } from './types/options';

// Export all components
export {
  // Main classes
  Translator,
  GeminiClient,
  LanguageDetector,
  
  // Middleware creators
  createExpressTranslationMiddleware,
  createKoaTranslationMiddleware,
  createFastifyTranslationMiddleware,
  createGenericTranslationMiddleware,
  
  // Types
  Language,
  TranslatorConfig,
  TranslationMiddlewareOptions,
  
  // Utility functions
  getLanguageName
};

// Default export
export default Translator;