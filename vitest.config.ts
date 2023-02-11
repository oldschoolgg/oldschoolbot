import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'c8',
			reporter: 'html',
			include: ['src/lib/structures/Gear.ts', 'src/lib/util/parseStringBank.ts', 'src/lib/util/equipMulti.ts'],
			functions: 80,
			branches: 90,
			statements: 90,
			lines: 90
		},
		setupFiles: 'tests/setup.ts'
	}
});
