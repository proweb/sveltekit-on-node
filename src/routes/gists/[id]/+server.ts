import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { fetchGist } from '../../../lib/server/github.js';
import { loadServerToken } from '../../../lib/server/token.js';

// The gist list endpoint omits file content, so the detail and edit views fetch the full gist
// through the server, which is the only side holding the token.
export const GET: RequestHandler = async ({ params }) => {
	const token = loadServerToken();
	if (!token) error(401, 'Не авторизован');

	try {
		return json(await fetchGist(token, params.id));
	} catch (err) {
		error(502, err instanceof Error ? err.message : 'Не удалось загрузить Gist');
	}
};
