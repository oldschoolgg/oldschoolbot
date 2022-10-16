module.exports = {
	coverageProvider: 'v8',
	displayName: 'unit test',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	collectCoverageFrom: [
		"./src/lib/structures/Gear.ts",
		"./src/lib/util/parseStringBank.ts",
		"./src/lib/util/buyLimit.ts",
		"./src/lib/util/equipMulti.ts",
		"./src/mahoji/commands/fish.ts"
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
