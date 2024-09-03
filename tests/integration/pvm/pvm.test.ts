import { Bank, EMonster, Monsters } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { convertLVLtoXP, resolveItems } from '../../../src/lib/util';
import { minionKCommand } from '../../../src/mahoji/commands/k';
import { createTestUser, mockClient, mockUser } from '../util';

describe('PVM', async () => {
	const client = await mockClient();
	expect(Monsters.Man.id).toBe(EMonster.MAN);

	it('Should add KC', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(minionKCommand, { name: 'man' });
		expect(res).toContain('now killing');
		await client.processActivities();
		expect(await user.getKC(EMonster.MAN)).toBeGreaterThan(1);
	});

	it('Should remove food', async () => {
		const user = await createTestUser(new Bank().add('Shark', 1000), {
			skills_prayer: convertLVLtoXP(70),
			skills_strength: convertLVLtoXP(70),
			QP: 100
		});
		const res = await user.runCommand(minionKCommand, { name: 'general graardor' });
		expect(res).toContain('now killing');
		await user.processActivities(client);
		const kc = await user.getKC(EMonster.GENERAL_GRAARDOR);
		expect(kc).toEqual(4);
		expect(user.bank.amount('Shark')).toBeLessThan(1000);
		expect(user.bank.amount('Big bones')).toEqual(kc);
	});

	it('Should remove charges', async () => {
		const user = await mockUser({
			rangeGear: resolveItems(['Venator bow']),
			rangeLevel: 70,
			venatorBowCharges: 1000,
			slayerLevel: 70
		});
		const res = await user.runCommand(minionKCommand, { name: 'bloodveld' }, true);
		expect(res).toContain('now killing');
		await user.processActivities(client);
		const kc = await user.getKC(EMonster.BLOODVELD);
		expect(kc).toBeGreaterThan(0);
		expect(user.bank.amount('Shark')).toBeLessThan(1000);
		expect(user.user.venator_bow_charges).toBeLessThan(1000);
	});

	it('Should handle slayer progress', async () => {
		const user = await client.mockUser({
			rangeGear: resolveItems(['Venator bow']),
			rangeLevel: 70,
			venatorBowCharges: 1000,
			slayerLevel: 70
		});
		await prisma.slayerTask.deleteMany({
			where: {
				user_id: user.id
			}
		});
		await prisma.slayerTask.create({
			data: {
				user_id: user.id,
				quantity: 1000,
				quantity_remaining: 1000,
				slayer_master_id: 4,
				monster_id: EMonster.BLOODVELD,
				skipped: false
			}
		});
		const res = await user.runCommand(minionKCommand, { name: 'bloodveld' }, true);
		expect(res).toContain('now killing');
		await user.processActivities(client);
		const kc = await user.getKC(EMonster.BLOODVELD);
		expect(kc).toBeGreaterThan(0);
		expect(user.bank.amount('Shark')).toBeLessThan(1000);
		expect(user.user.venator_bow_charges).toBeLessThan(1000);
		expect(user.user.skills_slayer).toBeGreaterThan(convertLVLtoXP(70));
	});

	it('Should fail to kill without itemCost', async () => {
		const user = await client.mockUser({
			venatorBowCharges: 1000,
			slayerLevel: 70
		});
		expect(await user.runCommand(minionKCommand, { name: 'hydra' }, true)).to.contain('You need Boots of stone');
		await user.equip('melee', resolveItems(['Boots of stone']));
		expect(await user.runCommand(minionKCommand, { name: 'hydra' }, true)).to.contain(
			"You don't meet the skill requirement"
		);
		await user.setLevel('slayer', 95);
		expect(await user.runCommand(minionKCommand, { name: 'hydra' }, true)).to.contain("You don't have the items");
		await user.addItemsToBank({ items: new Bank().add('Anti-venom+(4)', 1) });
		const result = await user.kill(EMonster.HYDRA);
		expect(result.commandResult).to.contain('is now killing 10x Hydra');
		expect(user.bank.amount('Anti-venom+(4)')).toEqual(0);
	});

	it('shouldnt let you barrage bloodvelds', async () => {
		const user = await client.mockUser({
			slayerLevel: 70,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.BLOODVELD, { method: 'barrage' });
		expect(result.commandResult).toEqual('Bloodveld cannot be barraged or burst.');
	});

	it('should check slayer level requirement', async () => {
		const user = await client.mockUser({
			slayerLevel: 70,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.NECHRYAEL, { method: 'barrage' });
		expect(result.commandResult).toContain("You don't meet the skill requirements");
	});

	it('cant barrage nechs', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.NECHRYAEL, { method: 'barrage' });
		expect(result.commandResult).toEqual('Nechryael cannot be barraged or burst.');
	});

	it('barrages abby demons', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.xpGained.magic).toBeGreaterThan(0);
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Water rune')).toBeLessThan(10000000);
		expect(user.bank.amount('Death rune')).toBeLessThan(1000);
		expect(result.commandResult).toContain('is now killing ');
		expect(result.newKC).toBeGreaterThan(0);
	});
});
