import { describe, expect, test } from 'vitest';

import { pluraliseItemName } from '../src/lib/util/pluraliseItemName';

describe('pluraliseItemName', () => {
	test('pluraliseItemName correctly pluralises items', async () => {
		expect(pluraliseItemName('Steel Axe')).toEqual('Steel Axes');
		expect(pluraliseItemName('Steel Arrowtips')).toEqual('Steel Arrowtips');
		expect(pluraliseItemName('Adamantite nails')).toEqual('Adamantite nails');
	});
});
