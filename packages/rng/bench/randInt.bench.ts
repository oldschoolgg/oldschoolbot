import { bench } from 'vitest';

import { cryptoRng, MathRNG, SeedableRNG } from '../src/index.js';

bench(
	'cryptoRng.randInt',
	() => {
		cryptoRng.randInt(1, 10);
	},
	{ time: 500 }
);

bench(
	'MathRNG.randInt',
	() => {
		MathRNG.randInt(1, 10);
	},
	{ time: 500 }
);

const seeded = new SeedableRNG(1);
bench(
	'SeedableRNG.randInt',
	() => {
		seeded.randInt(1, 10);
	},
	{ time: 500 }
);
