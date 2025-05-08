// src/middleware/auth.ts
import { defineMiddleware } from 'astro/middleware';
import { auth } from '../lib/firebase';
import type { Auth } from 'firebase/auth';

export const authMiddleware = defineMiddleware(async ({ request }) => {
  if (request.url.includes('/dashboard')) {
    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }

      const currentUser = (auth as Auth).currentUser;

      if (!currentUser) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/login',
          },
        });
      }
    } catch (error) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/login',
        },
      });
    }
  }

  return new Response();
});
