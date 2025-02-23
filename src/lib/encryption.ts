// src/utils/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Error encrypting data');
  }
};

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
