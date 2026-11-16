import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'RNG Benchmarks',
		include: ['bench/*.bench.ts']
	}
});
