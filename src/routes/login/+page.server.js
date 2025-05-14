// src/routes/login/+page.server.js
import { hashPassword } from '$lib/server/authUtils.js';
import { VITE_APP_PASSWORD_HASH } from '$env/static/private'; // Use static/private for server-side only env vars
import { fail, redirect } from '@sveltejs/kit';

// In-memory store for rate limiting (for simplicity, persist if needed e.g. Redis or Firestore)
const loginAttempts = new Map(); // Map: ip -> { count: number, lockoutUntil: timestamp }
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export const actions = {
    default: async ({ request, cookies, getClientAddress }) => {
        const clientIp = getClientAddress();
        const attemptInfo = loginAttempts.get(clientIp) || { count: 0, lockoutUntil: 0 };

        if (attemptInfo.lockoutUntil > Date.now()) {
            return fail(429, {
                error: `Too many attempts. Try again in ${Math.ceil((attemptInfo.lockoutUntil - Date.now()) / 60000)} minutes.`,
                lockedOut: true,
                lockoutTime: attemptInfo.lockoutUntil - Date.now()
            });
        }

        const data = await request.formData();
        const password = data.get('password');

        if (!password || typeof password !== 'string') {
            return fail(400, { error: 'Password is required.' });
        }

        const hashedInput = hashPassword(password);

        if (hashedInput === VITE_APP_PASSWORD_HASH) {
            loginAttempts.delete(clientIp); // Reset attempts on success
            cookies.set('session_token', 'hardcoded_user_session', { // Replace with a secure, random token
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            throw redirect(303, '/'); // Redirect to main app page
        } else {
            attemptInfo.count++;
            if (attemptInfo.count >= MAX_ATTEMPTS) {
                attemptInfo.lockoutUntil = Date.now() + LOCKOUT_DURATION;
                attemptInfo.count = 0; // Reset count after lockout is set
            }
            loginAttempts.set(clientIp, attemptInfo);

            return fail(401, { error: 'Invalid password.' });
        }
    }
};

// Load function to check if already logged in
export async function load({ cookies }) {
    if (cookies.get('session_token')) {
        throw redirect(303, '/');
    }
    return {};
}