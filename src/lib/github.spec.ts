import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGist, deleteGist, fetchAuthenticatedUser, fetchGist, starGist } from './github.js';

function stubFetch(response: Response) {
	const spy = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', spy);
	return spy;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('github client', () => {
	it('requests the authenticated user from api.github.com', async () => {
		const spy = stubFetch(Response.json({ login: 'octocat' }));

		const user = await fetchAuthenticatedUser('tok');

		expect(user.login).toBe('octocat');
		const [url, init] = spy.mock.calls[0];
		expect(url).toBe('https://api.github.com/user');
		expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer tok');
	});

	it('creates a gist with a JSON body', async () => {
		const spy = stubFetch(Response.json({ id: '1' }));

		await createGist('tok', {
			description: 'd',
			public: false,
			files: { 'a.md': { content: 'x' } }
		});

		const [url, init] = spy.mock.calls[0];
		expect(url).toBe('https://api.github.com/gists');
		expect(init?.method).toBe('POST');
		expect(JSON.parse(String(init?.body))).toEqual({
			description: 'd',
			public: false,
			files: { 'a.md': { content: 'x' } }
		});
	});

	it('fetches a single gist, which is where the file content lives', async () => {
		const spy = stubFetch(Response.json({ id: '1', files: {} }));

		await fetchGist('tok', '1');

		const [url] = spy.mock.calls[0];
		expect(url).toBe('https://api.github.com/gists/1');
	});

	it('accepts an empty 204 body for deletes and stars', async () => {
		const spy = stubFetch(new Response(null, { status: 204 }));

		await expect(deleteGist('tok', '1')).resolves.toBeUndefined();
		await expect(starGist('tok', '1')).resolves.toBeUndefined();
		expect(spy).toHaveBeenCalledTimes(2);
	});

	it('surfaces the GitHub error message', async () => {
		stubFetch(Response.json({ message: 'Bad credentials' }, { status: 401 }));

		await expect(fetchAuthenticatedUser('bad')).rejects.toThrow('Bad credentials');
	});
});
