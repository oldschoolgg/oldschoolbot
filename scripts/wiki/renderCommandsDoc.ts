import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type ChoiceValue = string | number | { name: string; value: string | number };

type CommandOption = {
	type?: string;
	name?: string;
	description?: string;
	required?: boolean;
	choices?: ChoiceValue[];
	options?: CommandOption[];
};

type CommandDefinition = {
	name?: string;
	description?: string;
	options?: CommandOption[];
	attributes?: {
		examples?: string[];
	};
};

type SubcommandEntry = {
	path: string[];
	options: CommandOption[];
};

type ImportTarget = {
	sourcePath: string;
	exportName: string;
};

type FunctionInfo = {
	returnExpression?: ts.Expression;
	sourcePath: string;
};

type ModuleInfo = {
	sourceFile: ts.SourceFile;
	imports: Map<string, ImportTarget>;
	locals: Map<string, ts.Expression>;
	functions: Map<string, FunctionInfo>;
	exports: Map<string, ts.Expression>;
	exportedFunctions: Map<string, FunctionInfo>;
	reExports: ts.ExportDeclaration[];
};

const ROOT = process.cwd();
const COMMANDS_DIR = path.join(ROOT, 'src', 'mahoji', 'commands');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'src', 'content', 'docs', 'osb', 'commands.mdx');
const IGNORED_COMMANDS = new Set(['admin', 'testpotato']);

const moduleCache = new Map<string, ModuleInfo>();

function resolveImportPath(fromFile: string, specifier: string): string | null {
	const normalized = specifier.replace(/\.js$/u, '');
	let basePath: string | null = null;
	if (normalized.startsWith('@/')) {
		basePath = path.join(ROOT, 'src', normalized.slice(2));
	} else if (normalized.startsWith('./') || normalized.startsWith('../')) {
		basePath = path.resolve(path.dirname(fromFile), normalized);
	} else {
		return null;
	}

	const candidates = [
		basePath,
		`${basePath}.ts`,
		`${basePath}.tsx`,
		`${basePath}.mts`,
		`${basePath}.cts`,
		path.join(basePath, 'index.ts'),
		path.join(basePath, 'index.tsx')
	];
	for (const candidate of candidates) {
		if (candidate && ts.sys.fileExists(candidate)) {
			return candidate;
		}
	}
	return null;
}

function getSourceFile(filePath: string): ts.SourceFile {
	const content = readFileSync(filePath, 'utf8');
	return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

function collectModuleInfo(filePath: string): ModuleInfo {
	const cached = moduleCache.get(filePath);
	if (cached) {
		return cached;
	}

	const sourceFile = getSourceFile(filePath);
	const imports = new Map<string, ImportTarget>();
	const locals = new Map<string, ts.Expression>();
	const functions = new Map<string, FunctionInfo>();
	const exports = new Map<string, ts.Expression>();
	const exportedFunctions = new Map<string, FunctionInfo>();
	const reExports: ts.ExportDeclaration[] = [];

	for (const statement of sourceFile.statements) {
		if (ts.isImportDeclaration(statement) && statement.importClause && statement.moduleSpecifier) {
			const importPath = resolveImportPath(filePath, statement.moduleSpecifier.text);
			if (!importPath) continue;
			const clause = statement.importClause;
			if (clause.name) {
				imports.set(clause.name.text, { sourcePath: importPath, exportName: 'default' });
			}
			if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
				for (const element of clause.namedBindings.elements) {
					const exportName = element.propertyName ? element.propertyName.text : element.name.text;
					imports.set(element.name.text, { sourcePath: importPath, exportName });
				}
			}
		}

		if (ts.isVariableStatement(statement)) {
			const isExported = statement.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
			for (const declaration of statement.declarationList.declarations) {
				if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
				const name = declaration.name.text;
				locals.set(name, declaration.initializer);
				if (isExported) {
					exports.set(name, declaration.initializer);
				}
			}
		}

		if (ts.isFunctionDeclaration(statement) && statement.name) {
			const info: FunctionInfo = {
				returnExpression: statement.body
					? statement.body.statements.find(ts.isReturnStatement)?.expression
					: undefined,
				sourcePath: filePath
			};
			const isExported = statement.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
			if (isExported) {
				exportedFunctions.set(statement.name.text, info);
			} else {
				functions.set(statement.name.text, info);
			}
		}

		if (ts.isExportDeclaration(statement)) {
			reExports.push(statement);
		}
	}

	const moduleInfo = {
		sourceFile,
		imports,
		locals,
		functions,
		exports,
		exportedFunctions,
		reExports
	};
	moduleCache.set(filePath, moduleInfo);
	return moduleInfo;
}

