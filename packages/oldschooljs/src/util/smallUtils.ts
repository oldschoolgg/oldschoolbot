import { round } from 'e';

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

export function fromKMB(number: string): number {
	number = number.toLowerCase().replace(/,/g, '');
	const [numberBefore, numberAfter] = number.split(/[.kmb]/g);

	let newNum = numberBefore;
	if (number.includes('b')) {
		newNum += numberAfter + '0'.repeat(9).slice(numberAfter.length);
	} else if (number.includes('m')) {
		newNum += numberAfter + '0'.repeat(6).slice(numberAfter.length);
	} else if (number.includes('k')) {
		newNum += numberAfter + '0'.repeat(3).slice(numberAfter.length);
	}

	return Number.parseInt(newNum);
}
