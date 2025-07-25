import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Bank } from 'oldschooljs';
import { describe, test } from 'vitest';

import { drawChestLootImage } from '@/lib/canvas/chestImage';
import { baseSnapshotPath } from '../testConstants';

describe('Chest Images', async () => {
	test('TOA Chest Loot Image', async () => {
		const loot = new Bank().add('Fang', 1).add('Masori mask', 1).add('Thread of elidinis', 1).add('Coins', 50000);

		const previousCL = new Bank().add('Coins', 1000000);

		const mockUser = {
			rawUsername: 'TestUser',
			user: { bankBackground: 1 },
			iconPackId: undefined
		} as any;

		const result = await drawChestLootImage({
			entries: [
				{
					previousCL,
					user: mockUser,
					loot,
					customTexts: [{ x: 10, y: 200, text: 'Purple!' }]
				}
			],
			type: 'Tombs of Amascut'
		});

		await writeFile(path.join(baseSnapshotPath, 'chest-toa.png'), result.attachment);
	});

	test('TOB Chest Loot Image', async () => {
		const loot = new Bank().add('Scythe of vitur', 1).add('Justiciar chestguard', 1).add('Coins', 25000);

		const previousCL = new Bank();

		const mockUser = {
			rawUsername: 'TestUser',
			user: { bankBackground: 1 },
			iconPackId: undefined
		} as any;

		const result = await drawChestLootImage({
			entries: [
				{
					previousCL,
					user: mockUser,
					loot,
					customTexts: []
				}
			],
			type: 'Theatre of Blood'
		});

		await writeFile(path.join(baseSnapshotPath, 'chest-tob.png'), result.attachment);
	});

	test('COX Chest Loot Image', async () => {
		const loot = new Bank().add('Twisted bow', 1).add('Dragon claws', 1).add('Coins', 15000);

		const previousCL = new Bank();

		const mockUser = {
			rawUsername: 'TestUser',
			user: { bankBackground: 1 },
			iconPackId: undefined
		} as any;

		const result = await drawChestLootImage({
			entries: [
				{
					previousCL,
					user: mockUser,
					loot,
					customTexts: []
				}
			],
			type: 'Chambers of Xerician'
		});

		await writeFile(path.join(baseSnapshotPath, 'chest-cox.png'), result.attachment);
	});

	test('Multiple Users Chest Loot', async () => {
		const loot1 = new Bank().add('Fang', 1).add('Coins', 30000);
		const loot2 = new Bank().add('Lightbearer', 1).add('Coins', 45000);

		const previousCL = new Bank();

		const mockUser1 = {
			rawUsername: 'User1',
			user: { bankBackground: 1 },
			iconPackId: undefined
		} as any;

		const mockUser2 = {
			rawUsername: 'User2',
			user: { bankBackground: 1 },
			iconPackId: undefined
		} as any;

		const result = await drawChestLootImage({
			entries: [
				{ previousCL, user: mockUser1, loot: loot1, customTexts: [] },
				{ previousCL, user: mockUser2, loot: loot2, customTexts: [] }
			],
			type: 'Tombs of Amascut'
		});
		await writeFile(path.join(baseSnapshotPath, 'chest-multiple-users.png'), result.attachment);
	});
});
