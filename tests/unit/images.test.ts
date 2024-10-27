import { readFile, writeFile } from 'node:fs/promises';
import deepEqual from 'fast-deep-equal';
import { Bank, Monsters } from 'oldschooljs';
import { describe, test } from 'vitest';

import { MUserClass } from '../../src/lib/MUser';
import { drawChestLootImage } from '../../src/lib/bankImage';
import { clImageGenerator } from '../../src/lib/collectionLogTask';
import { BOT_TYPE } from '../../src/lib/constants';
import { pohImageGenerator } from '../../src/lib/pohImage';
import { type ChartOptions, createApexChartConfig, createChart } from '../../src/lib/util/chart';
import { mahojiChatHead } from '../../src/lib/util/chatHeadImage';
import { makeBankImage } from '../../src/lib/util/makeBankImage';
import { mockMUser } from './userutil';

describe('Images', async () => {
	await bankImageGenerator.ready;

	test('Chat Heads', async () => {
		const result = await mahojiChatHead({
			content:
				'Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test Test',
			head: 'santa'
		});
		await writeFile(`tests/unit/snapshots/chatHead.${BOT_TYPE}.png`, result.files[0].attachment);
	});

	test('Collection Log', async () => {
		// @ts-expect-error
		global.prisma = { userStats: { upsert: () => {} } };
		MUserClass.prototype.fetchStats = async () => {
			return { monster_scores: {} } as any;
		};
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
		} as any);
		await writeFile(`tests/unit/snapshots/cl.${BOT_TYPE}.png`, result.files[0].attachment);
	});

	test('Bank Image', async () => {
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

	test('POH Image', async () => {
		const result = await pohImageGenerator.run({
			prayer_altar: 13_197,
			throne: 13_667,
			torch: 13_342,
			mounted_cape: 29_210,
			background_id: 1
		} as any);
		await writeFile(`tests/unit/snapshots/poh.${BOT_TYPE}.png`, result);
	});

	test('Charts', async () => {
		const sampleData: Record<'kmb' | 'percent', ChartOptions['values'][]> = {
			percent: [
				[
					['Magna', 55],
					['Cyr', 45]
				]
			],
			kmb: [
				[
					['Twisted bow', 5_000_000_000],
					['Egg', 1_500_000_000],
					['Cat', 500_000_000],
					['Dog', 2500_000_000],
					['Trout', 4500_000_000]
				]
			]
		} as const;

		for (const chartType of ['bar', 'line'] as const) {
			for (const format of ['kmb', 'percent'] as const) {
				const chartOptions: ChartOptions = {
					type: chartType,
					title: `${chartType} ${format} title`,
					values: sampleData[format][0],
					format: format
				};

				const config = createApexChartConfig(chartOptions);
				const configFilePath = `tests/unit/snapshots/chart.${chartType}.${format}.json`;
				const existingConfigRaw = await readFile(configFilePath, 'utf-8').catch(() => null);
				if (existingConfigRaw) {
					const existingConfig = JSON.parse(existingConfigRaw);
					if (deepEqual(existingConfig, config)) {
						console.log(`Skipping ${chartType} ${format} chart, no changes.`);
						continue;
					}
				}

				const res = await createChart(chartOptions);
				await writeFile(`tests/unit/snapshots/chart.${chartType}.${format}.png`, res);
				await writeFile(configFilePath, `${JSON.stringify(config, null, 4)}\n`);
			}
		}
	});

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
		await writeFile(`tests/unit/snapshots/toa.${BOT_TYPE}.png`, image.attachment);
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
		await writeFile(`tests/unit/snapshots/cox.${BOT_TYPE}.png`, image.attachment);
	});
});