function resolveExport(filePath: string, exportName: string, seen = new Set<string>()): ts.Expression | undefined {
	if (seen.has(`${filePath}:${exportName}`)) {
		return undefined;
	}
	seen.add(`${filePath}:${exportName}`);

	const info = collectModuleInfo(filePath);
	if (info.exports.has(exportName)) {
		return info.exports.get(exportName);
	}
	for (const exportDecl of info.reExports) {
		if (!exportDecl.moduleSpecifier) continue;
		const resolvedPath = resolveImportPath(filePath, exportDecl.moduleSpecifier.text);
		if (!resolvedPath) continue;

		if (!exportDecl.exportClause) {
			const resolved = resolveExport(resolvedPath, exportName, seen);
			if (resolved) {
				return resolved;
			}
			continue;
		}

		if (ts.isNamedExports(exportDecl.exportClause)) {
			for (const element of exportDecl.exportClause.elements) {
				const importedName = element.propertyName ? element.propertyName.text : element.name.text;
				const exportedName = element.name.text;
				if (exportedName !== exportName) continue;
				return resolveExport(resolvedPath, importedName, seen);
			}
		}
	}

	return undefined;
}

function resolveFunction(filePath: string, functionName: string, seen = new Set<string>()): FunctionInfo | undefined {
	if (seen.has(`${filePath}:${functionName}`)) {
		return undefined;
	}
	seen.add(`${filePath}:${functionName}`);

	const info = collectModuleInfo(filePath);
	if (info.exportedFunctions.has(functionName)) {
		return info.exportedFunctions.get(functionName);
	}
	if (info.functions.has(functionName)) {
		return info.functions.get(functionName);
	}

	for (const exportDecl of info.reExports) {
		if (!exportDecl.moduleSpecifier) continue;
		const resolvedPath = resolveImportPath(filePath, exportDecl.moduleSpecifier.text);
		if (!resolvedPath) continue;

		if (!exportDecl.exportClause) {
			const resolved = resolveFunction(resolvedPath, functionName, seen);
			if (resolved) {
				return resolved;
			}
			continue;
		}

		if (ts.isNamedExports(exportDecl.exportClause)) {
			for (const element of exportDecl.exportClause.elements) {
				const importedName = element.propertyName ? element.propertyName.text : element.name.text;
				const exportedName = element.name.text;
				if (exportedName !== functionName) continue;
				return resolveFunction(resolvedPath, importedName, seen);
			}
		}
	}

	return undefined;
}

type ResolvedExpression = {
	expression: ts.Expression;
	sourcePath: string;
};

function resolveIdentifierExpression(filePath: string, name: string): ResolvedExpression | undefined {
	const info = collectModuleInfo(filePath);
	const local = info.locals.get(name);
	if (local) {
		return { expression: local, sourcePath: filePath };
	}
	const importTarget = info.imports.get(name);
	if (importTarget) {
		const resolved = resolveExport(importTarget.sourcePath, importTarget.exportName);
		return resolved ? { expression: resolved, sourcePath: importTarget.sourcePath } : undefined;
	}
	const resolved = resolveExport(filePath, name);
	return resolved ? { expression: resolved, sourcePath: filePath } : undefined;
}

