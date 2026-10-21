import { browser } from '$app/env';

// The GitHub token lives in localStorage: the app is a static build with no server session, and
// the token is sent straight to api.github.com in an Authorization header. Anything with script
// access to this origin can read it, which is the accepted trade-off for a personal tool.
const TOKEN_KEY = 'github_token';

export function loadToken(): string | null {
	if (!browser) return null;
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function saveToken(token: string): void {
	if (!browser) return;
	try {
		localStorage.setItem(TOKEN_KEY, token);
	} catch {
		// Private mode or a full quota: the session just will not persist across reloads.
	}
}

export function clearToken(): void {
	if (!browser) return;
	try {
		localStorage.removeItem(TOKEN_KEY);
	} catch {
		// Nothing useful to do.
	}
}
