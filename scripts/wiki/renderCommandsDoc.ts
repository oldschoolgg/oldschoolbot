import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type ChoiceValue = string | number | { name: string; value: string | number };

type CommandOption = {
	type?: string;
	name?: string;
	description?: string;
	required?: boolean;
	choices?: ChoiceValue[];
	choicesSummary?: string;
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
const OUTPUT_DIR = path.join(ROOT, 'docs', 'src', 'content', 'docs', 'osb', 'commands');
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

function getModuleSpecifierText(node: ts.Expression): string | null {
	// import ... from 'x'
	// export ... from 'x'
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
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
			const spec = getModuleSpecifierText(statement.moduleSpecifier);
			if (!spec) continue;
			const importPath = resolveImportPath(filePath, spec);
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
		const spec = getModuleSpecifierText(exportDecl.moduleSpecifier);
		if (!spec) continue;
		const resolvedPath = resolveImportPath(filePath, spec);
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
		const spec = getModuleSpecifierText(exportDecl.moduleSpecifier);
		if (!spec) continue;
		const resolvedPath = resolveImportPath(filePath, spec);
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

type ParsedChoices = {
	choices?: ChoiceValue[];
	summary?: string;
};

function parseChoiceArray(filePath: string, node: ts.Expression, seen = new Set<string>()): ChoiceValue[] | undefined {
	const expression = unwrapExpression(node);
	if (!ts.isArrayLiteralExpression(expression)) return undefined;

	const out: ChoiceValue[] = [];

	const pushFromExpression = (expr: ts.Expression) => {
		const unwrapped = unwrapExpression(expr);

		// "...something"
		if (ts.isSpreadElement(unwrapped)) {
			const spread = parseChoiceArray(filePath, unwrapped.expression, seen);
			if (spread) out.push(...spread);
			return;
		}

		// identifier reference (e.g. easy, medium, SOME_CHOICES)
		if (ts.isIdentifier(unwrapped)) {
			if (seen.has(unwrapped.text)) return;
			seen.add(unwrapped.text);

			const resolved = resolveIdentifierExpression(filePath, unwrapped.text);
			if (!resolved) return;

			const resolvedExpr = unwrapExpression(resolved.expression);

			// identifier points to an array
			const asArray = parseChoiceArray(resolved.sourcePath, resolvedExpr, seen);
			if (asArray) {
				out.push(...asArray);
				return;
			}

			// identifier points to a literal we can use as a single choice
			if (ts.isStringLiteral(resolvedExpr)) {
				out.push(resolvedExpr.text);
				return;
			}
			if (ts.isNumericLiteral(resolvedExpr)) {
				out.push(Number(resolvedExpr.text));
				return;
			}

			// identifier points to an object literal {name,value}
			if (ts.isObjectLiteralExpression(resolvedExpr)) {
				const parsedObj = parseSingleChoiceObject(resolved.sourcePath, resolvedExpr, seen);
				if (parsedObj) out.push(parsedObj);
			}

			return;
		}

		// direct literals
		if (ts.isStringLiteral(unwrapped)) {
			out.push(unwrapped.text);
			return;
		}
		if (ts.isNumericLiteral(unwrapped)) {
			out.push(Number(unwrapped.text));
			return;
		}

		// direct object literal
		if (ts.isObjectLiteralExpression(unwrapped)) {
			const parsedObj = parseSingleChoiceObject(filePath, unwrapped, seen);
			if (parsedObj) out.push(parsedObj);
		}
	};

	for (const el of expression.elements) {
		pushFromExpression(el);
	}

	return out.length > 0 ? out : undefined;
}

function parseSingleChoiceObject(
	filePath: string,
	obj: ts.ObjectLiteralExpression,
	_seen: Set<string>
): { name: string; value: string | number } | undefined {
	let name: string | undefined;
	let value: string | number | undefined;

	for (const prop of obj.properties) {
		if (!ts.isPropertyAssignment(prop)) continue;
		const propName = getPropertyName(prop.name);
		if (!propName) continue;

		const init = unwrapExpression(prop.initializer);

		if (propName === 'name') {
			if (ts.isStringLiteral(init)) name = init.text;
			if (ts.isIdentifier(init)) {
				const resolved = resolveIdentifierExpression(filePath, init.text);
				const v = resolved ? unwrapExpression(resolved.expression) : undefined;
				if (v && ts.isStringLiteral(v)) name = v.text;
			}
		}

		if (propName === 'value') {
			if (ts.isStringLiteral(init)) value = init.text;
			if (ts.isNumericLiteral(init)) value = Number(init.text);
			if (ts.isIdentifier(init)) {
				const resolved = resolveIdentifierExpression(filePath, init.text);
				const v = resolved ? unwrapExpression(resolved.expression) : undefined;
				if (v && ts.isStringLiteral(v)) value = v.text;
				if (v && ts.isNumericLiteral(v)) value = Number(v.text);
			}
		}
	}

	return name !== undefined && value !== undefined ? { name, value } : undefined;
}

function parseArrayLength(filePath: string, node: ts.Expression, seen = new Set<string>()): number | undefined {
	const expression = unwrapExpression(node);
	if (ts.isIdentifier(expression)) {
		if (seen.has(expression.text)) return undefined;
		seen.add(expression.text);
		const resolved = resolveIdentifierExpression(filePath, expression.text);
		return resolved ? parseArrayLength(resolved.sourcePath, resolved.expression, seen) : undefined;
	}
	if (ts.isArrayLiteralExpression(expression)) {
		let count = 0;
		for (const element of expression.elements) {
			if (ts.isSpreadElement(element)) {
				const spreadLength = parseArrayLength(filePath, element.expression, seen);
				if (spreadLength === undefined) return undefined;
				count += spreadLength;
				continue;
			}
			count += 1;
		}
		return count;
	}
	if (ts.isCallExpression(expression)) {
		const callee = unwrapExpression(expression.expression);
		if (ts.isIdentifier(callee) && callee.text === 'choicesOf' && expression.arguments[0]) {
			return parseArrayLength(filePath, expression.arguments[0], seen);
		}
		if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'map') {
			return parseArrayLength(filePath, callee.expression, seen);
		}
	}
	return undefined;
}

function getCallbackReturnExpression(callback: ts.Expression): ts.Expression | undefined {
	const unwrapped = unwrapExpression(callback);
	if (ts.isArrowFunction(unwrapped)) {
		if (ts.isBlock(unwrapped.body)) {
			return unwrapped.body.statements.find(ts.isReturnStatement)?.expression;
		}
		return unwrapped.body;
	}
	if (ts.isFunctionExpression(unwrapped)) {
		return unwrapped.body.statements.find(ts.isReturnStatement)?.expression;
	}
	return undefined;
}

function parseChoicesFromMap(
	filePath: string,
	callExpression: ts.CallExpression,
	seen = new Set<string>()
): ParsedChoices | undefined {
	const callee = unwrapExpression(callExpression.expression);
	if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'map') return undefined;

	const baseChoicesResult = parseChoices(filePath, callee.expression, seen);
	const baseChoices = baseChoicesResult?.choices;
	const baseCount = baseChoicesResult?.summary ? undefined : parseArrayLength(filePath, callee.expression, seen);
	const callback = callExpression.arguments[0];
	if (!callback || !baseChoices) {
		if (baseCount !== undefined) {
			return { summary: `${baseCount} options` };
		}
		return baseChoicesResult;
	}
	const returnExpression = getCallbackReturnExpression(callback);
	if (!returnExpression) {
		if (baseCount !== undefined) {
			return { summary: `${baseCount} options` };
		}
		return undefined;
	}

	const unwrappedReturn = unwrapExpression(returnExpression);
	const callbackParam =
		ts.isArrowFunction(callback) && callback.parameters[0] && ts.isIdentifier(callback.parameters[0].name)
			? callback.parameters[0].name.text
			: undefined;

	if (callbackParam) {
		if (ts.isIdentifier(unwrappedReturn) && unwrappedReturn.text === callbackParam) {
			return { choices: baseChoices };
		}
		if (ts.isObjectLiteralExpression(unwrappedReturn)) {
			const mappedChoices: ChoiceValue[] = [];
			const baseValues = baseChoices.map(choice => (typeof choice === 'object' ? choice.value : choice));
			for (const baseValue of baseValues) {
				let name: string | undefined;
				let value: string | number | undefined;
				for (const prop of unwrappedReturn.properties) {
					if (!ts.isPropertyAssignment(prop)) continue;
					const propName = getPropertyName(prop.name);
					if (!propName) continue;
					const propValue = unwrapExpression(prop.initializer);
					if (propName === 'name') {
						if (ts.isStringLiteral(propValue)) name = propValue.text;
						if (ts.isIdentifier(propValue) && propValue.text === callbackParam) {
							name = String(baseValue);
						}
					}
					if (propName === 'value') {
						if (ts.isStringLiteral(propValue)) value = propValue.text;
						if (ts.isNumericLiteral(propValue)) value = Number(propValue.text);
						if (ts.isIdentifier(propValue) && propValue.text === callbackParam) {
							value = baseValue;
						}
					}
				}
				if (name !== undefined && value !== undefined) {
					mappedChoices.push({ name, value });
				}
			}
			if (mappedChoices.length > 0) {
				return { choices: mappedChoices };
			}
		}
	}

	if (baseCount !== undefined) {
		return { summary: `${baseCount} options` };
	}
	return undefined;
}

