import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Bank, EItem, Monsters } from 'oldschooljs';
import { describe, test } from 'vitest';

import { bankImageTask } from '@/lib/canvas/bankImage.js';
import { IconPackID } from '@/lib/canvas/iconPacks.js';
import { allCLItems } from '@/lib/data/Collections.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { baseSnapshotPath } from '../../testConstants.js';

describe('Bank Images', async () => {
	const testItems = [...Monsters.Cow.allItems, ...Monsters.CorporealBeast.allItems, EItem.PHOENIX];

	test('Basic Bank Image', async () => {
		const bank = new Bank();
		for (const item of testItems) {
			bank.add(item);
		}
		const result = await makeBankImage({
			bank,
			title: 'Test Image'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-basic.png'), result.buffer);
	});

	test('Bank Flags - Show Price', async () => {
		const bank = new Bank().add('Twisted bow').add('Dragon claws').add('Ancestral hat');
		const result = await makeBankImage({
			bank,
			title: 'Show Price',
			mahojiFlags: ['show_price']
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-show-price.png'), result.buffer);
	});

	test('Bank Flags - Show Market Price', async () => {
		const bank = new Bank().add('Twisted bow').add('Dragon claws').add('Ancestral hat');
		const result = await makeBankImage({
			bank,
			title: 'Show Market Price',
			mahojiFlags: ['show_market_price']
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-show-market-price.png'), result.buffer);
	});

	test('Bank Flags - Show Item IDs', async () => {
		const bank = new Bank().add('Twisted bow').add('Dragon claws').add('Ancestral hat');
		const result = await makeBankImage({
			bank,
			title: 'Show Item IDs',
			mahojiFlags: ['show_id']
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-show-ids.png'), result.buffer);
	});

	test('Bank Flags - Show Names', async () => {
		const bank = new Bank().add('Twisted bow').add('Dragon claws').add('Ancestral hat');
		const result = await makeBankImage({
			bank,
			title: 'Show Names',
			mahojiFlags: ['show_names']
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-show-names.png'), result.buffer);
	});

	test('Bank Flags - Wide Mode', async () => {
		const bank = new Bank();
		for (const item of testItems) {
			bank.add(item, 100);
		}
		const result = await makeBankImage({
			bank,
			title: 'Wide Mode',
			mahojiFlags: ['wide']
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-wide-mode.png'), result.buffer);
	});

	test('Compact Mode (Large Bank)', async () => {
		const bank = new Bank();
		// Add many items to trigger compact mode
		for (let i = 0; i < 600; i++) {
			bank.add(testItems[i % testItems.length], i + 1);
		}
		const result = await makeBankImage({
			bank,
			title: 'Compact Mode'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-compact.png'), result.buffer);
	});

	test('Different Background', async () => {
		const bank = new Bank();
		for (const item of testItems.slice(0, 10)) {
			bank.add(item);
		}
		const result = await bankImageTask.generateBankImage({
			bank,
			title: 'Different Background',
			bankBackgroundId: 5
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-bg-5.png'), result.image);
	});

	test('Transparent Background with Hex Color', async () => {
		const bank = new Bank();
		for (const item of testItems.slice(0, 10)) {
			bank.add(item);
		}
		const result = await bankImageTask.generateBankImage({
			bank,
			title: 'Transparent with Hex',
			bankBackgroundId: 17,
			bankBgHexColor: '#FF0000'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-transparent-hex.png'), result.image!);
	});

	test('Paged Bank Image', async () => {
		const bank = new Bank();
		for (const item of Array.from(allCLItems)
			.sort((a, b) => a - b)
			.slice(0, 200)) {
			bank.add(item);
		}

		const result = await makeBankImage({
			bank,
			title: 'Page 2',
			flags: { page: 2 }
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-page-2.png'), result.buffer);
	});

	test('Forced Short Names', async () => {
		const bank = new Bank()
			.add('Guam leaf', 100)
			.add('Ranarr weed', 50)
			.add('Snapdragon', 25)
			.add('Clue scroll (elite)', 5)
			.add('Oak logs', 1000);

		const result = await makeBankImage({
			bank,
			title: 'Forced Short Names'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-short-names.png'), result.buffer);
	});

	test('Icon Pack Bank Image', async () => {
		const bank = new Bank();
		for (const item of testItems.slice(0, 10)) {
			bank.add(item);
		}
		const result = await makeBankImage({
			bank,
			title: 'Icon Pack Bank Image',
			iconPackId: IconPackID.Halloween
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-iconpack.png'), result.buffer);
	});

	test('New CL Item Purple Outline', async () => {
		const bank = new Bank().add('Egg').add('Coal').add('Trout').add('Twisted bow');
		const result = await makeBankImage({
			bank,
			title: 'New CL Items',
			previousCL: new Bank().add('Trout'),
			showNewCL: true
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-new-cl.png'), result.buffer);
	});

	test('Empty Bank', async () => {
		const bank = new Bank();
		const result = await makeBankImage({
			bank,
			title: 'Empty Bank'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-empty.png'), result.buffer);
	});

	test('Single Item Bank', async () => {
		const bank = new Bank().add('Twisted bow', 1);
		const result = await makeBankImage({
			bank,
			title: 'Single Item'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-single-item.png'), result.buffer);
	});
});
