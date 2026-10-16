import type { Gist, GitHubUser, CreateGistPayload, UpdateGistPayload } from '../types/gist.js';

const API_BASE = 'https://api.github.com';

function headers(token: string): HeadersInit {
	return {
		Authorization: `Bearer ${token}`,
		Accept: 'application/vnd.github.v3+json',
		'X-GitHub-Api-Version': '2022-11-28'
	};
}

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		let message = `GitHub API error (${res.status})`;
		try {
			const body = await res.json();
			if (body.message) message = body.message;
		} catch {
			// ignore JSON error
		}
		throw new Error(message);
	}
	if (res.status === 204) {
		return {} as T;
	}
	return res.json();
}

export async function fetchAuthenticatedUser(token: string): Promise<GitHubUser> {
	const res = await fetch(`${API_BASE}/user`, {
		headers: headers(token)
	});
	return handleResponse<GitHubUser>(res);
}

export async function fetchUserGists(token: string, username: string): Promise<Gist[]> {
	const allGists: Gist[] = [];
	let page = 1;

	while (page <= 5) {
		const res = await fetch(`${API_BASE}/users/${username}/gists?per_page=100&page=${page}`, {
			headers: headers(token)
		});
		const data = await handleResponse<Gist[]>(res);
		if (!Array.isArray(data) || data.length === 0) break;
		allGists.push(...data);
		if (data.length < 100) break;
		page++;
	}

	return allGists;
}

export async function fetchStarredGists(token: string): Promise<Gist[]> {
	const allStarred: Gist[] = [];
	let page = 1;

	while (page <= 5) {
		const res = await fetch(`${API_BASE}/gists/starred?per_page=100&page=${page}`, {
			headers: headers(token)
		});
		if (!res.ok) break;
		const data = await res.json();
		if (!Array.isArray(data) || data.length === 0) break;
		allStarred.push(...data);
		if (data.length < 100) break;
		page++;
	}

	return allStarred;
}

export async function fetchGist(token: string, id: string): Promise<Gist> {
	const res = await fetch(`${API_BASE}/gists/${id}`, {
		headers: headers(token)
	});
	return handleResponse<Gist>(res);
}

export async function checkIsStarred(token: string, id: string): Promise<boolean> {
	const res = await fetch(`${API_BASE}/gists/${id}/star`, {
		headers: headers(token)
	});
	return res.status === 204;
}

export async function starGist(token: string, id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/gists/${id}/star`, {
		method: 'PUT',
		headers: {
			...headers(token),
			'Content-Length': '0'
		}
	});
	if (!res.ok && res.status !== 204) {
		throw new Error(`Failed to star gist (${res.status})`);
	}
}

export async function unstarGist(token: string, id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/gists/${id}/star`, {
		method: 'DELETE',
		headers: headers(token)
	});
	if (!res.ok && res.status !== 204) {
		throw new Error(`Failed to unstar gist (${res.status})`);
	}
}

export async function createGist(token: string, payload: CreateGistPayload): Promise<Gist> {
	const res = await fetch(`${API_BASE}/gists`, {
		method: 'POST',
		headers: {
			...headers(token),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	return handleResponse<Gist>(res);
}

export async function updateGist(
	token: string,
	id: string,
	payload: UpdateGistPayload
): Promise<Gist> {
	const res = await fetch(`${API_BASE}/gists/${id}`, {
		method: 'PATCH',
		headers: {
			...headers(token),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	return handleResponse<Gist>(res);
}

export async function deleteGist(token: string, id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/gists/${id}`, {
		method: 'DELETE',
		headers: headers(token)
	});
	if (!res.ok && res.status !== 204) {
		throw new Error(`Failed to delete gist (${res.status})`);
	}
}