function parseChoices(filePath: string, node: ts.Expression, seen = new Set<string>()): ParsedChoices | undefined {
	const expression = unwrapExpression(node);
	if (ts.isArrayLiteralExpression(expression)) {
		const choices = parseChoiceArray(filePath, expression, seen);
		if (choices) return { choices };
		const count = parseArrayLength(filePath, expression, seen);
		return count !== undefined ? { summary: `${count} options` } : undefined;
	}
	if (ts.isIdentifier(expression)) {
		if (seen.has(expression.text)) return undefined;
		seen.add(expression.text);
		const resolved = resolveIdentifierExpression(filePath, expression.text);
		return resolved ? parseChoices(resolved.sourcePath, resolved.expression, seen) : undefined;
	}
	if (ts.isCallExpression(expression)) {
		const callee = unwrapExpression(expression.expression);
		if (ts.isIdentifier(callee) && callee.text === 'choicesOf' && expression.arguments[0]) {
			const parsed = parseChoices(filePath, expression.arguments[0], seen);
			if (parsed) {
				return parsed;
			}
			const count = parseArrayLength(filePath, expression.arguments[0], seen);
			return count !== undefined ? { summary: `${count} options` } : undefined;
		}
		if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'map') {
			return parseChoicesFromMap(filePath, expression, seen);
		}
		if (ts.isIdentifier(callee)) {
			const functionInfo = resolveIdentifierFunction(filePath, callee.text);
			if (functionInfo?.returnExpression) {
				return parseChoices(functionInfo.sourcePath, functionInfo.returnExpression, seen);
			}
		}
	}
	return undefined;
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
			const parsedChoices = parseChoices(filePath, value);
			if (parsedChoices) {
				option.choices = parsedChoices.choices;
				option.choicesSummary = parsedChoices.summary;
			}
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
				const parsedExamples = parseChoices(filePath, attr.initializer);
				const examples = parsedExamples?.choices?.filter(choice => typeof choice === 'string') as
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
		return option.choicesSummary ? `${option.choicesSummary} (see autocomplete)` : '';
	}

	const names = option.choices.map(choice => {
		if (typeof choice === 'string' || typeof choice === 'number') {
			return String(choice);
		}
		return choice.name;
	});

	const hasNamedChoices = option.choices.some(c => typeof c === 'object');
	const MAX_INLINE = hasNamedChoices ? 12 : 8;

	if (names.length <= MAX_INLINE) {
		return names.join(', ');
	}

	return `${names.length} options (see autocomplete)`;
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

