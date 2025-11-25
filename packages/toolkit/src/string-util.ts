import { notEmpty } from './util/typeChecking.js';

export function cleanString(str: string): string {
	return str.replace(/[^0-9a-zA-Z+]/gi, '').toUpperCase();
}

export function stringMatches(str: string | number = '', str2: string | number = ''): boolean {
	return cleanString(str.toString()) === cleanString(str2.toString());
}

export function replaceWhitespaceAndUppercase(str: string): string {
	return str.replace(/\s/g, '').toUpperCase();
}

export function toTitleCase(str: string): string {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

export function truncateString(str: string, maxLen: number): string {
	if (str.length < maxLen) return str;
	return `${str.slice(0, maxLen - 3)}...`;
}

const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function miniID(length: number): string {
	let id = '';

	for (let i = 0; i < length; i++) {
		const randomChar = validChars[Math.floor(Math.random() * validChars.length)];

		id += randomChar;
	}

	return id;
}

export function stringSearch(
	queryString: string,
	searchSpace: string | string[] | { name: string; alias?: string[]; aliases?: string[] }
): boolean {
	if (typeof searchSpace === 'string') {
		return searchSpace.toLowerCase().includes(queryString.toLowerCase());
	}

	if (Array.isArray(searchSpace)) {
		return searchSpace.some(i => i.toLowerCase().includes(queryString.toLowerCase()));
	}

	if (searchSpace.name.toLowerCase().includes(queryString.toLowerCase())) return true;
	if (searchSpace.aliases) {
		return searchSpace.aliases.some(alias => alias.toLowerCase().includes(queryString.toLowerCase()));
	}

	if (searchSpace.alias) {
		return searchSpace.alias.some(alias => alias.toLowerCase().includes(queryString.toLowerCase()));
	}

	return false;
}

export function ellipsize(str: string, maxLen = 2000): string {
	if (str.length > maxLen) {
		return `${str.substring(0, maxLen - 3)}...`;
	}
	return str;
}

const wordBlacklistBase64 =
	'YXNzDQpzaGl0DQpiaXRjaA0KYm9vYnMNCnRpdHMNCmJhbGxzYWNrDQpiYncNCmJkc20NCmJhc3RhcmQNCmJpbWJvDQpjb2NrDQpkaWNrDQpjbGl0DQpibG93am9iDQpib2xsb2NrDQpib25kYWdlDQpib25lcg0KYm9vYg0KYnVra2FrZQ0KZHlrZQ0KYnVsbHNoaXQNCmJ1bQ0KYnV0dGhvbGUNCmNhbXNsdXQNCmNhbXdob3JlDQpjaGluaw0KY2hvYWQNCmdhbmdiYW5nDQpjdW0NCmN1bnQNCmRlZXB0aHJvYXQNCmRpbGRvDQpjb2NrDQpmdWNrDQpwZW5pcw0KdmFnaW5hDQp2dWx2YQ0Kc2x1dA0KbWFzdHVyYmF0ZQ0Kc2hpdA0KbmlnZ2VyDQpjcmFja2VyDQpqZXcNCmlzcmFlbA0KcGFsZXN0aW5lDQp0cnVtcA0KYmlkZW4NCnJlcHVibGljYW4NCmRlbW9jcmF0DQpuYXppDQphbnRpZmE=';
const wordBlacklist = Buffer.from(wordBlacklistBase64.trim(), 'base64')
	.toString('utf8')
	.split('\n')
	.map(word => word.trim().toLowerCase());

export function containsBlacklistedWord(str: string): boolean {
	const lowerCaseStr = str.toLowerCase();
	for (const word of wordBlacklist) {
		if (lowerCaseStr.includes(word)) {
			return true;
		}
	}
	return false;
}

export function splitMessage(
	text: string,
	{
		maxLength = 2000,
		char = '\n',
		prepend = '',
		append = ''
	}: {
		maxLength?: number | undefined;
		char?: string | undefined;
		prepend?: string | undefined;
		append?: string | undefined;
	} = {}
): string[] {
	if (text.length <= maxLength) return [text];
	let splitText: string[] = [text];
	if (Array.isArray(char)) {
		while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
			const currentChar = char.shift();
			if (currentChar instanceof RegExp) {
				splitText = splitText.flatMap(chunk => chunk.match(currentChar)).filter(notEmpty);
			} else {
				splitText = splitText.flatMap(chunk => chunk.split(currentChar));
			}
		}
	} else {
		splitText = text.split(char);
	}
	if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
	const messages = [];
	let msg = '';
	for (const chunk of splitText) {
		if ((msg + char + chunk + append).length > maxLength) {
			messages.push(msg + append);
			msg = prepend;
		}
		msg += (msg !== prepend ? char : '') + chunk;
	}
	return messages.concat(msg).filter(m => m);
}
