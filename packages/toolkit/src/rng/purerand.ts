import prand from 'pure-rand';

function fisherYates<T>(data: T[], rand: (min: number, max: number) => number): void {
	for (let i = data.length - 1; i >= 1; --i) {
		const j = rand(0, i);
		[data[j], data[i]] = [data[i], data[j]];
	}
}

function parseSeed(str: string | number): number {
	if (typeof str === 'number') return str;
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return hash;
}

export function seedShuffle<T>(array: readonly T[], seedString: string | number): T[] {
	const rng = prand.xoroshiro128plus(parseSeed(seedString));
	const rand = (min: number, max: number) => {
		return prand.unsafeUniformIntDistribution(min, max, rng);
	};
	const copy = [...array];
	fisherYates(copy, rand);
	return copy;
}

export function seedShuffleMut<T>(array: T[], seedString: string | number) {
	const rng = prand.xoroshiro128plus(parseSeed(seedString));
	const rand = (min: number, max: number) => {
		return prand.unsafeUniformIntDistribution(min, max, rng);
	};
	fisherYates(array, rand);
}
