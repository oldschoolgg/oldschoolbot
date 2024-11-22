import mathExpressionParser from 'math-expression-evaluator';

const kmbTokens = [
	['b', 1_000_000_000],
	['m', 1_000_000],
	['k', 1000]
] as const;
for (const [char, amount] of kmbTokens) {
	mathExpressionParser.addToken([
		{
			type: 7,
			token: char,
			show: char,
			value(a) {
				return a * amount;
			}
		}
	]);
}
/* c8 ignore start */
mathExpressionParser.addToken([
	{
		type: 2,
		token: '!',
		show: '!',
		value(a) {
			return a;
		}
	}
]);
mathExpressionParser.addToken([
	{
		type: 2,
		token: 'P',
		show: 'P',
		value(a) {
			return a;
		}
	}
]);
mathExpressionParser.addToken([
	{
		type: 2,
		token: 'Sigma',
		show: 'Sigma',
		value(a) {
			return a;
		}
	}
]);
/* c8 ignore stop */

export function evalMathExpression(str: string): number | null {
	try {
		const result = mathExpressionParser.eval(str);
		const number = Number.parseInt(result);
		if (Number.isNaN(number) || !Number.isFinite(number)) return null;
		return number;
	} catch {
		return null;
	}
}
