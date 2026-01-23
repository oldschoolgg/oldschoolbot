import type { RNGProvider } from '../types.js';

export const MathRNG: RNGProvider = {
	roll(max: number): boolean {
		return Math.floor(Math.random() * max) === 0;
	},

	randInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	randFloat(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	},

	rand(): number {
		return Math.random();
	},

	shuffle<T>(array: T[]): T[] {
		const a = [...array];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	},

	pick<T>(array: T[]): T {
		return array[Math.floor(Math.random() * array.length)];
	},

	percentChance(percent: number): boolean {
		return Math.random() < percent / 100;
	},

	randomVariation(value: number, percentage: number): number {
		const lowerLimit = value * (1 - percentage / 100);
		const upperLimit = value * (1 + percentage / 100);
		return this.randFloat(lowerLimit, upperLimit);
	}
};
