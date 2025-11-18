import { Bank, convertLVLtoXP, EItem, ItemGroups } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { MAX_LEVEL } from '../../../src/lib/constants.js';
import { formatSkillRequirements } from '../../../src/lib/util/smallUtils.js';
import { fishCommand } from '../../../src/mahoji/commands/fish.js';
import { createTestUser, mockClient } from '../util.js';

describe('Fish Command', async () => {
	const client = await mockClient();

	it('should handle insufficient fishing level', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(fishCommand, { name: 'Trout/Salmon', quantity: 1 });
		expect(res).toEqual('<:minion:778418736180494347> Your minion needs 20 Fishing to fish Trout/Salmon.');
	});

	it('should handle insufficient QP', async () => {
		const user = await createTestUser();
		await user.update({
			skills_fishing: 9_999_999,
			QP: 0
		});
		const res = await user.runCommand(fishCommand, { name: 'Karambwanji', quantity: 1 });
		expect(res).toEqual('You need 15 qp to catch those!');
	});

	it('should handle invalid fish', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(fishCommand, { name: 'asdf' });
		expect(res).toEqual('Thats not a valid spot you can fish at.');
	});

	it('should handle insufficient barb fishing levels', async () => {
		const user = await createTestUser();
		await user.update({ skills_fishing: 1 });
		const res = await user.runCommand(fishCommand, { name: 'Barbarian fishing' });
		expect(res).toEqual(
			`To fish Barbarian fishing, you need ${formatSkillRequirements({ agility: 15, strength: 15 })}.`
		);
	});

	it('should fish', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(fishCommand, { name: 'Shrimps/Anchovies' });
		expect(res).toContain('is now fishing Shrimps/Anchovies');
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

		await user.setBank(new Bank({ Feather: 1_000 }));
		await user.equip('skilling', [EItem.PEARL_BARBARIAN_ROD]);

		const res = await user.runCommand(fishCommand, { name: 'Barbarian fishing' });
		expect(res).toContain('is now fishing Barbarian fishing');
	});

	it('should fish barrel boost', async () => {
		const user = await client.mockUser({ maxed: true });
		await user.equip('skilling', [EItem.FISH_SACK_BARREL]);
		expect(user.skillsAsLevels.fishing).toBe(MAX_LEVEL);
		const res = await user.runCommand(fishCommand, { name: 'Shrimps/Anchovies' });
		expect(res).toContain('+9 minutes for Fish barrel');
	});

	it('should handle using flakes without flakes in bank', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(fishCommand, { name: 'Shrimps/Anchovies', spirit_flakes: true });
		expect(res).toEqual('You need to have at least one Spirit flake!');
	});

	it('should fish with flakes', async () => {
		const user = await createTestUser();
		await (user as any).update({ bank: new Bank({ 'Spirit flakes': 1_000 }) });

		const startingFlakes = user.bank.amount('Spirit flakes');
		const startingXP = user.skillsAsXP.fishing;

		const res = await user.runCommand(fishCommand, { name: 'Shrimps/Anchovies', spirit_flakes: true });
		expect(res).toContain('50% more fish from using spirit flakes');
		expect(user.bank.amount('Spirit flakes')).toBeLessThan(startingFlakes);

		await user.runActivity();
		await user.sync();

		expect(user.bank.amount('Spirit flakes')).toBeLessThan(1_000);
		expect(user.skillsAsXP.fishing).toBeGreaterThan(startingXP);
	});

	it('should still use flakes if bank contains fewer flakes than fish quantity', async () => {
		const user = await createTestUser();
		await (user as any).update({ bank: new Bank({ 'Spirit flakes': 100 }) });
		const startingFlakes = user.bank.amount('Spirit flakes');
		const res = await user.runCommand(fishCommand, { name: 'Shrimps/Anchovies', spirit_flakes: true });
		expect(res).toContain('50% more fish from using spirit flakes');
		expect(user.bank.amount('Spirit flakes')).toBeLessThanOrEqual(startingFlakes);
	});

	it('should use fishing bait', async () => {
		const user = await createTestUser();
		await (user as any).update({ skills_fishing: 100_000, bank: new Bank({ 'Fishing bait': 100 }) });

		const res = await user.runCommand(fishCommand, { name: 'Sardine/Herring', quantity: 50 });
		expect(res).toContain('is now fishing Sardine/Herring');

		const baitAfterCommand = user.bank.amount('Fishing bait');
		expect(baitAfterCommand).toBeLessThan(100);

		const startingXP = user.skillsAsXP.fishing;
		await user.runActivity();
		await user.sync();

		expect(user.skillsAsXP.fishing).toBeGreaterThan(startingXP);
	});

	it('should finish trips even if supplies are spent mid-trip', async () => {
		const user = await createTestUser();
		await (user as any).update({
			skills_fishing: 100_000,
			bank: new Bank({ 'Fishing bait': 100, 'Spirit flakes': 50, 'Fishing rod': 1 })
		});

		const res = await user.runCommand(fishCommand, {
			name: 'Sardine/Herring',
			quantity: 25,
			spirit_flakes: true
		});
		expect(res).toContain('is now fishing Sardine/Herring');

		const remainingBait = user.bank.amount('Fishing bait');
		const remainingFlakes = user.bank.amount('Spirit flakes');
		expect(remainingBait).toBeLessThan(100);
		expect(remainingFlakes).toBeLessThan(50);

		const startingXP = user.skillsAsXP.fishing;

		await (user as any).update({ bank: new Bank({ 'Fishing rod': 1 }) });
		await user.runActivity();
		await user.sync();

		expect(user.skillsAsXP.fishing).toBeGreaterThan(startingXP);
	});

	it('should not let you fish without fishing bait', async () => {
		const user = await createTestUser();
		await user.update({ skills_fishing: 100_000 });
		const res = await user.runCommand(fishCommand, { name: 'Sardine/Herring', quantity: 50 });
		expect(res).toContain('You need Fishing bait');
	});

	it('should give angler boost', async () => {
		const user = await createTestUser();
		await user.equip('skilling', ItemGroups.anglerOutfit);

		const startingXP = convertLVLtoXP(80);
		await user.update({ skills_fishing: startingXP });

		const res = await user.runCommand(fishCommand, { name: 'Lobster', quantity: 50 });
		expect(res).toContain('is now fishing Lobster');

		await user.runActivity();
		await user.sync();

		const xpAfter = user.skillsAsXP.fishing;
		expect(xpAfter).toBeGreaterThan(startingXP);
	});
});
