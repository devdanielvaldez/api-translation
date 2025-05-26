import { Language } from '../types/languages';

/**
 * Options for formatting translated responses
 */
export interface FormatOptions {
  /** Whether to add translation metadata to response */
  includeMetadata?: boolean;
  /** Name of the field to store metadata */
  metadataField?: string;
  /** Prefix to add to translated field names */
  translatedFieldPrefix?: string;
  /** Suffix to add to translated field names */
  translatedFieldSuffix?: string;
  /** Whether to capitalize the first letter of translated text */
  capitalizeFirst?: boolean;
  /** Whether to trim whitespace from translated text */
  trim?: boolean;
}

/**
 * Utility class for formatting translated API responses
 */
export class ResponseFormatter {
  private options: FormatOptions;

  /**
   * Create a new response formatter
   * 
   * @param options - Formatter configuration options
   */
  constructor(options: FormatOptions = {}) {
    this.options = {
      includeMetadata: false,
      metadataField: 'translationInfo',
      translatedFieldPrefix: '',
      translatedFieldSuffix: '',
      capitalizeFirst: true,
      trim: true,
      ...options
    };
  }

  /**
   * Format a translated field value
   * 
   * @param value - The translated text
   * @returns Formatted translated text
   */
  formatValue(value: string): string {
    if (typeof value !== 'string') return value;

    let result = value;
    
    // Trim whitespace if enabled
    if (this.options.trim) {
      result = result.trim();
    }
    
    // Capitalize first letter if enabled
    if (this.options.capitalizeFirst && result.length > 0) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    return result;
  }

  /**
   * Format field name for translated content
   * 
   * @param fieldName - Original field name
   * @returns Formatted field name
   */
  formatFieldName(fieldName: string): string {
    const { translatedFieldPrefix, translatedFieldSuffix } = this.options;
    return `${translatedFieldPrefix || ''}${fieldName}${translatedFieldSuffix || ''}`;
  }

  /**
   * Add translation metadata to response
   * 
   * @param response - Response object
   * @param sourceLang - Source language
   * @param targetLang - Target language
   * @param translatedFields - Names of fields that were translated
   * @returns Response with added metadata
   */
  addMetadata(
    response: Record<string, any>,
    sourceLang: Language,
    targetLang: Language,
    translatedFields: string[]
  ): Record<string, any> {
    if (!this.options.includeMetadata) {
      return response;
    }
    
    const result = { ...response };
    const metadataField = this.options.metadataField || 'translationInfo';
    
    result[metadataField] = {
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      translatedFields,
      translatedAt: new Date().toISOString()
    };
    
    return result;
  }

  /**
   * Format a complete response object with translations
   * 
   * @param original - Original response
   * @param translations - Object with translated fields
   * @param sourceLang - Source language
   * @param targetLang - Target language
   * @param preserveOriginal - Whether to keep original fields
   * @returns Formatted response
   */
  formatResponse(
    original: Record<string, any>,
    translations: Record<string, string>,
    sourceLang: Language,
    targetLang: Language,
    preserveOriginal = true
  ): Record<string, any> {
    const result = preserveOriginal ? { ...original } : {};
    const translatedFields: string[] = [];
    
    // Add each translated field
    for (const [field, translation] of Object.entries(translations)) {
      // Format the value
      const formattedValue = this.formatValue(translation);
      
      if (preserveOriginal) {
        // When preserving original, use formatted field name
        const translatedFieldName = this.formatFieldName(field);
        result[translatedFieldName] = formattedValue;
      } else {
        // When not preserving original, replace the field directly
        result[field] = formattedValue;
      }
      
      translatedFields.push(field);
    }
    
    // Add metadata if enabled
    return this.addMetadata(result, sourceLang, targetLang, translatedFields);
  }

  /**
   * Format nested object response with translations
   * 
   * @param original - Original object
   * @param translations - Map of paths to translated values
   * @param sourceLang - Source language
   * @param targetLang - Target language
   * @param preserveOriginal - Whether to keep original fields
   * @returns Formatted response with nested translations
   */
  formatNestedResponse(
    original: Record<string, any>,
    translations: Map<string, string>,
    sourceLang: Language,
    targetLang: Language,
    preserveOriginal = true
  ): Record<string, any> {
    const result = preserveOriginal ? { ...original } : {};
    const translatedFields: string[] = [];
    
    // Process each translation
    for (const [path, translation] of translations.entries()) {
      const pathParts = path.split('.');
      const formattedValue = this.formatValue(translation);
      
      if (preserveOriginal) {
        // Create the translated field path
        const lastPart = pathParts[pathParts.length - 1];
        const translatedLastPart = this.formatFieldName(lastPart);
        const translatedPath = [...pathParts.slice(0, -1), translatedLastPart].join('.');
        
        // Set the translated value at the new path
        this.setNestedValue(result, translatedPath, formattedValue);
      } else {
        // Replace the original value
        this.setNestedValue(result, path, formattedValue);
      }
      
      translatedFields.push(path);
    }
    
    // Add metadata if enabled
    return this.addMetadata(result, sourceLang, targetLang, translatedFields);
  }

  /**
   * Set a value at a nested path in an object
   * 
   * @param obj - Target object
   * @param path - Dot-notation path
   * @param value - Value to set
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    
    // Traverse the path, creating objects as needed
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value at the final path segment
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  /**
   * Update formatter options
   * 
   * @param options - New options to apply
   */
  updateOptions(options: Partial<FormatOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
  }
}

/**
 * Create a formatter with default options
 */
export function createFormatter(options?: FormatOptions): ResponseFormatter {
  return new ResponseFormatter(options);
}