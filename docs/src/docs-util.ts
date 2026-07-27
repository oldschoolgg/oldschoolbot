export function toTitleCase(str: string) {
	const splitStr = str.replaceAll('_', ' ').toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

function round(value: number, precision = 1): number {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

export function toKMB(number: number): string {
	if (number > 999_999_999 || number < -999_999_999) {
		return `${round(number / 1_000_000_000)}b`;
	} else if (number > 999_999 || number < -999_999) {
		return `${round(number / 1_000_000)}m`;
	} else if (number > 999 || number < -999) {
		return `${round(number / 1000)}k`;
	}
	return round(number).toString();
}
