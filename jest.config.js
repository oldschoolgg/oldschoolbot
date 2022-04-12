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
		"./src/lib/structures/Gear.ts",
		"./src/lib/util/parseStringBank.ts",
		"./src/lib/util/buyLimit.ts"
	],
	coverageThreshold: {
    	global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
   		},
 	},
};
