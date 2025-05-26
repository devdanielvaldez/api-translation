import { Translator } from '../core/translator';
import { Language } from '../types/languages';
import { TranslationMiddlewareOptions } from '../types/options';

/**
 * Generic translation function for use in any context
 */
export function createGenericTranslationMiddleware(
  translator: Translator,
  options: TranslationMiddlewareOptions = {}
) {
  const {
    targetLang,
    fieldToTranslate = 'message',
    responseField = 'translatedMessage',
    preserveOriginal = true,
    detectSourceLanguage = false
  } = options;

  /**
   * Translate a response object or string
   * 
   * @param response - Object or string to translate
   * @param language - Target language code
   * @returns Translated response
   */
  return async function translateResponse(
    response: any, 
    language: Language = targetLang as Language
  ): Promise<any> {
    try {
      if (!language) {
        return response; // No language specified
      }

      // Handle string responses
      if (typeof response === 'string') {
        return await translator.translateText(response, language);
      }
      
      // Handle object responses
      if (response && typeof response === 'object') {
        const fieldsToTranslate = Array.isArray(fieldToTranslate) 
          ? fieldToTranslate 
          : [fieldToTranslate];
        
        const result = { ...response };
        
        for (const field of fieldsToTranslate) {
          // Handle nested fields
          const fieldParts = field.split('.');
          let target = result;
          
          // Navigate to the nested field
          for (let i = 0; i < fieldParts.length - 1; i++) {
            const part = fieldParts[i];
            if (!target[part]) break;
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
              language,
              sourceLang
            );
            
            // Store translated text
            if (preserveOriginal) {
              // Create response field path
              const responseFieldParts = responseField.split('.');
              let responseTarget = result;
              
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
        
        return result;
      }
      
      return response; // Return unchanged for unsupported types
    } catch (error) {
      console.error('Translation error:', error);
      return response; // Return original on error
    }
  };
}