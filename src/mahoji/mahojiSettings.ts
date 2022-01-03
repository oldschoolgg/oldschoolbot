import { evalMathExpression } from '../lib/expressionParser';

export function mahojiParseNumber({ input }: { input: string | undefined | null }): number | null {
	if (input === undefined || input === null) return null;
	const parsed = evalMathExpression(input);
	return parsed;
}
