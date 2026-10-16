import type { Gist, GistFilter } from './types/gist.js';

const SEARCH_THRESHOLD = 100_000;

export function filterGists(
	gists: Gist[],
	filter: GistFilter,
	starredIds: Set<string>,
	ownedIds: Set<string>
): Gist[] {
	return gists.filter((g) => {
		if (filter === 'public') return ownedIds.has(g.id) && g.public;
		if (filter === 'secret') return ownedIds.has(g.id) && !g.public;
		if (filter === 'starred') return starredIds.has(g.id);
		return ownedIds.has(g.id);
	});
}

export function searchGists(gists: Gist[], query: string): Gist[] {
	if (!query.trim()) return gists;
	const q = query.toLowerCase().trim();

	return gists.filter((g) => {
		if (g.description && g.description.toLowerCase().includes(q)) {
			return true;
		}

		for (const [filename, file] of Object.entries(g.files)) {
			if (filename.toLowerCase().includes(q)) return true;
			if (file.language && file.language.toLowerCase().includes(q)) return true;

			if (file.content && file.size < SEARCH_THRESHOLD) {
				if (file.content.toLowerCase().includes(q)) return true;
			}
		}

		return false;
	});
}

export function sortGists(gists: Gist[], sortBy: 'updated' | 'created' | 'name'): Gist[] {
	const sorted = [...gists];
	switch (sortBy) {
		case 'updated':
			return sorted.sort(
				(a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
			);
		case 'created':
			return sorted.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		case 'name':
			return sorted.sort((a, b) => {
				const nameA = getPrimaryFilename(a).toLowerCase();
				const nameB = getPrimaryFilename(b).toLowerCase();
				return nameA.localeCompare(nameB);
			});
		default:
			return sorted;
	}
}

export function getPrimaryFilename(gist: Gist): string {
	const filenames = Object.keys(gist.files);
	if (filenames.length === 0) return 'Untitled';
	return filenames[0];
}

export function getPrimaryLanguage(gist: Gist): string | null {
	for (const file of Object.values(gist.files)) {
		if (file.language) return file.language;
	}
	return null;
}

export function getFileCount(gist: Gist): number {
	return Object.keys(gist.files).length;
}

export function getTotalSize(gist: Gist): number {
	return Object.values(gist.files).reduce((acc, f) => acc + (f.size || 0), 0);
}

export function formatDate(isoString: string): string {
	try {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHours = Math.floor(diffMin / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffSec < 60) return 'just now';
		if (diffMin < 60) return `${diffMin}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	} catch {
		return isoString;
	}
}

export function formatDateFull(isoString: string): string {
	try {
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch {
		return isoString;
	}
}

export function formatSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const LANGUAGE_COLORS: Record<string, string> = {
	JavaScript: '#f1e05a',
	TypeScript: '#3178c6',
	Python: '#3572A5',
	HTML: '#e34c26',
	CSS: '#563d7c',
	SCSS: '#c6538c',
	JSON: '#292929',
	Markdown: '#083fa1',
	Go: '#00ADD8',
	Rust: '#dea584',
	Ruby: '#701516',
	PHP: '#4F5D95',
	Java: '#b07219',
	C: '#555555',
	'C++': '#f34b7d',
	'C#': '#178600',
	Swift: '#F05138',
	Kotlin: '#A97BFF',
	Shell: '#89e051',
	Bash: '#89e051',
	Svelte: '#ff3e00',
	Vue: '#41b883',
	React: '#61dafb',
	SQL: '#e38c00',
	YAML: '#cb171e',
	Dockerfile: '#384d54',
	GraphQL: '#e10098'
};

export function getLanguageColor(language: string | null): string {
	if (!language) return '#8b949e';
	return LANGUAGE_COLORS[language] || '#8b949e';
}

export function getLanguageLabel(language: string | null, filename: string): string {
	if (language) return language;

	const ext = filename.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'js':
		case 'mjs':
		case 'cjs':
			return 'JavaScript';
		case 'ts':
		case 'mts':
			return 'TypeScript';
		case 'py':
			return 'Python';
		case 'md':
			return 'Markdown';
		case 'json':
			return 'JSON';
		case 'html':
			return 'HTML';
		case 'css':
			return 'CSS';
		case 'sh':
		case 'bash':
			return 'Shell';
		case 'yml':
		case 'yaml':
			return 'YAML';
		case 'svelte':
			return 'Svelte';
		case 'go':
			return 'Go';
		case 'rs':
			return 'Rust';
		case 'sql':
			return 'SQL';
		default:
			return 'Text';
	}
}
