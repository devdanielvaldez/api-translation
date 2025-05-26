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
  console.log('[Middleware] Creating translation middleware with options:', JSON.stringify(options));
  
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
    const requestId = Math.random().toString(36).substring(2, 10);
    console.log(`[${requestId}] Middleware initialized for ${req.method} ${req.url}`);
    
    // Store the original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Helper function to handle translation
    async function translateResponse(body: any): Promise<any> {
      console.log(`[${requestId}] translateResponse called with body type: ${typeof body}`);
      
      // Check if translation should be skipped
      if (skipCondition && skipCondition(req)) {
        console.log(`[${requestId}] Translation skipped due to skipCondition`);
        return body;
      }

      // Determine target language from query param, header, or default
      const requestTargetLang = (req.query[langQueryParam] as string) || 
                              req.headers[langHeaderName] || 
                              targetLang;

      console.log(`[${requestId}] Target language: ${requestTargetLang || 'NONE'}`);

      if (!requestTargetLang) {
        console.log(`[${requestId}] No target language, returning original body`);
        return body;
      }

      // Check if the response has already been translated
      if (res.locals.translated) {
        console.log(`[${requestId}] Response has already been translated, returning original body`);
        return body;
      }

      let parsedBody: any;
      
      // Parse response body if it's a JSON string
      if (typeof body === 'string') {
        console.log(`[${requestId}] Body is string, attempting to parse as JSON`);
        try {
          parsedBody = JSON.parse(body);
          console.log(`[${requestId}] Successfully parsed body as JSON`);
        } catch (e) {
          console.log(`[${requestId}] Not valid JSON, treating as plain text`);
          // If not valid JSON, treat as plain text
          if (requestTargetLang) {
            console.log(`[${requestId}] Translating plain text...`);
            try {
              const result = await translator.translateText(
                body, 
                requestTargetLang as Language
              );
              console.log(`[${requestId}] Text translation complete`);
              return result;
            } catch (error) {
              console.error(`[${requestId}] Translation error:`, error);
              return body;
            }
          }
          return body;
        }
      } else {
        console.log(`[${requestId}] Body is not a string, using as is`);
        parsedBody = body;
      }

      // If response is an object and has fields to translate
      if (parsedBody && typeof parsedBody === 'object') {
        console.log(`[${requestId}] Processing object for translation`);
        const fieldsToTranslate = Array.isArray(fieldToTranslate) 
          ? fieldToTranslate 
          : [fieldToTranslate];
        
        console.log(`[${requestId}] Fields to translate: ${JSON.stringify(fieldsToTranslate)}`);
        
        // Process each field to translate
        for (const field of fieldsToTranslate) {
          try {
            console.log(`[${requestId}] Processing field: ${field}`);
            await processField(
              parsedBody, 
              field, 
              requestTargetLang as Language
            );
            console.log(`[${requestId}] Finished processing field: ${field}`);
          } catch (error) {
            console.error(`[${requestId}] Error translating field ${field}:`, error);
          }
        }
      }
      
      console.log(`[${requestId}] Translation process complete, returning processed body`);
      res.locals.translated = true; // Mark as translated
      return parsedBody;
    }

    // Helper function to process individual fields, including nested paths
    async function processField(
      obj: any, 
      fieldPath: string, 
      targetLanguage: Language
    ): Promise<void> {
      console.log(`[${requestId}] processField called for path: ${fieldPath}`);
      
      const fieldParts = fieldPath.split('.');
      let current = obj;
      let parent = null;
      let lastPart = '';

      // Navigate to the target field
      for (let i = 0; i < fieldParts.length - 1; i++) {
        const part = fieldParts[i];
        console.log(`[${requestId}] Navigating to part: ${part}`);
        
        // Handle array wildcards (e.g., "items.*.title")
        if (part === '*' && Array.isArray(parent)) {
          console.log(`[${requestId}] Found wildcard with array parent`);
          // Process each array item recursively
          const remainingPath = fieldParts.slice(i + 1).join('.');
          for (const item of current) {
            await processField(item, remainingPath, targetLanguage);
          }
          return;
        }
        
        if (!current[part]) {
          console.log(`[${requestId}] Path part ${part} not found in object, skipping`);
          return;
        }
        
        parent = current;
        lastPart = part;
        current = current[part];
      }

      const finalField = fieldParts[fieldParts.length - 1];
      console.log(`[${requestId}] Processing final field: ${finalField}`);
      
      // Handle wildcards at the final position
      if (finalField === '*' && Array.isArray(current)) {
        console.log(`[${requestId}] Processing wildcard array with ${current.length} items`);
        // Translate all items in the array
        for (let i = 0; i < current.length; i++) {
          if (typeof current[i] === 'string') {
            console.log(`[${requestId}] Translating array item ${i}`);
            try {
              let sourceLang: Language | undefined = undefined;
              
              if (detectSourceLanguage) {
                console.log(`[${requestId}] Detecting source language for item ${i}`);
                sourceLang = await translator.detectLanguage(current[i]);
                console.log(`[${requestId}] Detected language: ${sourceLang}`);
              }
              
              console.log(`[${requestId}] Translating text: "${current[i].substring(0, 30)}..."`);
              const translatedText = await translator.translateText(
                current[i], 
                targetLanguage,
                sourceLang
              );
              console.log(`[${requestId}] Translation result: "${translatedText.substring(0, 30)}..."`);
              
              if (preserveOriginal) {
                console.log(`[${requestId}] Preserving original, storing in ${responseField}`);
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
                console.log(`[${requestId}] Replacing original text`);
                current[i] = translatedText;
              }
            } catch (error) {
              console.error(`[${requestId}] Translation error in array item:`, error);
            }
          } else if (typeof current[i] === 'object' && current[i] !== null) {
            console.log(`[${requestId}] Array item ${i} is an object, creating placeholder`);
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
        console.log(`[${requestId}] Found string at ${fieldPath}: "${current[finalField].substring(0, 30)}..."`);
        try {
          let sourceLang: Language | undefined = undefined;
          
          if (detectSourceLanguage) {
            console.log(`[${requestId}] Detecting source language`);
            sourceLang = await translator.detectLanguage(current[finalField]);
            console.log(`[${requestId}] Detected language: ${sourceLang}`);
          }
          
          console.log(`[${requestId}] Translating to ${targetLanguage}`);
          const translatedText = await translator.translateText(
            current[finalField], 
            targetLanguage,
            sourceLang
          );
          console.log(`[${requestId}] Translation result: "${translatedText.substring(0, 30)}..."`);
          
          if (preserveOriginal) {
            console.log(`[${requestId}] Preserving original, storing in ${responseField}`);
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
            console.log(`[${requestId}] Replacing original text`);
            current[finalField] = translatedText;
          }
        } catch (error) {
          console.error(`[${requestId}] Translation error for field ${fieldPath}:`, error);
        }
      } else {
        console.log(`[${requestId}] Field ${fieldPath} is not a string or doesn't exist, skipping`);
      }
    }

    // Override res.json
    res.json = function(body: any): Response {
      console.log(`[${requestId}] res.json called with body type: ${typeof body}`);
      
      // Handle async translation and then call the original method
      translateResponse(body)
        .then(translatedBody => {
          console.log(`[${requestId}] Translation promise resolved, calling original json method`);
          originalJson.call(res, translatedBody);
          console.log(`[${requestId}] Original json method called`);
        })
        .catch(error => {
          console.error(`[${requestId}] Error in translation middleware:`, error);
          console.log(`[${requestId}] Calling original json method with original body due to error`);
          originalJson.call(res, body);
        });
      
      console.log(`[${requestId}] Returning res from json override`);
      return res;
    };

    // Override res.send
    res.send = function(body: any): Response {
      console.log(`[${requestId}] res.send called with body type: ${typeof body}`);
      
      // Handle async translation and then call the original method
      translateResponse(body)
        .then(translatedBody => {
          console.log(`[${requestId}] Translation promise resolved for send, calling original send method`);
          originalSend.call(res, translatedBody);
          console.log(`[${requestId}] Original send method called`);
        })
        .catch(error => {
          console.error(`[${requestId}] Error in translation middleware send:`, error);
          console.log(`[${requestId}] Calling original send method with original body due to error`);
          originalSend.call(res, body);
        });
      
      console.log(`[${requestId}] Returning res from send override`);
      return res;
    };
    
    // Add a helper method to res for direct translation
    (res as any).translate = async function(text: string): Promise<string> {
      console.log(`[${requestId}] Direct translation helper called`);
      const requestTargetLang = (req.query[langQueryParam] as string) || 
                              req.headers[langHeaderName] || 
                              targetLang;
      
      console.log(`[${requestId}] Target language for direct translation: ${requestTargetLang || 'NONE'}`);
                              
      if (!requestTargetLang) return text;
      
      try {
        console.log(`[${requestId}] Performing direct translation`);
        const result = await translator.translateText(
          text, 
          requestTargetLang as Language
        );
        console.log(`[${requestId}] Direct translation complete`);
        return result;
      } catch (error) {
        console.error(`[${requestId}] Direct translation error:`, error);
        return text;
      }
    };
    
    console.log(`[${requestId}] Middleware setup complete, calling next()`);
    next();
  };
}