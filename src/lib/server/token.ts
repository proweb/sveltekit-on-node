import fs from 'node:fs';
import path from 'node:path';

const TOKEN_FILE_PATH = path.resolve(process.cwd(), '.gist-token.json');

interface TokenData {
	token: string;
	updatedAt: string;
}

export function loadServerToken(): string | null {
	try {
		if (!fs.existsSync(TOKEN_FILE_PATH)) {
			return null;
		}
		const raw = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
		const data: TokenData = JSON.parse(raw);
		return data.token || null;
	} catch {
		return null;
	}
}

export function saveServerToken(token: string): void {
	try {
		const data: TokenData = {
			token,
			updatedAt: new Date().toISOString()
		};
		fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
	} catch (err) {
		console.error('Failed to save server token:', err);
		throw new Error('Не удалось сохранить токен на сервере', { cause: err });
	}
}

export function clearServerToken(): void {
	try {
		if (fs.existsSync(TOKEN_FILE_PATH)) {
			fs.unlinkSync(TOKEN_FILE_PATH);
		}
	} catch (err) {
		console.error('Failed to clear server token:', err);
	}
}
