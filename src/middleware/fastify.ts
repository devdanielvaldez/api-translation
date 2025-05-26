import { Translator } from '../core/translator';
import { Language } from '../types/languages';
import { TranslationMiddlewareOptions } from '../types/options';

/**
 * Create a translation middleware for Fastify
 * 
 * @param translator - Translator instance
 * @param options - Middleware configuration options
 * @returns Fastify plugin
 */
export function createFastifyTranslationMiddleware(
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

  // Return Fastify plugin
  return function(fastify: any, _: any, done: Function) {
    fastify.addHook('onSend', async (request: any, reply: any, payload: any) => {
      try {
        // Check if translation should be skipped
        if (skipCondition && skipCondition(request)) {
          return payload;
        }

        // Determine target language from query param, header, or default
        const requestTargetLang = (request.query[langQueryParam]) || 
                                  request.headers[langHeaderName.toLowerCase()] || 
                                  targetLang;

        if (!requestTargetLang) {
          // No target language, proceed without translation
          return payload;
        }

        // Try to parse the payload if it's a string
        let parsed;
        if (typeof payload === 'string') {
          try {
            parsed = JSON.parse(payload);
          } catch (e) {
            // If not valid JSON, try to translate as plain text
            if (payload.trim().length > 0) {
              return await translator.translateText(
                payload, 
                requestTargetLang as Language
              );
            }
            return payload;
          }
        } else {
          return payload; // Not a string, can't process
        }

        // If we have a parsed object, process it
        if (parsed && typeof parsed === 'object') {
          const fieldsToTranslate = Array.isArray(fieldToTranslate) 
            ? fieldToTranslate 
            : [fieldToTranslate];
          
          for (const field of fieldsToTranslate) {
            // Handle nested fields
            const fieldParts = field.split('.');
            let target = parsed;
            
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
                let responseTarget = parsed;
                
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
          
          return JSON.stringify(parsed);
        }
        
        return payload;
      } catch (error) {
        console.error('Translation middleware error:', error);
        // In case of error, return the original payload
        return payload;
      }
    });

    done();
  };
}