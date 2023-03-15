import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'c8',
			reporter: 'html',
			include: ['src/lib/structures/Gear.ts', 'src/lib/util/parseStringBank.ts', 'src/lib/util/equipMulti.ts']
		},
		setupFiles: 'tests/setup.ts'
	}
});
