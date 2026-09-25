import { describe, expect, test } from 'vitest';

import { convertWikiJSONToItem } from '../scripts/wikiparse.js';

const multiVariantItem = {
	title: 'Cow slippers',
	sections: [
		{
			title: '',
			infoboxes: [
				{
					name: { text: 'Cow slippers' },
					members: { text: 'Yes' },
					tradeable1: { text: 'Yes' },
					tradeable2: { text: 'No' },
					exchange1: { text: 'Yes' },
					exchange2: { text: 'No' },
					equipable: { text: 'Yes' },
					id1: { text: '33093', number: 33_093 },
					id2: { text: '33096', number: 33_096 }
				}
			]
		}
	]
};

describe('convertWikiJSONToItem', () => {
	test('selects fields belonging to the requested variant', () => {
		const tradeableVariant = convertWikiJSONToItem(multiVariantItem, 33_093);
		expect(tradeableVariant).toMatchObject({
			id: 33_093,
			name: 'Cow slippers',
			members: true,
			tradeable: true,
			tradeable_on_ge: true,
			equipable: true
		});

		const untradeableVariant = convertWikiJSONToItem(multiVariantItem, 33_096);
		expect(untradeableVariant).toMatchObject({
			id: 33_096,
			tradeable: false,
			tradeable_on_ge: false
		});
	});

	test('rejects a requested ID that is absent from the infobox', () => {
		expect(convertWikiJSONToItem(multiVariantItem, 99_999)).toBeNull();
	});

	test('does not treat player-tradeable items as GE-tradeable', () => {
		const item = convertWikiJSONToItem(
			{
				title: 'Mission totem',
				sections: [
					{
						title: '',
						infoboxes: [
							{
								name: { text: 'Mission totem' },
								tradeable: { text: 'Yes' },
								exchange: { text: 'No' },
								id: { text: '33424', number: 33_424 }
							}
						]
					}
				]
			},
			33_424
		);

		expect(item).toMatchObject({ tradeable: true, tradeable_on_ge: false });
	});

	test('recognises Deadman Mode exchange items', () => {
		const item = convertWikiJSONToItem(
			{
				title: 'Trinket of avarice',
				sections: [
					{
						title: '',
						infoboxes: [
							{
								name: { text: 'Trinket of avarice' },
								tradeable: { text: 'Yes' },
								exchange: { text: 'dmm' },
								id: { text: '33044', number: 33_044 }
							}
						]
					}
				]
			},
			33_044
		);

		expect(item).toMatchObject({ tradeable: true, tradeable_on_ge: true });
	});
});
