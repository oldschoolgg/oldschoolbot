export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z+]/gi, '').toUpperCase();
}
export function stringMatches(str: string, str2: string) {
	return cleanString(str) === cleanString(str2);
}
