/**
 * Rounds a number to a given precision.
 *
 * @param value The number to be rounded.
 * @param precision The precision of the rounding.
 */
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

/**
 * Shows what percentage a value is of a total value, for example calculating what percentage of 20 is 5? (25%)
 * @param partialValue The partial value of the total number, that you want to know what its percentage of the total is.
 * @param totalValue The total value, that the partial value is a part of.
 */
export function calcWhatPercent(partialValue: number, totalValue: number): number {
	return (100 * partialValue) / totalValue;
}

/**
 * Calculates what a X% of a total number is, for example calculating what is 20% of 100
 * @param percent The percentage (%) you want to calculate.
 * @param valueToCalc The total number that you want to get the percentage of.
 */
export function calcPercentOfNum(percent: number, valueToCalc: number): number {
	return (percent * valueToCalc) / 100;
}

/**
 * Reduces a number by a percentage of itself.
 * @param value, The number to be reduced.
 * @param percent The percent you want the value to be reduced by.
 */
export function reduceNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value - value * (percent / 100);
}

/**
 * Increases a number by a percentage of itself.
 * @param value, The number to be increased.
 * @param percent The percent you want the value to be increased by.
 */
export function increaseNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value + value * (percent / 100);
}
