export const prerender = false;
export const ssr = false;

export async function load({ locals }) {
    return {
        isAuthenticated: locals.isAuthenticated
    };
}