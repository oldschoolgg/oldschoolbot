import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Oldschoolgg RNG Benchmarks',
		include: ['bench/*.bench.ts']
	}
});
