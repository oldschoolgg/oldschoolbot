import { parseCircular, parseDependencyTree } from 'dpdm';
import { expect, test } from 'vitest';

test('Circular Dependencies', async () => {
	const tree = await parseDependencyTree('./dist/index.js', {});

	const circulars = parseCircular(tree);
	expect(circulars).toEqual([]);
});
