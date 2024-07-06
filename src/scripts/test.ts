import { md5sum } from '@oldschoolgg/toolkit';
import murmurhash from 'murmurhash';
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
	tsConfigFilePath: 'tsconfig.json'
});

const sourceFiles = project.getSourceFiles();
const externalImports = new Map<string, string[]>();

for (const sourceFile of sourceFiles) {
	const importDeclarations = sourceFile.getImportDeclarations();
	for (const importDeclaration of importDeclarations) {
		const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
		if (!moduleSpecifier.startsWith('.') && !moduleSpecifier.startsWith('/')) {
			const namedImports = importDeclaration.getNamedImports().map(ni => ni.getText());
			if (externalImports.has(moduleSpecifier)) {
				externalImports.get(moduleSpecifier)?.push(...namedImports);
			} else {
				externalImports.set(moduleSpecifier, namedImports);
			}
		}
	}
}

const bannedMap = new Set();
const banned = [
	'@sentry/utils',
	['assert', 'assert'],
	'node:console',
	'diagnostics_channel',
	['discord.js', 'BitField']
];
for (const b of banned) {
	if (Array.isArray(b)) {
		bannedMap.add(`${b[0]}.${b[1]}}`);
	} else {
		bannedMap.add(b);
	}
}

for (const [moduleSpecifier, namedImports] of externalImports.entries()) {
	if (moduleSpecifier.includes('oldschooljs')) continue;
	if (moduleSpecifier.includes('@napi-rs/canvas')) continue;
	if (moduleSpecifier.includes('discord.js')) continue;
	if (moduleSpecifier.includes('@prisma/client')) continue;
	if (moduleSpecifier.includes('@oldschoolgg/toolkit')) continue;
	for (const t of namedImports) {
		if (bannedMap.has(moduleSpecifier) || bannedMap.has(`${moduleSpecifier}.${t}`)) {
			console.error(`Banned import: ${moduleSpecifier}.${t}`);
		}
	}
}

function findFunctionsUsedOnce(sourceFiles: ReturnType<typeof project.getSourceFiles>): string[] {
	const functionUsageMap: Map<string, number> = new Map();

	// Collect function declarations
	for (const sourceFile of sourceFiles) {
		const functionDeclarations = sourceFile.getFunctions();
		for (const func of functionDeclarations) {
			const functionName = func.getName();
			if (functionName) {
				functionUsageMap.set(functionName, 0);
			}
		}
	}

	// Count function usage
	for (const sourceFile of sourceFiles) {
		const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier);
		for (const identifier of identifiers) {
			const identifierName = identifier.getText();
			if (functionUsageMap.has(identifierName)) {
				functionUsageMap.set(identifierName, functionUsageMap.get(identifierName)! + 1);
			}
		}
	}

	// Find functions used in only one place
	return Array.from(functionUsageMap.entries())
		.filter(([_, count]) => count === 1)
		.map(([functionName]) => functionName);
}

// Call the function and log the result
const functionsUsedOnce = findFunctionsUsedOnce(sourceFiles);
console.log('Functions used in only one place:');
for (const functionName of functionsUsedOnce) {
	console.log(functionName);
}

console.log(murmurhash('Magnaboy').toString());
console.log(md5sum('Magnaboy').toString());
