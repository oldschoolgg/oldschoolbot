export function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function roll(upperLimit: number): boolean {
	return randInt(1, upperLimit) === 1;
}

export function percentChance(percent: number): boolean {
	return randFloat(0, 100) < percent;
}
