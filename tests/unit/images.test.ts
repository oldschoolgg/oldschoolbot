import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { Bank, Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { drawChestLootImage } from '../../src/lib/bankImage';
import { clImageGenerator } from '../../src/lib/collectionLogTask';
import { pohImageGenerator } from '../../src/lib/pohImage';
import { mahojiChatHead } from '../../src/lib/util/chatHeadImage';
import { makeBankImage } from '../../src/lib/util/makeBankImage';
import { mockMUser } from './utils';

declare module 'vitest' {
	interface Assertion<T> {
		toMatchImageSnapshot(): T;
	}
}

const toMatchImageSnapshotPlugin = configureToMatchImageSnapshot({
	customSnapshotsDir: './tests/unit/snapshots',
	noColors: true,
	failureThreshold: 5,
	failureThresholdType: 'percent'
});
expect.extend({ toMatchImageSnapshot: toMatchImageSnapshotPlugin });

describe('Images', () => {
	test('Chat Heads', async () => {
		const result = await mahojiChatHead({
			content:
				'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test',
			head: 'santa'
		});
		expect(result.files[0].attachment).toMatchImageSnapshot();
	});

	test('Collection Log', async () => {
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
		expect(result.files[0].attachment).toMatchImageSnapshot();
	});

	test('Bank Image', async () => {
		let bank = new Bank();
		for (const item of [...Monsters.Cow.allItems]) {
			bank.add(item);
		}
		bank.add('Twisted bow', 10_000_000);
		bank.add('Elysian sigil', 1_000_000);
		const result = await makeBankImage({
			bank,
			title: 'Test Image'
		});
		expect(result.file.attachment).toMatchImageSnapshot();
	});

	test('POH Image', async () => {
		const result = await pohImageGenerator.run({
			prayer_altar: 13_197,
			throne: 13_667,
			torch: 13_342,
			mounted_cape: 29_210,
			background_id: 1
		} as any);
		expect(result).toMatchImageSnapshot();
	});

	// test('Chart Image', async () => {
	// 	const result = await pieChart('Test', val => `${toKMB(val)}%`, [
	// 		['Complete Collection Log Items', 20, '#9fdfb2'],
	// 		['Incomplete Collection Log Items', 80, '#df9f9f']
	// 	]);
	// 	expect(result).toMatchImageSnapshot();
	// });

	test('TOA Image', async () => {
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
		expect(image.attachment as Buffer).toMatchImageSnapshot();
	});

	test('COX Image', async () => {
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
		expect(image.attachment as Buffer).toMatchImageSnapshot();
	});
});
