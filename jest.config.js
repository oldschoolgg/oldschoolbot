module.exports = {
	coverageProvider: 'v8',
	displayName: 'unit test',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRunner: 'jest-circus/runner',
	testMatch: ['<rootDir>/tests/**/*.test.ts'],
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tests/tsconfig.json'
		}
	},
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	collectCoverageFrom: [
		"./src/lib/structures/Gear.ts"
	],
	coverageThreshold: {
    	global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
   		},
 	},
};
