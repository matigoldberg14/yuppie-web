// src/middleware/auth.ts
import type { APIContext } from 'astro';
import { auth } from '../lib/firebase';

export async function authMiddleware({ request }: APIContext) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    await auth.currentUser?.getIdToken();
    return token;
  } catch (error) {
    return new Response('Invalid token', { status: 401 });
  }
}
