import { Request, Response, NextFunction } from 'express';
import { Translator } from '../core/translator';
import { Language } from '../types/languages';
import { TranslationMiddlewareOptions } from '../types/options';

/**
 * Create a translation middleware for Express
 * 
 * @param translator - Translator instance
 * @param options - Middleware configuration options
 * @returns Express middleware function
 */
export function createExpressTranslationMiddleware(
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
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original send function
    const originalSend = res.send;

    // Override the send method - no async here
    res.send = function(body: any): Response {
      // Check if translation should be skipped
      if (skipCondition && skipCondition(req)) {
        return originalSend.call(res, body);
      }

      // Determine target language from query param, header, or default
      const requestTargetLang = (req.query[langQueryParam] as string) || 
                              req.headers[langHeaderName] || 
                              targetLang;

      if (!requestTargetLang) {
        // No target language, proceed without translation
        return originalSend.call(res, body);
      }

      let parsedBody: any;
      
      // Parse response body if it's a JSON string
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          // If not valid JSON, treat as plain text
          if (requestTargetLang) {
            // Handle plain text translation asynchronously
            translator.translateText(body, requestTargetLang as Language)
              .then(translatedText => {
                originalSend.call(res, translatedText);
              })
              .catch(error => {
                console.error('Translation error:', error);
                originalSend.call(res, body);
              });
            return res;
          }
          return originalSend.call(res, body);
        }
      } else {
        parsedBody = body;
      }

      // If response is an object and has the field to translate
      if (parsedBody && typeof parsedBody === 'object') {
        const fieldsToTranslate = Array.isArray(fieldToTranslate) 
          ? fieldToTranslate 
          : [fieldToTranslate];
        
        const translationPromises: Promise<void>[] = [];
        
        for (const field of fieldsToTranslate) {
          // Handle nested fields
          const fieldParts = field.split('.');
          let target = parsedBody;
          let currentPath = '';
          
          // Navigate to the nested field
          for (let i = 0; i < fieldParts.length - 1; i++) {
            const part = fieldParts[i];
            currentPath = currentPath ? `${currentPath}.${part}` : part;
            
            if (!target[part] || typeof target[part] !== 'object') {
              target[part] = {};
            }
            target = target[part];
          }
          
          const finalField = fieldParts[fieldParts.length - 1];
          
          // Check if field exists and is a string
          if (target && target[finalField] && typeof target[finalField] === 'string') {
            const translationPromise = (async () => {
              try {
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
                  let responseTarget = parsedBody;
                  
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
              } catch (error) {
                console.error('Translation error:', error);
              }
            })();
            
            translationPromises.push(translationPromise);
          }
        }
        
        // Wait for all translations to complete, then send response
        if (translationPromises.length > 0) {
          Promise.all(translationPromises)
            .then(() => {
              originalSend.call(res, parsedBody);
            })
            .catch(error => {
              console.error('Translation error:', error);
              originalSend.call(res, body);
            });
          return res;
        }
      }
      
      // Pass through if no translation was performed
      return originalSend.call(res, body);
    };
    
    next();
  };
}