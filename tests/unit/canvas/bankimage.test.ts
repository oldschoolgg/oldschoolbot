import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Bank, EItem, Monsters } from 'oldschooljs';
import { describe, test } from 'vitest';

import { IconPackID } from '@/lib/canvas/iconPacks';
import { makeBankImage } from '@/lib/util/makeBankImage';
import { baseSnapshotPath } from '../utils';

describe('Images', async () => {
	await bankImageGenerator.ready;
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
		await writeFile(path.join(baseSnapshotPath, 'bank-basic.png'), result.file.attachment);
	});

	test('Icon Pack Bank Image', async () => {
		const bank = new Bank();
		for (const item of testItems) {
			bank.add(item);
		}
		const result = await makeBankImage({
			bank,
			title: 'Icon Pack Bank Image',
			iconPackId: IconPackID.Halloween
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-iconpack.png'), result.file.attachment);
	});

	test('Local Item Icon Bank Image', async () => {
		const bank = new Bank();
		for (const item of [...testItems, 20]) {
			bank.add(item);
		}
		const result = await makeBankImage({
			bank,
			title: 'Local Item Icon Bank Image'
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-localicon.png'), result.file.attachment);
	});

	test('New CL Item Purple Outline', async () => {
		const bank = new Bank().add('Egg').add('Coal').add('Trout').add('Twisted bow');
		const result = await makeBankImage({
			bank,
			title: 'Local Item Icon Bank Image',
			previousCL: new Bank().add('Trout'),
			showNewCL: true
		});
		await writeFile(path.join(baseSnapshotPath, 'bank-new-cl.png'), result.file.attachment);
	});
});
