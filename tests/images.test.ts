import '../src/lib/bankImage';

import { writeFile } from 'fs/promises';
import { Bank, Monsters } from 'oldschooljs';
import { describe, test } from 'vitest';

import { clImageGenerator } from '../src/lib/collectionLogTask';
import { mahojiChatHead } from '../src/lib/util/chatHeadImage';
import { makeBankImage } from '../src/lib/util/makeBankImage';
import { mockMUser } from './utils';

describe('Images', () => {
	test('Chat Heads', async () => {
		const result = await mahojiChatHead({
			content:
				'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test',
			head: 'santa'
		});
		await writeFile('./tests/snapshots/chatheads_santa.png', result.files[0].attachment);
	});

	test('Collection Log', async () => {
		const result: any = await clImageGenerator.generateLogImage({
			user: mockMUser({ cl: new Bank().add('Elysian sigil') }),
			collection: 'corp',
			type: 'collection',
			flags: {}
		});
		await writeFile('./tests/snapshots/cl_corp.png', result.files[0].attachment);
	});

	test('Bank Image', async () => {
		let bank = new Bank();
		for (const item of [...Monsters.Man.allItems, ...Monsters.Cow.allItems]) {
			bank.add(item);
		}
		bank.add('Twisted bow', 10_000_000);
		bank.add('Elysian sigil', 1_000_000);
		const res = await makeBankImage({
			bank,
			title: 'Test Image'
		});
		await writeFile('./tests/snapshots/bank_1.png', res.file.attachment);
	});
});
