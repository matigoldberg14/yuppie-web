// src/pages/api/test.ts
import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ message: 'Test successful' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
