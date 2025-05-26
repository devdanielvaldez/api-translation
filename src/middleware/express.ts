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
    // Store the original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Helper function to handle translation
    async function translateResponse(body: any): Promise<any> {
      // Check if translation should be skipped
      if (skipCondition && skipCondition(req)) {
        return body;
      }

      // Determine target language from query param, header, or default
      const requestTargetLang = (req.query[langQueryParam] as string) || 
                              req.headers[langHeaderName] || 
                              targetLang;

      if (!requestTargetLang) {
        // No target language, proceed without translation
        return body;
      }

      let parsedBody: any;
      
      // Parse response body if it's a JSON string
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          // If not valid JSON, treat as plain text
          if (requestTargetLang) {
            try {
              return await translator.translateText(
                body, 
                requestTargetLang as Language
              );
            } catch (error) {
              console.error('Translation error:', error);
              return body;
            }
          }
          return body;
        }
      } else {
        parsedBody = body;
      }

      // If response is an object and has fields to translate
      if (parsedBody && typeof parsedBody === 'object') {
        const fieldsToTranslate = Array.isArray(fieldToTranslate) 
          ? fieldToTranslate 
          : [fieldToTranslate];
        
        // Process each field to translate
        for (const field of fieldsToTranslate) {
          try {
            await processField(
              parsedBody, 
              field, 
              requestTargetLang as Language
            );
          } catch (error) {
            console.error(`Error translating field ${field}:`, error);
          }
        }
      }
      
      return parsedBody;
    }

    // Helper function to process individual fields, including nested paths
    async function processField(
      obj: any, 
      fieldPath: string, 
      targetLanguage: Language
    ): Promise<void> {
      const fieldParts = fieldPath.split('.');
      let current = obj;
      let parent = null;
      let lastPart = '';

      // Navigate to the target field
      for (let i = 0; i < fieldParts.length - 1; i++) {
        const part = fieldParts[i];
        
        // Handle array wildcards (e.g., "items.*.title")
        if (part === '*' && Array.isArray(parent)) {
          // Process each array item recursively
          const remainingPath = fieldParts.slice(i + 1).join('.');
          for (const item of current) {
            await processField(item, remainingPath, targetLanguage);
          }
          return;
        }
        
        if (!current[part]) return;
        
        parent = current;
        lastPart = part;
        current = current[part];
      }

      const finalField = fieldParts[fieldParts.length - 1];
      
      // Handle wildcards at the final position
      if (finalField === '*' && Array.isArray(current)) {
        // Translate all items in the array
        for (let i = 0; i < current.length; i++) {
          if (typeof current[i] === 'string') {
            try {
              let sourceLang: Language | undefined = undefined;
              
              if (detectSourceLanguage) {
                sourceLang = await translator.detectLanguage(current[i]);
              }
              
              const translatedText = await translator.translateText(
                current[i], 
                targetLanguage,
                sourceLang
              );
              
              if (preserveOriginal) {
                // Create or use existing response field structure
                if (!obj[responseField]) {
                  obj[responseField] = Array.isArray(current) ? [] : {};
                }
                if (!obj[responseField][i]) {
                  obj[responseField][i] = translatedText;
                } else if (typeof obj[responseField][i] === 'object') {
                  obj[responseField][i]['_translated'] = translatedText;
                }
              } else {
                current[i] = translatedText;
              }
            } catch (error) {
              console.error('Translation error in array item:', error);
            }
          } else if (typeof current[i] === 'object' && current[i] !== null) {
            // If array contains objects, create a placeholder for translated values
            if (preserveOriginal && !obj[responseField]) {
              obj[responseField] = [];
            }
            if (preserveOriginal && !obj[responseField][i]) {
              obj[responseField][i] = {};
            }
          }
        }
        return;
      }
      
      // Process regular field if it's a string
      if (current && typeof current[finalField] === 'string') {
        try {
          let sourceLang: Language | undefined = undefined;
          
          if (detectSourceLanguage) {
            sourceLang = await translator.detectLanguage(current[finalField]);
          }
          
          const translatedText = await translator.translateText(
            current[finalField], 
            targetLanguage,
            sourceLang
          );
          
          if (preserveOriginal) {
            // Handle response field structure for storing translations
            const responseParts = responseField.split('.');
            let responseObj = obj;
            
            // Create nested structure if it doesn't exist
            for (let i = 0; i < responseParts.length - 1; i++) {
              const part = responseParts[i];
              if (!responseObj[part]) {
                responseObj[part] = {};
              }
              responseObj = responseObj[part];
            }
            
            const finalResponseField = responseParts[responseParts.length - 1];
            responseObj[finalResponseField] = translatedText;
          } else {
            // Replace original text
            current[finalField] = translatedText;
          }
        } catch (error) {
          console.error(`Translation error for field ${fieldPath}:`, error);
        }
      }
    }

    // Override res.json
    res.json = function(body: any): Response {
      // Handle async translation and then call the original method
      translateResponse(body)
        .then(translatedBody => {
          originalJson.call(res, translatedBody);
        })
        .catch(error => {
          console.error('Error in translation middleware:', error);
          originalJson.call(res, body);
        });
      
      return res;
    };

    // Override res.send
    res.send = function(body: any): Response {
      // Handle async translation and then call the original method
      translateResponse(body)
        .then(translatedBody => {
          originalSend.call(res, translatedBody);
        })
        .catch(error => {
          console.error('Error in translation middleware:', error);
          originalSend.call(res, body);
        });
      
      return res;
    };
    
    // Add a helper method to res for direct translation
    (res as any).translate = async function(text: string): Promise<string> {
      const requestTargetLang = (req.query[langQueryParam] as string) || 
                              req.headers[langHeaderName] || 
                              targetLang;
                              
      if (!requestTargetLang) return text;
      
      try {
        return await translator.translateText(
          text, 
          requestTargetLang as Language
        );
      } catch (error) {
        console.error('Direct translation error:', error);
        return text;
      }
    };
    
    next();
  };
}