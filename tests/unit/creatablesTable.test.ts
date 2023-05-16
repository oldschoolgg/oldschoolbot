import { readFileSync } from 'fs';
import { expect, test } from 'vitest';

import { makeCreatablesTable } from '../../src/scripts/render-creatables-file';

test('Creatables table', async () => {
	const txtFile = await readFileSync('./src/lib/data/creatablesTable.txt', 'utf8');
	const generated = makeCreatablesTable();
	expect(txtFile).toEqual(generated);
});
