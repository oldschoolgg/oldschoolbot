import { writeFile } from 'node:fs/promises';
import { Bank, Monsters } from 'oldschooljs';
import { describe, test } from 'vitest';

import { drawChestLootImage } from '../../src/lib/bankImage';
import { clImageGenerator } from '../../src/lib/collectionLogTask';
import { BOT_TYPE } from '../../src/lib/constants';
import { pohImageGenerator } from '../../src/lib/pohImage';
import { mahojiChatHead } from '../../src/lib/util/chatHeadImage';
import { makeBankImage } from '../../src/lib/util/makeBankImage';
import { mockMUser } from './utils';

describe('Images', () => {
	test.concurrent('Chat Heads', async () => {
		const result = await mahojiChatHead({
			content:
				'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test',
			head: 'santa'
		});
		await writeFile(`tests/unit/snapshots/chatHead.${BOT_TYPE}.png`, result.files[0].attachment);
	});

	test.concurrent('Collection Log', async () => {
		const result: any = await clImageGenerator.generateLogImage({
			user: mockMUser({ cl: new Bank().add('Harmonised orb') }),
			collection: 'nightmare',
			type: 'collection',
			flags: {},
			stats: {
				sacrificedBank: new Bank(),
				titheFarmsCompleted: 1,
				lapsScores: {},
				openableScores: new Bank(),
				kcBank: {},
				highGambles: 1,
				gotrRiftSearches: 1
			}
		});
		await writeFile(`tests/unit/snapshots/cl.${BOT_TYPE}.png`, result.files[0].attachment);
	});

	test.concurrent('Bank Image', async () => {
		const bank = new Bank();
		for (const item of [...Monsters.Cow.allItems]) {
			bank.add(item);
		}
		bank.add('Twisted bow', 10_000_000);
		bank.add('Elysian sigil', 1_000_000);
		const result = await makeBankImage({
			bank,
			title: 'Test Image'
		});
		await writeFile(`tests/unit/snapshots/bank.${BOT_TYPE}.png`, result.file.attachment);
	});

	test.concurrent('POH Image', async () => {
		const result = await pohImageGenerator.run({
			prayer_altar: 13_197,
			throne: 13_667,
			torch: 13_342,
			mounted_cape: 29_210,
			background_id: 1
		} as any);
		await writeFile(`tests/unit/snapshots/poh.${BOT_TYPE}.png`, result);
	});

	// test('Chart Image', async () => {
	// 	const result = await pieChart('Test', val => `${toKMB(val)}%`, [
	// 		['Complete Collection Log Items', 20, '#9fdfb2'],
	// 		['Incomplete Collection Log Items', 80, '#df9f9f']
	// 	]);
	// 	expect(result).toMatchImageSnapshot();
	// });

	test.concurrent('TOA Image', async () => {
		const image = await drawChestLootImage({
			entries: [
				{
					loot: new Bank()
						.add('Twisted bow')
						.add('Coal')
						.add('Egg')
						.add('Elysian sigil')
						.add('Trout')
						.add('Salmon'),
					user: mockMUser() as any,
					previousCL: new Bank().add('Twisted bow').add('Coal'),
					customTexts: []
				}
			],
			type: 'Tombs of Amascut'
		});
		await writeFile(`tests/unit/snapshots/toa.${BOT_TYPE}.png`, image.attachment);
	});

	test.concurrent('COX Image', async () => {
		const image = await drawChestLootImage({
			entries: [
				{
					loot: new Bank()
						.add('Twisted bow')
						.add('Coal')
						.add('Egg')
						.add('Elysian sigil')
						.add('Trout')
						.add('Salmon'),
					user: mockMUser() as any,
					previousCL: new Bank().add('Twisted bow').add('Coal'),
					customTexts: []
				}
			],
			type: 'Chambers of Xerician'
		});
		await writeFile(`tests/unit/snapshots/cox.${BOT_TYPE}.png`, image.attachment);
	});
});
