import { Translator } from '../core/translator';
import { Language } from '../types/languages';
import { TranslationMiddlewareOptions } from '../types/options';

/**
 * Create a translation middleware for Koa
 * 
 * @param translator - Translator instance
 * @param options - Middleware configuration options
 * @returns Koa middleware function
 */
export function createKoaTranslationMiddleware(
  translator: Translator,
  options: TranslationMiddlewareOptions = {}
) {
  const {
    targetLang,
    fieldToTranslate = 'message',
    responseField = 'translatedMessage',
    preserveOriginal = true,
    skipCondition,
    langQueryParam = 'lang',
    langHeaderName = 'x-accept-language',
    detectSourceLanguage = false
  } = options;

  // Return middleware function
  return async (ctx: any, next: Function) => {
    await next();

    try {
      // Check if translation should be skipped
      if (skipCondition && skipCondition(ctx.request)) {
        return;
      }

      // Determine target language from query param, header, or default
      const requestTargetLang = (ctx.query[langQueryParam] as string) || 
                                ctx.headers[langHeaderName.toLowerCase()] || 
                                targetLang;

      if (!requestTargetLang) {
        // No target language, proceed without translation
        return;
      }

      // If response body exists and is an object
      if (ctx.body && typeof ctx.body === 'object') {
        const fieldsToTranslate = Array.isArray(fieldToTranslate) 
          ? fieldToTranslate 
          : [fieldToTranslate];
        
        for (const field of fieldsToTranslate) {
          // Handle nested fields
          const fieldParts = field.split('.');
          let target = ctx.body;
          
          // Navigate to the nested field
          for (let i = 0; i < fieldParts.length - 1; i++) {
            const part = fieldParts[i];
            if (!target[part] || typeof target[part] !== 'object') {
              target[part] = {};
            }
            target = target[part];
          }
          
          const finalField = fieldParts[fieldParts.length - 1];
          
          // Check if field exists and is a string
          if (target && target[finalField] && typeof target[finalField] === 'string') {
            let sourceLang: Language | undefined = undefined;
            
            // Detect source language if enabled
            if (detectSourceLanguage) {
              sourceLang = await translator.detectLanguage(target[finalField]);
            }
            
            // Perform the translation
            const translatedText = await translator.translateText(
              target[finalField], 
              requestTargetLang as Language,
              sourceLang
            );
            
            // Store translated text
            if (preserveOriginal) {
              // Create response field path
              const responseFieldParts = responseField.split('.');
              let responseTarget = ctx.body;
              
              for (let i = 0; i < responseFieldParts.length - 1; i++) {
                const part = responseFieldParts[i];
                if (!responseTarget[part]) {
                  responseTarget[part] = {};
                }
                responseTarget = responseTarget[part];
              }
              
              const finalResponseField = responseFieldParts[responseFieldParts.length - 1];
              responseTarget[finalResponseField] = translatedText;
            } else {
              // Replace original text
              target[finalField] = translatedText;
            }
          }
        }
      } else if (typeof ctx.body === 'string' && ctx.body.length > 0) {
        // Handle string responses
        const translatedText = await translator.translateText(
          ctx.body,
          requestTargetLang as Language
        );
        ctx.body = translatedText;
      }
    } catch (error) {
      console.error('Translation middleware error:', error);
      // In case of error, keep the original response
    }
  };
}