// /Users/Mati/Desktop/yuppie-web/src/lib/encryption.ts
import CryptoJS from 'crypto-js';

// Asegurarnos de que SECRET_KEY exista y sea válida
const SECRET_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY ||
  'fallback-security-key-please-set-env-var';

/**
 * Encripta datos con AES
 * @param data Datos a encriptar
 * @returns String encriptado
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Error encrypting data');
  }
};

/**
 * Desencripta datos con AES
 * @param encryptedData String encriptado
 * @returns Objeto desencriptado
 */
export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Error decrypting data');
  }
};

// Ejemplo de uso para datos sensibles en localStorage
export const securePersist = {
  set: (key: string, data: any) => {
    const encrypted = encryptData(data);
    localStorage.setItem(key, encrypted);
  },

  get: (key: string) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decryptData(encrypted);
  },

  remove: (key: string) => {
    localStorage.removeItem(key);
  },
};

/**
 * Función para cifrar IDs específicamente para uso en URLs
 * Mejorada con mejor manejo de errores y validación de entrada
 * @param id ID a encriptar
 * @returns ID encriptado seguro para URL
 */
export const encryptId = (id: string): string => {
  if (!id || typeof id !== 'string') {
    console.error('encryptId: ID no válido', id);
    return '';
  }

  try {
    // Asegurar que el ID esté limpio
    const cleanId = id.trim();

    // Verificar que hay algo que encriptar
    if (!cleanId) {
      console.warn('encryptId: ID está vacío después de limpiarlo');
      return '';
    }

    // Encriptar
    const encrypted = CryptoJS.AES.encrypt(cleanId, SECRET_KEY).toString();

    // Hacemos la URL segura reemplazando caracteres prohibidos
    const urlSafe = encrypted
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return urlSafe;
  } catch (error) {
    console.error('Error encrypting ID:', error);
    throw new Error(
      `Error al encriptar ID: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
};

/**
 * Función para descifrar IDs de URLs
 * Mejorada con mejor manejo de errores y validación de entrada
 * @param encryptedId ID encriptado
 * @returns ID original desencriptado
 */
export const decryptId = (encryptedId: string): string => {
  if (!encryptedId || typeof encryptedId !== 'string') {
    console.error('decryptId: ID encriptado no válido', encryptedId);
    return '';
  }

  try {
    // Restauramos los caracteres originales
    let safeForDecryption = encryptedId.replace(/-/g, '+').replace(/_/g, '/');

    // Añadimos padding = si es necesario
    while (safeForDecryption.length % 4 !== 0) {
      safeForDecryption += '=';
    }

    // Verificar que hay algo que desencriptar después de la limpieza
    if (!safeForDecryption) {
      console.warn('decryptId: ID está vacío después de prepararlo');
      return '';
    }

    // Desencriptar
    const bytes = CryptoJS.AES.decrypt(safeForDecryption, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      console.warn('decryptId: El resultado desencriptado está vacío');
      return '';
    }

    return decrypted;
  } catch (error) {
    console.error('Error decrypting ID:', error);
    throw new Error(
      `Error al desencriptar ID: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
};