function resolveIdentifierFunction(filePath: string, name: string): FunctionInfo | undefined {
	const info = collectModuleInfo(filePath);
	const local = info.functions.get(name);
	if (local) {
		return local;
	}
	const localExpression = info.locals.get(name);
	if (localExpression) {
		const functionInfo = getFunctionInfoFromExpression(localExpression, filePath);
		if (functionInfo) {
			return functionInfo;
		}
	}
	const importTarget = info.imports.get(name);
	if (importTarget) {
		const importedFunction = resolveFunction(importTarget.sourcePath, importTarget.exportName);
		if (importedFunction) {
			return importedFunction;
		}
		const importedExpression = resolveExport(importTarget.sourcePath, importTarget.exportName);
		if (importedExpression) {
			return getFunctionInfoFromExpression(importedExpression, importTarget.sourcePath);
		}
	}
	return resolveFunction(filePath, name);
}

function getFunctionInfoFromExpression(expression: ts.Expression, sourcePath: string): FunctionInfo | undefined {
	const unwrapped = unwrapExpression(expression);
	if (ts.isArrowFunction(unwrapped)) {
		if (ts.isBlock(unwrapped.body)) {
			const returnStatement = unwrapped.body.statements.find(ts.isReturnStatement);
			return returnStatement?.expression
				? { returnExpression: returnStatement.expression, sourcePath }
				: undefined;
		}
		return { returnExpression: unwrapped.body, sourcePath };
	}
	if (ts.isFunctionExpression(unwrapped)) {
		const returnStatement = unwrapped.body.statements.find(ts.isReturnStatement);
		return returnStatement?.expression ? { returnExpression: returnStatement.expression, sourcePath } : undefined;
	}
	return undefined;
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
	if (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) {
		return unwrapExpression(expression.expression);
	}
	return expression;
}

function getPropertyName(name: ts.PropertyName): string | undefined {
	if (ts.isIdentifier(name)) return name.text;
	if (ts.isStringLiteral(name)) return name.text;
	if (ts.isNumericLiteral(name)) return name.text;
	return undefined;
}

function parseChoices(node: ts.Expression): ChoiceValue[] | undefined {
	const expression = unwrapExpression(node);
	if (!ts.isArrayLiteralExpression(expression)) return undefined;
	const choices: ChoiceValue[] = [];
	for (const element of expression.elements) {
		const item = unwrapExpression(element);
		if (ts.isStringLiteral(item)) {
			choices.push(item.text);
			continue;
		}
		if (ts.isNumericLiteral(item)) {
			choices.push(Number(item.text));
			continue;
		}
		if (ts.isObjectLiteralExpression(item)) {
			let name: string | undefined;
			let value: string | number | undefined;
			for (const prop of item.properties) {
				if (!ts.isPropertyAssignment(prop)) continue;
				const propName = getPropertyName(prop.name);
				if (!propName) continue;
				const propValue = unwrapExpression(prop.initializer);
				if (propName === 'name' && ts.isStringLiteral(propValue)) {
					name = propValue.text;
				}
				if (propName === 'value') {
					if (ts.isStringLiteral(propValue)) value = propValue.text;
					if (ts.isNumericLiteral(propValue)) value = Number(propValue.text);
				}
			}
			if (name && value !== undefined) {
				choices.push({ name, value });
			}
		}
	}
	return choices.length > 0 ? choices : undefined;
}

function parseOptionsArray(filePath: string, node: ts.Expression): CommandOption[] | undefined {
	const expression = unwrapExpression(node);
	if (!ts.isArrayLiteralExpression(expression)) return undefined;
	const result: CommandOption[] = [];
	for (const element of expression.elements) {
		const option = parseCommandOption(filePath, element);
		if (option) result.push(option);
	}
	return result;
}

function mergeOptions(base: CommandOption, override: CommandOption): CommandOption {
	return {
		...base,
		...override,
		choices: override.choices ?? base.choices,
		options: override.options ?? base.options
	};
}

