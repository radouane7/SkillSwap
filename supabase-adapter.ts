/**
 * Adaptateur pour la conversion entre camelCase et snake_case pour Supabase
 * Ce fichier fournit des fonctions utilitaires pour gérer la conversion de noms
 * entre les modèles TypeScript (camelCase) et la base de données Supabase (snake_case)
 */

/**
 * Convertit une chaîne de caractères de camelCase vers snake_case
 * @param str Chaîne en camelCase
 * @returns La chaîne convertie en snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convertit une chaîne de caractères de snake_case vers camelCase
 * @param str Chaîne en snake_case
 * @returns La chaîne convertie en camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convertit un objet avec des propriétés en camelCase vers un objet avec des propriétés en snake_case
 * @param obj Objet avec des propriétés en camelCase
 * @returns Objet avec des propriétés en snake_case
 */
export function objectToDB(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const snakeKey = toSnakeCase(key);
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[snakeKey] = objectToDB(value);
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map(item => 
          typeof item === 'object' && item !== null ? objectToDB(item) : item
        );
      } else {
        result[snakeKey] = value;
      }
    }
  }
  
  return result;
}

/**
 * Convertit un objet avec des propriétés en snake_case vers un objet avec des propriétés en camelCase
 * @param obj Objet avec des propriétés en snake_case
 * @returns Objet avec des propriétés en camelCase
 */
export function objectFromDB(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const camelKey = toCamelCase(key);
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[camelKey] = objectFromDB(value);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map(item => 
          typeof item === 'object' && item !== null ? objectFromDB(item) : item
        );
      } else {
        result[camelKey] = value;
      }
    }
  }
  
  return result;
}

/**
 * Convertit un tableau d'objets de snake_case vers camelCase
 * @param array Tableau d'objets avec des propriétés en snake_case
 * @returns Tableau d'objets avec des propriétés en camelCase
 */
export function arrayFromDB<T>(array: Record<string, any>[]): T[] {
  return array.map(item => objectFromDB(item) as T);
}