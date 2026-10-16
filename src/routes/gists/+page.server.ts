import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';
import { loadServerToken, saveServerToken, clearServerToken } from '../../lib/server/token.js';
import {
	fetchAuthenticatedUser,
	fetchUserGists,
	fetchStarredGists,
	starGist,
	unstarGist,
	createGist,
	updateGist,
	deleteGist,
	fetchGist
} from '../../lib/server/github.js';
import type { Gist, GitHubUser } from '../../lib/types/gist.js';

export const load: PageServerLoad = async () => {
	const token = loadServerToken();

	if (!token) {
		return {
			authenticated: false,
			user: null as GitHubUser | null,
			gists: [] as Gist[],
			starredGistIds: [] as string[]
		};
	}

	try {
		const user = await fetchAuthenticatedUser(token);
		const [gists, starred] = await Promise.all([
			fetchUserGists(token, user.login),
			fetchStarredGists(token)
		]);

		const starredGistIds = starred.map((g: Gist) => g.id);

		return {
			authenticated: true,
			user,
			gists,
			starredGistIds
		};
	} catch (err) {
		console.error('Error loading GitHub data with stored token:', err);
		clearServerToken();
		return {
			authenticated: false,
			user: null,
			gists: [],
			starredGistIds: [],
			error: err instanceof Error ? err.message : 'Invalid or expired GitHub token'
		};
	}
};

export const actions: Actions = {
	login: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token')?.toString().trim();

		if (!token) {
			return fail(400, { error: 'Пожалуйста, введите Personal Access Token' });
		}

		try {
			await fetchAuthenticatedUser(token);
			saveServerToken(token);
			return { success: true };
		} catch (err) {
			return fail(401, {
				error: `Ошибка авторизации: ${err instanceof Error ? err.message : 'Неверный токен'}`
			});
		}
	},

	logout: async () => {
		clearServerToken();
		return { success: true };
	},

	starToggle: async ({ request }) => {
		const token = loadServerToken();
		if (!token) return fail(401, { error: 'Не авторизован' });

		const formData = await request.formData();
		const gistId = formData.get('gistId')?.toString();
		const isStarred = formData.get('isStarred')?.toString() === 'true';

		if (!gistId) return fail(400, { error: 'Missing gistId' });

		try {
			if (isStarred) {
				await unstarGist(token, gistId);
			} else {
				await starGist(token, gistId);
			}
			return { success: true, gistId, newStarredState: !isStarred };
		} catch (err) {
			return fail(500, { error: err instanceof Error ? err.message : 'Failed to toggle star' });
		}
	},

	createGist: async ({ request }) => {
		const token = loadServerToken();
		if (!token) return fail(401, { error: 'Не авторизован' });

		const formData = await request.formData();
		const description = formData.get('description')?.toString() || '';
		const isPublic = formData.get('isPublic')?.toString() === 'true';
		const filesRaw = formData.get('files')?.toString();

		if (!filesRaw) return fail(400, { error: 'Files are required' });

		try {
			const files: Array<{ filename: string; content: string }> = JSON.parse(filesRaw);
			const fileMap: Record<string, { content: string }> = {};

			for (const f of files) {
				const name = f.filename.trim();
				if (name) {
					fileMap[name] = { content: f.content };
				}
			}

			if (Object.keys(fileMap).length === 0) {
				return fail(400, { error: 'Укажите хотя бы один файл с именем' });
			}

			const created = await createGist(token, {
				description,
				public: isPublic,
				files: fileMap
			});

			const full = await fetchGist(token, created.id);
			return { success: true, gist: full };
		} catch (err) {
			return fail(500, {
				error: `Не удалось создать Gist: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},

	updateGist: async ({ request }) => {
		const token = loadServerToken();
		if (!token) return fail(401, { error: 'Не авторизован' });

		const formData = await request.formData();
		const gistId = formData.get('gistId')?.toString();
		const description = formData.get('description')?.toString() || '';
		const filesRaw = formData.get('files')?.toString();
		const originalFilenamesRaw = formData.get('originalFilenames')?.toString();

		if (!gistId || !filesRaw) return fail(400, { error: 'Missing parameters' });

		try {
			const files: Array<{ filename: string; content: string }> = JSON.parse(filesRaw);
			const originalFilenames: string[] = originalFilenamesRaw
				? JSON.parse(originalFilenamesRaw)
				: [];

			const filePayload: Record<string, { content?: string; filename?: string } | null> = {};

			for (const f of files) {
				const trimmedName = f.filename.trim();
				if (trimmedName) {
					filePayload[trimmedName] = { content: f.content };
				}
			}

			for (const origName of originalFilenames) {
				if (!files.some((f) => f.filename.trim() === origName)) {
					filePayload[origName] = null;
				}
			}

			const updated = await updateGist(token, gistId, {
				description,
				files: filePayload
			});

			const full = await fetchGist(token, updated.id);
			return { success: true, gist: full };
		} catch (err) {
			return fail(500, {
				error: `Не удалось обновить Gist: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},

	deleteGist: async ({ request }) => {
		const token = loadServerToken();
		if (!token) return fail(401, { error: 'Не авторизован' });

		const formData = await request.formData();
		const gistId = formData.get('gistId')?.toString();

		if (!gistId) return fail(400, { error: 'Missing gistId' });

		try {
			await deleteGist(token, gistId);
			return { success: true, gistId };
		} catch (err) {
			return fail(500, {
				error: `Не удалось удалить Gist: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	}
};
