import { stripEmojis } from '../misc.js';

export function cleanUsername(username: string) {
	return stripEmojis(username).replace(/[@|*]/g, '').substring(0, 32);
}
