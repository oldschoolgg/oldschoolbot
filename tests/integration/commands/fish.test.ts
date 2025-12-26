import { increaseNumByPercent } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP, EItem, ItemGroups } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { MAX_LEVEL } from '../../../src/lib/constants.js';
import { XP_MULTIPLIER } from '../../testConstants.js';
import { createTestUser, mockClient } from '../util.js';

describe('Fish Command', async () => {
	const client = await mockClient();

	it('should handle insufficient fishing level', async () => {
		const user = await createTestUser();
		const res = await user.runCommand('fish', { name: 'trout', quantity: 1 });
		expect(res).toEqual('<:minion:778418736180494347> Your minion needs 20 Fishing to fish Trout.');
	});

	it('should handle insufficient QP', async () => {
		const user = await createTestUser();
		await user.update({
			skills_fishing: 9_999_999,
			QP: 0
		});
		const res = await user.runCommand('fish', { name: 'karambwanji', quantity: 1 });
		expect(res).toEqual('You need 15 qp to catch those!');
	});

	it('should handle invalid fish', async () => {
		const user = await createTestUser();
		const res = await user.runCommand('fish', { name: 'asdf' });
		expect(res).toEqual('Thats not a valid fish to catch.');
	});

	it('should handle insufficient barb fishing levels', async () => {
		const user = await createTestUser();
		await user.update({ skills_fishing: 1 });
		const res = await user.runCommand('fish', { name: 'Barbarian fishing' });
		expect(res).toEqual('<:minion:778418736180494347> Your minion needs 48 Fishing to fish Barbarian fishing.');
	});

	it('should fish', async () => {
		const user = await createTestUser();
		const res = await user.runCommand('fish', { name: 'shrimps' });
		expect(res).toContain('is now fishing 251x Shrimps');
	});

	it('should fail to do barb fish when has no feathers', async () => {
		const user = await createTestUser();
		await user.update({
			skills_fishing: 999_999,
			skills_agility: 999_999,
			skills_strength: 999_999
		});

		await user.setBank(new Bank());
		await user.equip('skilling', [EItem.PEARL_BARBARIAN_ROD]);
		const res = await user.runCommand('fish', { name: 'Barbarian fishing' });
		expect(res).toEqual('You need Feather to fish Barbarian fishing!');
	});

	it('should do barb fishing when has feathers', async () => {
		const user = await createTestUser();
		await user.update({
			skills_fishing: 999_999,
			skills_agility: 999_999,
			skills_strength: 999_999
		});
		await user.setBank(new Bank().add('Feather', 100));
		const res = await user.runCommand('fish', { name: 'Barbarian fishing' });
		expect(res).toContain('is now fishing 100x Barbarian fishing');
	});

	it('should fish barrel boost', async () => {
		const user = await client.mockUser({ maxed: true });
		await user.equip('skilling', [EItem.FISH_SACK_BARREL]);
		expect(user.skillsAsLevels.fishing).toBe(MAX_LEVEL);
		const res = await user.runCommand('fish', { name: 'shrimps' });
		expect(res).toContain('+9 trip minutes for having a Fish sack barrel');
	});

	it('should handle using flakes without flakes in bank', async () => {
		const user = await createTestUser();
		const res = await user.runCmdAndTrip('fish', { name: 'shrimps', flakes: true });
		expect(res.commandResult).toEqual('You need to have at least one Spirit flake!');
	});

	it('should fish with flakes', async () => {
		const user = await createTestUser();
		await user.setBank(new Bank({ 'Spirit flakes': 100 }));
		const { commandResult } = await user.runCmdAndTrip('fish', {
			name: 'shrimps',
			flakes: true,
			quantity: 50
		});
		expect(commandResult).toContain('is now fishing 50x Shrimps');
		expect(user.bank.amount('Raw shrimps')).toBeGreaterThan(50);
		expect(user.bank.amount('Spirit flakes')).toEqual(50);
	});

	it('should still use flakes if bank contains fewer flakes than fish quantity', async () => {
		const user = await createTestUser();
		await user.transactItems({ itemsToAdd: new Bank({ 'Spirit flakes': 100 }) });
		const res = await user.runCommand('fish', { name: 'shrimps', flakes: true });
		expect(res).toContain('is now fishing');
	});

	it('should use fishing bait', async () => {
		const user = await createTestUser();
		// @ts-expect-error
		await user.update({ skills_fishing: 100_000, bank: new Bank({ 'Fishing bait': 100 }) });
		const { commandResult } = await user.runCmdAndTrip('fish', { name: 'sardine', quantity: 50 });
		expect(commandResult).toContain('is now fishing 50x Sardine');
		expect(user.bank.amount('Fishing bait')).toEqual(50);
		expect(user.bank.amount('Raw sardine')).toEqual(50);
		expect(user.skillsAsXP.fishing).toEqual(100_000 + 50 * 20 * XP_MULTIPLIER);
	});

	it('should not let you fish without fishing bait', async () => {
		const user = await createTestUser();
		await user.update({ skills_fishing: 100_000 });
		const res = await user.runCommand('fish', { name: 'sardine', quantity: 50 });
		expect(res).toContain('You need Fishing bait');
	});

	it.skip('should give angler boost', async () => {
		const user = await createTestUser();
		await user.equip('skilling', ItemGroups.anglerOutfit);
		const startingXP = convertLVLtoXP(80);
		await user.update({ skills_fishing: startingXP });
		const { commandResult } = await user.runCmdAndTrip('fish', { name: 'lobster', quantity: 50 });
		expect(commandResult).toContain('is now fishing 50x Lobster');
		expect(user.bank.amount('Raw lobster')).toEqual(50);
		const xpToReceive = 50 * 90 * XP_MULTIPLIER;
		const xpWithAnglerBoost = increaseNumByPercent(xpToReceive, 2.5);
		expect(user.skillsAsXP.fishing).toEqual(Math.ceil(startingXP + xpWithAnglerBoost));
	});
});