function renderCommandDetails(command: CommandDefinition, subheadingLevel: number): string[] {
	const sections: string[] = [];
	const commandName = command.name ?? 'command';

	const options = command.options ?? [];
	const hasSubcommands = options.some(option => option.type === 'Subcommand' || option.type === 'SubcommandGroup');

	if (hasSubcommands) {
		const headingPrefix = '#'.repeat(subheadingLevel);
		for (const entry of collectSubcommands(options)) {
			sections.push('', `${headingPrefix} /${commandName} ${entry.path.join(' ')}`, '');
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

function renderCommand(command: CommandDefinition, headingLevel = 2): string[] {
	const sections: string[] = [];
	const commandName = command.name ?? 'command';
	const headingPrefix = '#'.repeat(headingLevel);
	sections.push(`${headingPrefix} /${commandName}`, '', command.description ?? '');
	sections.push(...renderCommandDetails(command, headingLevel + 1));
	return sections;
}

function toSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9-_]/gu, '-')
		.replace(/-{2,}/gu, '-')
		.replace(/(^-|-$)/gu, '');
}

type CommandEntry = {
	name: string;
	description: string;
	slug: string;
};

function buildIndexDocument(commandList: CommandEntry[]): string {
	const lines: string[] = [
		'---',
		'title: "Commands"',
		'---',
		'',
		'<!-- This file is generated by scripts/wiki/renderCommandsDoc.ts. -->',
		'',
		'Browse command docs by top-level command, or use the search below to jump to a specific page.',
		'',
		'[Full reference (all commands)](./all).',
		'',
		'<div class="command-search">',
		'<input id="command-search" type="search" placeholder="Search commands..." autocomplete="off" />',
		'</div>',
		'',
		'<ul id="command-list">'
	];

	for (const command of commandList) {
		lines.push(
			`<li data-name="${command.name}" data-description="${command.description}"><a href="./${command.slug}">/${command.name}</a> — ${command.description}</li>`
		);
	}

	lines.push(
		'</ul>',
		'',
		'<script is:inline>',
		'const searchInput = document.getElementById("command-search");',
		'const commandItems = Array.from(document.querySelectorAll("#command-list li"));',
		'const filterCommands = () => {',
		'\tconst query = searchInput?.value?.trim().toLowerCase() ?? "";',
		'\tfor (const item of commandItems) {',
		'\t\tconst name = item.getAttribute("data-name")?.toLowerCase() ?? "";',
		'\t\tconst description = item.getAttribute("data-description")?.toLowerCase() ?? "";',
		'\t\tconst matches = !query || name.includes(query) || description.includes(query);',
		'\t\titem.style.display = matches ? "" : "none";',
		'\t}',
		'};',
		'searchInput?.addEventListener("input", filterCommands);',
		'</script>',
		'',
		'## Categories'
	);

	const grouped = new Map<string, CommandEntry[]>();
	for (const command of commandList) {
		const letter = command.name[0]?.toUpperCase() ?? '#';
		const bucket = grouped.get(letter) ?? [];
		bucket.push(command);
		grouped.set(letter, bucket);
	}

	for (const letter of Array.from(grouped.keys()).sort()) {
		lines.push('', `### ${letter}`);
		for (const command of grouped.get(letter) ?? []) {
			lines.push(`- [/${command.name}](./${command.slug}) — ${command.description}`);
		}
	}

	return `${lines.join('\n')}\n`;
}

