export function pluraliseItemName(name: string): string {
	return name + (name.endsWith('s') ? '' : 's');
}
