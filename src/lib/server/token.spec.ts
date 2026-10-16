import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadServerToken, saveServerToken, clearServerToken } from './token.js';

const TOKEN_FILE_PATH = path.resolve(process.cwd(), '.gist-token.json');

describe('Server Token Storage', () => {
	let originalContent: string | null = null;

	beforeEach(() => {
		if (fs.existsSync(TOKEN_FILE_PATH)) {
			originalContent = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
			fs.unlinkSync(TOKEN_FILE_PATH);
		} else {
			originalContent = null;
		}
	});

	afterEach(() => {
		if (originalContent !== null) {
			fs.writeFileSync(TOKEN_FILE_PATH, originalContent, 'utf-8');
		} else if (fs.existsSync(TOKEN_FILE_PATH)) {
			fs.unlinkSync(TOKEN_FILE_PATH);
		}
	});

	it('returns null when no token file exists', () => {
		expect(loadServerToken()).toBeNull();
	});

	it('saves and loads a server token successfully', () => {
		saveServerToken('ghp_test12345');
		expect(loadServerToken()).toBe('ghp_test12345');
	});

	it('clears the server token successfully', () => {
		saveServerToken('ghp_test12345');
		clearServerToken();
		expect(loadServerToken()).toBeNull();
	});
});
