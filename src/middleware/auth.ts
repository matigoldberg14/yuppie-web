import { auth } from '../lib/firebase';
import type { APIContext } from 'astro';

export async function protectRoute(context: APIContext) {
  const user = auth.currentUser;

  if (!user) {
    return context.redirect('/login');
  }
}