function parseCommandOption(filePath: string, node: ts.Expression): CommandOption | undefined {
	const expression = unwrapExpression(node);
	if (ts.isSpreadElement(expression)) {
		return parseCommandOption(filePath, expression.expression);
	}
	if (ts.isIdentifier(expression)) {
		const resolved = resolveIdentifierExpression(filePath, expression.text);
		if (resolved) {
			return parseCommandOption(resolved.sourcePath, resolved.expression);
		}
		return undefined;
	}
	if (ts.isCallExpression(expression)) {
		const callee = unwrapExpression(expression.expression);
		if (ts.isIdentifier(callee)) {
			if (callee.text === 'defineOption' && expression.arguments[0]) {
				return parseCommandOption(filePath, expression.arguments[0]);
			}
			const functionInfo = resolveIdentifierFunction(filePath, callee.text);
			if (functionInfo?.returnExpression) {
				return parseCommandOption(functionInfo.sourcePath, functionInfo.returnExpression);
			}
		}
		return undefined;
	}
	if (!ts.isObjectLiteralExpression(expression)) {
		return undefined;
	}

	let option: CommandOption = {};
	for (const prop of expression.properties) {
		if (ts.isSpreadAssignment(prop)) {
			const spreadOption = parseCommandOption(filePath, prop.expression);
			if (spreadOption) {
				option = mergeOptions(option, spreadOption);
			}
			continue;
		}
		if (!ts.isPropertyAssignment(prop)) continue;
		const key = getPropertyName(prop.name);
		if (!key) continue;
		const value = unwrapExpression(prop.initializer);
		if (key === 'name' && ts.isStringLiteral(value)) {
			option.name = value.text;
		}
		if (key === 'type' && ts.isStringLiteral(value)) {
			option.type = value.text;
		}
		if (key === 'description' && ts.isStringLiteral(value)) {
			option.description = value.text;
		}
		if (
			key === 'required' &&
			(value.kind === ts.SyntaxKind.TrueKeyword || value.kind === ts.SyntaxKind.FalseKeyword)
		) {
			option.required = value.kind === ts.SyntaxKind.TrueKeyword;
		}
		if (key === 'choices') {
			option.choices = parseChoices(value);
		}
		if (key === 'options') {
			option.options = parseOptionsArray(filePath, value);
		}
	}
	return option;
}

function parseCommandDefinition(filePath: string, node: ts.ObjectLiteralExpression): CommandDefinition {
	const command: CommandDefinition = {};
	for (const prop of node.properties) {
		if (!ts.isPropertyAssignment(prop)) continue;
		const key = getPropertyName(prop.name);
		if (!key) continue;
		const value = unwrapExpression(prop.initializer);
		if (key === 'name' && ts.isStringLiteral(value)) {
			command.name = value.text;
		}
		if (key === 'description' && ts.isStringLiteral(value)) {
			command.description = value.text;
		}
		if (key === 'options') {
			command.options = parseOptionsArray(filePath, value);
		}
		if (key === 'attributes' && ts.isObjectLiteralExpression(value)) {
			for (const attr of value.properties) {
				if (!ts.isPropertyAssignment(attr)) continue;
				const attrKey = getPropertyName(attr.name);
				if (attrKey !== 'examples') continue;
				const examples = parseChoices(attr.initializer)?.filter(choice => typeof choice === 'string') as
					| string[]
					| undefined;
				if (examples && examples.length > 0) {
					command.attributes = { examples };
				}
			}
		}
	}
	return command;
}

function parseCommandFile(filePath: string): CommandDefinition[] {
	const sourceFile = collectModuleInfo(filePath).sourceFile;
	const commands: CommandDefinition[] = [];
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!declaration.initializer || !ts.isCallExpression(declaration.initializer)) continue;
			const call = declaration.initializer;
			const callee = unwrapExpression(call.expression);
			if (!ts.isIdentifier(callee) || callee.text !== 'defineCommand') continue;
			const arg = call.arguments[0];
			if (!arg || !ts.isObjectLiteralExpression(unwrapExpression(arg))) continue;
			const command = parseCommandDefinition(filePath, unwrapExpression(arg) as ts.ObjectLiteralExpression);
			commands.push(command);
		}
	}
	return commands;
}

function formatOptionType(option: CommandOption): string {
	return option.type ? option.type.toLowerCase() : 'unknown';
}

function formatOptionToken(option: CommandOption): string {
	const name = option.name ?? 'param';
	const token = `${name}:<${formatOptionType(option)}>`;
	return option.required ? token : `[${token}]`;
}

