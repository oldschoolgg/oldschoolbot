import { z } from 'zod';

export const ZAttackStyle = z.enum(['attack', 'strength', 'defence', 'magic', 'ranged']);
export type IAttackStyle = z.infer<typeof ZAttackStyle>;

const invalidPairs: ReadonlyArray<readonly [IAttackStyle, IAttackStyle]> = [
	['attack', 'magic'],
	['strength', 'magic'],
	['attack', 'ranged'],
	['strength', 'ranged'],
	['magic', 'ranged']
] as const;

const isInvalidPair = (a: IAttackStyle, b: IAttackStyle) =>
	invalidPairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export const ZAttackStyles = z
	.array(ZAttackStyle)
	.max(3)
	.refine(arr => new Set(arr).size === arr.length, 'Duplicate styles are not allowed.')
	.refine(arr => arr.length < 2 || arr.includes('defence'), 'Multi-style training must include defence.')
	.refine(arr => {
		for (let i = 0; i < arr.length; i++) {
			for (let j = i + 1; j < arr.length; j++) {
				if (isInvalidPair(arr[i]!, arr[j]!)) return false;
			}
		}
		return true;
	}, 'Invalid style combination.');
