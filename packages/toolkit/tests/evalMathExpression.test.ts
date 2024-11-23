import { expect, test } from 'vitest';
import { evalMathExpression } from '../src/util';

test('evalMathExpression.test', () => {
	expect(evalMathExpression('10')).toEqual(10);
	expect(evalMathExpression('10k')).toEqual(10_000);
	expect(evalMathExpression('0')).toEqual(0);
	expect(evalMathExpression('25.2k')).toEqual(25_200);
	expect(evalMathExpression('10*10')).toEqual(100);
	expect(evalMathExpression('1m')).toEqual(1_000_000);
	expect(evalMathExpression('1b')).toEqual(1_000_000_000);
	expect(evalMathExpression('e*e*e*e*100b*100b')).toEqual(null);
	expect(evalMathExpression('!9999999')).toEqual(null);
	expect(evalMathExpression('9999999!')).toEqual(null);
	expect(evalMathExpression('P99999')).toEqual(null);
	expect(evalMathExpression('Sigma 99999')).toEqual(null);
	expect(evalMathExpression('')).toEqual(null);
});