function formatChoices(option: CommandOption): string {
	if (!option.choices || option.choices.length === 0) {
		return '';
	}
	const names = option.choices.map(choice => {
		if (typeof choice === 'string' || typeof choice === 'number') {
			return String(choice);
		}
		return choice.name;
	});
	if (names.length > 10) {
		return `${names.length} options`;
	}
	return names.join(', ');
}

function formatUsage(commandName: string, pathSegments: string[], options: CommandOption[]): string {
	const tokens = options.map(formatOptionToken).join(' ');
	const suffix = tokens ? ` ${tokens}` : '';
	const usagePath = pathSegments.length ? ` ${pathSegments.join(' ')}` : '';
	return `/${commandName}${usagePath}${suffix}`;
}

function collectSubcommands(options: CommandOption[] = []): SubcommandEntry[] {
	const entries: SubcommandEntry[] = [];
	for (const option of options) {
		if (option.type === 'Subcommand') {
			entries.push({
				path: option.name ? [option.name] : ['subcommand'],
				options: option.options ?? []
			});
			continue;
		}
		if (option.type === 'SubcommandGroup') {
			for (const subcommand of option.options ?? []) {
				if (subcommand.type !== 'Subcommand') continue;
				entries.push({
					path: [option.name ?? 'group', subcommand.name ?? 'subcommand'],
					options: subcommand.options ?? []
				});
			}
		}
	}
	return entries;
}

function renderParametersTable(options: CommandOption[]): string[] {
	if (options.length === 0) {
		return ['_No parameters._'];
	}

	const rows = options.map(option => {
		const required = option.required ? 'Yes' : 'No';
		const choices = formatChoices(option);
		return `| \`${option.name ?? 'param'}\` | \`${formatOptionType(option)}\` | ${required} | ${
			option.description ?? ''
		} | ${choices || '-'} |`;
	});

	return ['| Name | Type | Required | Description | Choices |', '| --- | --- | --- | --- | --- |', ...rows];
}

function renderCommand(command: CommandDefinition): string[] {
	const sections: string[] = [];
	const commandName = command.name ?? 'command';
	sections.push(`## /${commandName}`, '', command.description ?? '');

	const options = command.options ?? [];
	const hasSubcommands = options.some(option => option.type === 'Subcommand' || option.type === 'SubcommandGroup');

	if (hasSubcommands) {
		for (const entry of collectSubcommands(options)) {
			sections.push('', `### /${commandName} ${entry.path.join(' ')}`, '');
			sections.push('**Usage**', '', `- \`${formatUsage(commandName, entry.path, entry.options)}\``);
			sections.push('', '**Parameters**', '', ...renderParametersTable(entry.options));
		}
	} else {
		sections.push('', '**Usage**', '', `- \`${formatUsage(commandName, [], options)}\``);
		sections.push('', '**Parameters**', '', ...renderParametersTable(options));
	}

	const examples = command.attributes?.examples ?? [];
	if (examples.length > 0) {
		const exampleLines = examples.sort((a, b) => a.localeCompare(b)).map(example => `- \`${example}\``);
		sections.push('', '**Examples**', '', ...exampleLines);
	}

	return sections;
}

function buildDocument(commandList: CommandDefinition[]): string {
	const lines: string[] = [
		'---',
		'title: "Commands"',
		'---',
		'',
		'<!-- This file is generated by scripts/wiki/renderCommandsDoc.ts. -->',
		'',
		'The command reference below is generated from the slash command definitions in `src/mahoji/commands`.',
		'',
		'Each command shows usage, available parameters, and curated examples to keep documentation in sync with the bot.'
	];

	for (const command of commandList) {
		lines.push('', ...renderCommand(command));
	}

	return `${lines.join('\n')}\n`;
}

const commandFiles = readdirSync(COMMANDS_DIR)
	.filter(file => file.endsWith('.ts'))
	.map(file => path.join(COMMANDS_DIR, file));

const commands = commandFiles
	.flatMap(filePath => parseCommandFile(filePath))
	.filter(command => command.name && command.description)
	.filter(command => !IGNORED_COMMANDS.has(command.name ?? ''))
	.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

writeFileSync(OUTPUT_PATH, buildDocument(commands));