function buildCommandDocument(command: CommandDefinition): string {
	const commandName = command.name ?? 'command';
	const lines: string[] = [
		'---',
		`title: "/${commandName}"`,
		'---',
		'',
		'<!-- This file is generated by scripts/wiki/renderCommandsDoc.ts. -->',
		'',
		'[← Back to commands index](./)',
		'',
		command.description ?? ''
	];

	lines.push(...renderCommandDetails(command, 2));

	return `${lines.join('\n')}\n`;
}

function buildFullDocument(commandList: CommandDefinition[]): string {
	const lines: string[] = [
		'---',
		'title: "All Commands"',
		'sidebar:',
		'  hidden: true',
		'---',
		'',
		'<!-- This file is generated by scripts/wiki/renderCommandsDoc.ts. -->',
		'',
		'This is the full command reference generated from `src/mahoji/commands`.',
		'',
		'For the index of top-level commands, see the [Commands index](./).',
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

const commandEntries: CommandEntry[] = commands.map(command => ({
	name: command.name ?? 'command',
	description: command.description ?? '',
	slug: toSlug(command.name ?? 'command')
}));

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(path.join(OUTPUT_DIR, 'index.mdx'), buildIndexDocument(commandEntries));
writeFileSync(path.join(OUTPUT_DIR, 'all.mdx'), buildFullDocument(commands));

for (const command of commands) {
	const slug = toSlug(command.name ?? 'command');
	writeFileSync(path.join(OUTPUT_DIR, `${slug}.mdx`), buildCommandDocument(command));
}
