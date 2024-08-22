import { test } from 'vitest';

import { InteractionID } from '../../src/lib/InteractionID';

test('InteractionID', () => {
	const allStrings = Object.values(InteractionID)
		.map(obj => Object.values(obj))
		.flat(2);
	for (const string of allStrings) {
		if (string.length < 1 || string.length > 100) {
			throw new Error(`String ${string} has length ${string.length} which is not between 1 and 100`);
		}
	}
});
