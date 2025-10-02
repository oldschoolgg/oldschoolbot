import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import type { Fletchable } from '../../src/lib/skilling/types.js';
import { formatZeroTimeFletchingStatus } from '../../src/lib/util/formatZeroTimeFletchingStatus.js';

describe('formatZeroTimeFletchingStatus', () => {
	const baseFletchable: Fletchable = {
		name: 'Test arrows',
		id: 1,
		level: 1,
		xp: 1,
		inputItems: new Bank(),
		tickRate: 1
	};

	test('includes sets wording for multi-output items', () => {
		const result = formatZeroTimeFletchingStatus(5, {
			...baseFletchable,
			outputMultiple: 10,
			name: 'Multi output'
		});

		expect(result).toBe('They are also fletching 5 sets of Multi output.');
	});

	test('omits sets wording for single-output items', () => {
		const result = formatZeroTimeFletchingStatus(3, {
			...baseFletchable,
			name: 'Single output'
		});

		expect(result).toBe('They are also fletching 3 Single output.');
	});
});
