import { Bank, EItem, EMonster, Monsters } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import { CombatCannonItemBank } from '../../../src/lib/minions/data/combatConstants';
import { getPOHObject } from '../../../src/lib/poh';
import { SkillsEnum } from '../../../src/lib/skilling/types';
import { Gear } from '../../../src/lib/structures/Gear';
import { calcPerHour, convertLVLtoXP, itemID, resolveItems } from '../../../src/lib/util';
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
			slayerLevel: 70,
			bank: new Bank().add('Shark', 10000)
		});
		expect(await user.runCommand(minionKCommand, { name: 'hydra' }, true)).to.contain('You need Boots of stone');
		await user.equip('melee', resolveItems(['Boots of stone']));
		expect(await user.runCommand(minionKCommand, { name: 'hydra' }, true)).to.contain(
			"You don't meet the skill requirement"
		);
		await user.setLevel('slayer', 95);
		const x = await user.runCommand(minionKCommand, { name: 'hydra' }, true);
		expect(x).to.contain("You don't have the items");
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
		const result = await user.kill(EMonster.BLOODVELD, { method: 'barrage', shouldFail: true });
		expect(result.commandResult).toEqual('Bloodveld cannot be barraged or burst.');
	});

	it('should check slayer level requirement', async () => {
		const user = await client.mockUser({
			slayerLevel: 70,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.NECHRYAEL, { method: 'barrage', shouldFail: true });
		expect(result.commandResult).toContain("You don't meet the skill requirements");
	});

	it('cant barrage nechs', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.NECHRYAEL, { method: 'barrage', shouldFail: true });
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
		expect(result.commandResult).toContain('is now killing ');
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Water rune')).toBeLessThan(10000000);
		expect(user.bank.amount('Death rune')).toBeLessThan(1000);
		expect(result.newKC).toBeGreaterThan(0);
		expect(result.xpGained.magic).toBeGreaterThan(0);
	});

	it('should get kodai buff', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Kodai wand'])
		});
		expect(user.gear.mage.weapon?.item).toEqual(itemID('Kodai wand'));
		await user.setAttackStyle([SkillsEnum.Magic]);
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.xpGained.magic).toBeGreaterThan(0);
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Death rune')).toBeLessThan(1000);
		expect(result.newKC).toBeGreaterThan(0);
	});

	it('should get kodai buff even if forced to switch to mage', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Kodai wand'])
		});
		expect(user.gear.mage.weapon?.item).toEqual(itemID('Kodai wand'));
		await user.setAttackStyle([SkillsEnum.Attack]);
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.xpGained.magic).toBeGreaterThan(0);
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Death rune')).toBeLessThan(1000);
		expect(result.commandResult).toContain('% boost for Kodai wand');
		expect(result.commandResult).toContain('% for Ice Barrage');
		expect(result.newKC).toBeGreaterThan(0);
	});

	it('should use cannon', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Cannonball', 100_000).add(CombatCannonItemBank),
			rangeLevel: 99,
			QP: 300,
			maxed: true
		});
		await user.setAttackStyle([SkillsEnum.Ranged]);
		const result = await user.kill(EMonster.MANIACAL_MONKEY, { method: 'cannon' });
		expect(result.xpGained.ranged).toBeGreaterThan(0);
		expect(user.bank.amount('Cannonball')).toBeLessThan(100_000);
		expect(result.newKC).toBeGreaterThan(0);
	});

	it('shouldnt use cannon if no cannonballs', async () => {
		const user = await client.mockUser({
			bank: new Bank().add(CombatCannonItemBank),
			rangeLevel: 99,
			QP: 300,
			maxed: true
		});
		await user.setAttackStyle([SkillsEnum.Ranged]);
		const result = await user.kill(EMonster.MANIACAL_MONKEY, { method: 'cannon', shouldFail: true });
		expect(result.commandResult).toContain("You don't have the items needed to kill this monster");
		expect(user.bank.amount('Cannonball')).toEqual(0);
	});

	it('should use chins', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Red chinchompa', 5000),
			rangeLevel: 99,
			QP: 300,
			maxed: true
		});
		await user.setAttackStyle([SkillsEnum.Ranged]);
		const result = await user.kill(EMonster.MANIACAL_MONKEY, { method: 'chinning' });
		expect(result.commandResult).toContain('% for Red chinchomp');
		expect(user.bank.amount('Red chinchompa')).toBeLessThan(5000);
	});

	it('should give poh boost', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Red chinchompa', 5000).add("Verac's plateskirt"),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			meleeGear: resolveItems(["Verac's flail", "Black d'hide body", "Black d'hide chaps"])
		});
		await prisma.playerOwnedHouse.create({
			data: {
				user_id: user.id,
				pool: getPOHObject('Rejuvenation pool').id
			}
		});
		const result = await user.kill(EMonster.KALPHITE_QUEEN);
		expect(result.commandResult).toContain('10% for Rejuvenation pool');
		expect(result.commandResult).toContain('5% for no food');
		expect(result.commandResult).toContain('15.00% for stats');
	});

	it('should only use 1 skotizo totem', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Dark totem', 100),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			meleeGear: resolveItems(["Verac's flail", "Black d'hide body", "Black d'hide chaps"])
		});
		const result = await user.kill(EMonster.SKOTIZO, { quantity: 1 });
		expect(result.commandResult).toContain('is now killing 1x Skotizo');
		expect(user.bank.amount('Dark totem')).toBe(99);
	});

	describe(
		'should fail to kill skotizo with no totems',
		async () => {
			const user = await client.mockUser({
				rangeLevel: 99,
				QP: 300,
				maxed: true,
				meleeGear: resolveItems(["Verac's flail", "Black d'hide body", "Black d'hide chaps"])
			});
			for (const quantity of [undefined, 1, 2, 5]) {
				it(`should fail to kill with input of ${quantity}`, async () => {
					const result = await user.kill(EMonster.SKOTIZO, { quantity });
					expect(result.commandResult).toContain("You don't have the items");
				});
			}
		},
		{
			repeats: 100
		}
	);

	test('salve and slayer helm shouldnt stack', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Dark totem', 100),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			meleeGear: resolveItems([
				"Verac's flail",
				"Black d'hide body",
				"Black d'hide chaps",
				'Salve amulet (e)',
				'Slayer helmet'
			])
		});
		await user.setAttackStyle([SkillsEnum.Attack]);
		await user.giveSlayerTask(EMonster.ZOMBIE);
		const result = await user.kill(EMonster.ZOMBIE);
		const resultStr = result.commandResult as string;
		expect(resultStr.includes('Salve') && resultStr.includes('Black mask')).toBe(false);
		expect(resultStr).toContain('is now killing');
		expect(result.newKC).toBeGreaterThan(0);
	});

	async function makeAraxxorUser() {
		const user = await client.mockUser({
			maxed: true,
			meleeGear: new Gear({
				head: 'Slayer helmet (i)',
				neck: 'Amulet of torture',
				cape: 'Fire cape',
				body: 'Bandos chestplate',
				legs: 'Bandos tassets',
				hands: 'Ferocious gloves',
				feet: 'Primordial boots',
				ring: 'Berserker ring (i)',
				ammo: "Rada's blessing 3",
				weapon: 'Soulreaper axe'
			}).allItems(false)
		});
		await user.setAttackStyle([SkillsEnum.Attack]);
		await user.giveSlayerTask(EMonster.ARAXYTE);
		return user;
	}

	test('Should be able to use anti-venom(+)/prayer pots with araxxor', async () => {
		const user = await makeAraxxorUser();
		await user.addItemsToBank({
			items: new Bank()
				.add('Anglerfish', 100)
				.add('Cooked karambwan', 100)
				.add('Super combat potion(4)', 100)
				.add('Anti-venom+(4)', 100)
				.add('Prayer potion(4)', 100)
		});
		const result = await user.kill(EMonster.ARAXXOR);
		const resultStr = result.commandResult as string;
		expect(resultStr).toContain('is now killing');
		expect(resultStr).toContain('Anti-venom+(4)');
		expect(resultStr).toContain('Prayer potion(4)');
		expect(user.bank.amount('Anti-venom+(4)')).toBeLessThan(100);
		expect(user.bank.amount('Prayer potion(4)')).toBeLessThan(100);
		expect(result.newKC).toBeGreaterThan(0);
	});

	test('Should use teleports for araxxor', async () => {
		const user = await makeAraxxorUser();
		await user.addItemsToBank({
			items: new Bank()
				.add('Anglerfish', 100)
				.add('Cooked karambwan', 100)
				.add('Super combat potion(4)', 100)
				.add('Anti-venom+(4)', 100)
				.add('Prayer potion(4)', 100)
		});
		const firstResult = await user.kill(EMonster.ARAXXOR);
		await user.addItemsToBank({ items: new Bank().add(EItem.SPIDER_CAVE_TELEPORT, 100) });
		const secondResult = await user.kill(EMonster.ARAXXOR);
		expect(secondResult.commandResult).toContain('10% for Spider cave teleport');
		expect(secondResult.activityResult!.id).not.toEqual(firstResult.activityResult!.id);
		expect(secondResult.activityResult!.q).toBeGreaterThan(firstResult.activityResult!.q);
	});

	test('Should only charge as much cannonballs for what kills you actually do', async () => {
		const user = await makeAraxxorUser();
		await user.addItemsToBank({
			items: new Bank()
				.add('Anglerfish', 100)
				.add('Cooked karambwan', 100)
				.add('Super combat potion(4)', 100)
				.add('Anti-venom+(4)', 100)
				.add('Prayer potion(4)', 100)
				.add('Cannonball', 100_000)
				.add(CombatCannonItemBank)
		});
		await user.giveSlayerTask(EMonster.ARAXYTE, 100);
		await user.kill(EMonster.ARAXYTE, { method: 'cannon' });
		expect(user.bank.amount('Cannonball')).toBeGreaterThan(100_000 - 200);
	});

	it('should give a scythe boost and deduct charges', async () => {
		const user = await makeAraxxorUser();
		await user.equip('melee', [
			EItem.PRIMORDIAL_BOOTS,
			EItem.INFERNAL_MAX_CAPE,
			EItem.FEROCIOUS_GLOVES,
			EItem.AMULET_OF_TORTURE,
			EItem.INQUISITORS_MACE,
			EItem.INQUISITORS_HAUBERK,
			EItem.INQUISITORS_PLATESKIRT
		]);
		await user.addItemsToBank({
			items: new Bank()
				.add('Anglerfish', 100)
				.add('Cooked karambwan', 100)
				.add('Super combat potion(4)', 100)
				.add('Anti-venom+(4)', 100)
				.add('Prayer potion(4)', 100)
				.add('Cannonball', 100_000)
				.add(CombatCannonItemBank)
		});
		await user.update({
			scythe_of_vitur_charges: 100_000
		});

		// Without scythe
		await user.equip('melee', [EItem.SCYTHE_OF_VITUR]);
		await user.giveSlayerTask(EMonster.ARAXYTE, 500);
		const res = await user.kill(EMonster.ARAXXOR);
		expect(res.commandResult).toContain('is now killing');
		expect(res.commandResult).toContain('25% for Scythe of vitur');
		const perHourWithScythe = calcPerHour(res.activityResult!.q, res.activityResult!.duration);

		// With scythe
		await user.giveSlayerTask(EMonster.ARAXYTE, 500);
		await user.equip('melee', [EItem.INQUISITORS_MACE]);
		const res2 = await user.kill(EMonster.ARAXXOR);
		expect(res2.commandResult).toContain('is now killing');
		expect(res2.commandResult).not.toContain('Scythe of vitur');
		const perHourWithoutScythe = calcPerHour(res2.activityResult!.q, res2.activityResult!.duration);

		expect(perHourWithScythe).toBeGreaterThan(perHourWithoutScythe);
		expect(user.user.scythe_of_vitur_charges).toBeLessThan(100_000);
	});
});
