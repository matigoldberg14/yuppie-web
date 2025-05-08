// src/services/userService.ts
import { API_CONFIG } from './api';
import { auth } from '../lib/firebase';

// Función para verificar si un usuario existe y, si no, crearlo
export async function verifyOrCreateUser() {
  try {
    if (!auth?.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await auth.currentUser.getIdToken();

    // Logs adicionales para depuración
    console.log('Verificando usuario en Strapi:', auth.currentUser.email);

    // Endpoint que verifica si el usuario existe y lo crea si no
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/verify-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email: auth.currentUser.email,
        displayName:
          auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
        firebaseUID: auth.currentUser.uid,
      }),
    });

    // Log de la respuesta completa
    console.log('Respuesta de verificación:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en verificación de usuario:', errorData);
      throw new Error(errorData.error?.message || 'Error verificando usuario');
    }

    const data = await response.json();
    console.log('Usuario verificado/creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error en verifyOrCreateUser:', error);
    throw error;
  }
}
