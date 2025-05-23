// src/hooks.server.js
import { redirect } from '@sveltejs/kit';

const PROTECTED_ROUTES = ['/','/list']; // Add other routes like /attendees if you create them

export async function handle({ event, resolve }) {
    const sessionToken = event.cookies.get('session_token');
    const url = event.url;

    if (!sessionToken && PROTECTED_ROUTES.includes(url.pathname)) {
        throw redirect(303, '/login');
    }

    if (sessionToken && url.pathname === '/login') {
        throw redirect(303, '/');
    }

    // Make auth status available to pages
    event.locals.isAuthenticated = !!sessionToken;

    const response = await resolve(event);
    return response;
}

export const handle = async ({ event, resolve }) => {
  // Block direct access to +server.js files
  if (event.url.pathname.endsWith('+server.js')) {
    return new Response('Not found', { status: 404 });
  }

  return await resolve(event);
};