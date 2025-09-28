export interface RNGProvider {
	roll: (max: number) => boolean;
	randInt(min: number, max: number): number;
	randFloat(min: number, max: number): number;
	rand(): number;
	shuffle<T>(array: T[]): T[];
	pick<T>(array: T[]): T;
	percentChance(percent: number): boolean;
}
