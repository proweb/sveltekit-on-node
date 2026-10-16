import { describe, it, expect } from 'vitest';
import {
	formatSize,
	getLanguageLabel,
	getLanguageColor,
	filterGists,
	searchGists,
	sortGists
} from './gist-utils.js';
import type { Gist } from './types/gist.js';

const mockGist = (
	id: string,
	description: string,
	isPublic: boolean,
	filename: string,
	created_at = '2026-01-01T10:00:00Z',
	updated_at = '2026-01-02T10:00:00Z'
): Gist => ({
	id,
	description,
	public: isPublic,
	created_at,
	updated_at,
	files: {
		[filename]: {
			filename,
			language: filename.endsWith('.ts') ? 'TypeScript' : 'JavaScript',
			raw_url: 'https://example.com',
			size: 100,
			content: 'console.log("hello world");'
		}
	},
	owner: { login: 'user1', avatar_url: '', html_url: '' },
	comments: 0,
	html_url: '',
	git_pull_url: '',
	git_push_url: ''
});

describe('Gist Utils', () => {
	it('formats size correctly', () => {
		expect(formatSize(0)).toBe('0 B');
		expect(formatSize(500)).toBe('500 B');
		expect(formatSize(2048)).toBe('2.0 KB');
	});

	it('detects language label and color', () => {
		expect(getLanguageLabel('TypeScript', 'app.ts')).toBe('TypeScript');
		expect(getLanguageLabel(null, 'script.py')).toBe('Python');
		expect(getLanguageColor('TypeScript')).toBe('#3178c6');
	});

	it('filters gists correctly', () => {
		const g1 = mockGist('1', 'Public gist', true, 'file1.js');
		const g2 = mockGist('2', 'Secret gist', false, 'file2.js');
		const gists = [g1, g2];
		const owned = new Set(['1', '2']);
		const starred = new Set(['2']);

		expect(filterGists(gists, 'all', starred, owned)).toHaveLength(2);
		expect(filterGists(gists, 'public', starred, owned)).toHaveLength(1);
		expect(filterGists(gists, 'secret', starred, owned)).toHaveLength(1);
		expect(filterGists(gists, 'starred', starred, owned)).toHaveLength(1);
	});

	it('searches gists by query', () => {
		const g1 = mockGist('1', 'Awesome feature', true, 'file1.js');
		const g2 = mockGist('2', 'Bug fix', false, 'test.ts');
		const gists = [g1, g2];

		expect(searchGists(gists, 'Awesome')).toEqual([g1]);
		expect(searchGists(gists, 'hello')).toHaveLength(2);
	});

	it('sorts gists correctly', () => {
		const g1 = mockGist('1', 'B', true, 'b.js', '2026-01-01', '2026-01-05');
		const g2 = mockGist('2', 'A', true, 'a.js', '2026-01-02', '2026-01-04');

		const byUpdated = sortGists([g2, g1], 'updated');
		expect(byUpdated[0].id).toBe('1');

		const byCreated = sortGists([g1, g2], 'created');
		expect(byCreated[0].id).toBe('2');

		const byName = sortGists([g1, g2], 'name');
		expect(byName[0].id).toBe('2');
	});
});
