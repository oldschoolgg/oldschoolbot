export function cleanString(str: string): string {
	return str.replace(/\s/g, '').toUpperCase();
}
