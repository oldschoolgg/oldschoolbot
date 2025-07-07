import { alphabeticalSort } from '@oldschoolgg/toolkit/util';
import { Items } from 'oldschooljs';
import { expect, it } from 'vitest';

import { BOT_TYPE } from '../../src/lib/constants';
import { allCLItemsFiltered, allCollectionLogsFlat } from '../../src/lib/data/Collections';

it(`${BOT_TYPE} Overall Collection Log Items`, () => {
	expect(
		allCLItemsFiltered
			.map(id => Items.itemNameFromId(id)!)
			.sort(alphabeticalSort)
			.join('\n')
	).toMatchSnapshot();
});

it(`${BOT_TYPE} Collection Log Groups/Categories`, () => {
	expect(
		allCollectionLogsFlat
			.map(i => `${i.name} (${i.items.length})`)
			.sort(alphabeticalSort)
			.join('\n')
	).toMatchSnapshot();
});
