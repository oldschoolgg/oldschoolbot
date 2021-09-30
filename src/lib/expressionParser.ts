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

export function evalMathExpression(str: string): number | null {
	try {
		const result = mathExpressionParser.eval(str);
		const number = parseInt(result);
		if (isNaN(number) || !isFinite(number)) return null;
		return number;
	} catch {
		return null;
	}
}
