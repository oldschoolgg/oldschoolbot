import { Bank, EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { Time } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import type { ItemBank } from 'oldschooljs/dist/meta/types';
import { gorajanArcherOutfit, gorajanWarriorOutfit } from '../../../src/lib/data/CollectionsExport';
import { CombatCannonItemBank } from '../../../src/lib/minions/data/combatConstants';
import { VasaMagus } from '../../../src/lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { BSOMonsters } from '../../../src/lib/minions/data/killableMonsters/custom/customMonsters';
import { Gear } from '../../../src/lib/structures/Gear';
import { itemID, resolveItems } from '../../../src/lib/util';
import { gearCommand } from '../../../src/mahoji/commands/gear';
import { vasaBISGear } from '../../../src/mahoji/lib/abstracted_commands/vasaCommand';
import { mockClient } from '../util';

describe('BSO PVM', async () => {
	const client = await mockClient();

	it('cant barrage off task', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.xpGained.magic).toEqual(0);
		expect(result.commandResult).not.toContain('Barrage');
		expect(result.newKC).toEqual(0);
	});

	it('can barrage on task', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		await user.giveSlayerTask(EMonster.ABYSSAL_DEMON);
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.xpGained.magic).toBeGreaterThan(0);
		expect(result.commandResult).toContain('Barrage');
		expect(result.newKC).toBeGreaterThan(0);
	});

	it('barrages abby demons if on task', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Ancient staff'])
		});
		await user.giveSlayerTask(EMonster.ABYSSAL_DEMON);
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.commandResult).toContain('is now killing ');
		expect(result.xpGained.magic).toBeGreaterThan(0);
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Water rune')).toBeLessThan(10000000);
		expect(user.bank.amount('Death rune')).toBeLessThan(1000);
		expect(result.newKC).toBeGreaterThan(0);
	});

	it('should get kodai buff', async () => {
		const user = await client.mockUser({
			slayerLevel: 99,
			bank: new Bank().add('Blood rune', 1000).add('Death rune', 1000).add('Water rune', 10000000),
			mageLevel: 99,
			mageGear: resolveItems(['Kodai wand'])
		});
		await user.giveSlayerTask(EMonster.ABYSSAL_DEMON);
		expect(user.gear.mage.weapon?.item).toEqual(itemID('Kodai wand'));
		await user.setAttackStyle([SkillsEnum.Magic]);
		const result = await user.kill(EMonster.ABYSSAL_DEMON, { method: 'barrage' });
		expect(result.xpGained.magic).toBeGreaterThan(0);
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Death rune')).toBeLessThan(1000);
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

	it('should kill vlad', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Red chinchompa', 5000),
			rangeLevel: 99,
			QP: 300,
			maxed: true
		});
		const startingBank = new Bank().add('Shark', 1_000_000).add('Vial of blood', 1000).add('Silver stake', 1000);
		await user.addItemsToBank({ items: startingBank });

		const gear = new Gear();
		gear.equip('Abyssal cape');
		gear.equip('Demonic piercer');
		gear.equip('Armadyl crossbow');
		gear.equip('Armadyl platebody');
		gear.equip("Inquisitor's plateskirt");
		gear.equip('Ranger boots');
		gear.equip("Inquisitor's hauberk");
		gear.equip('Dwarven blessing');
		gear.equip('Amulet of torture');
		gear.equip('Silver bolts', 10_000);

		await user.max();
		await user.update({
			gear_range: gear.raw() as any,
			skills_hitpoints: 200_000_000
		});

		const res = await user.kill(BSOMonsters.VladimirDrakan.id);
		expect(res.commandResult).toContain('now killing');
		await user.sync();

		const quantityKilled = res.activityResult!.q;
		expect(user.bank.amount('Shark')).toBeLessThan(1_000_000);
		expect(user.bank.amount('Vial of blood')).toEqual(1000 - quantityKilled);
		expect(user.bank.amount('Silver stake')).toEqual(1000 - quantityKilled);
		expect(user.gear.range.ammo!.quantity).toBeLessThan(10_000);
	});

	it('should use portable tanner', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Portable tanner', 1).add('Anti-dragon shield'),
			rangeLevel: 99,
			QP: 300,
			maxed: true
		});
		await user.max();
		const previousMats = user.materialsOwned().clone();
		await user.kill(EMonster.GREEN_DRAGON);
		const newMats = user.materialsOwned().clone();
		const leatherGained = user.bank.amount('Green dragon leather');
		expect(user.bank.amount('Green dragonhide')).toBe(0);
		expect(leatherGained).toBeGreaterThan(0);
		expect(newMats.amount('metallic')).toBeLessThan(previousMats.amount('metallic'));
		expect(newMats.amount('plated')).toBeLessThan(previousMats.amount('plated'));
		expect(newMats.amount('organic')).toBeLessThan(previousMats.amount('organic'));
		const userTannerStats = new Bank(
			(await user.fetchStats({ portable_tanner_bank: true })).portable_tanner_bank as ItemBank
		);
		expect(
			userTannerStats.amount('Green dragon leather'),
			`User stats should reflect the tanned leathers (got ${leatherGained}x leather from the trip)`
		).toEqual(leatherGained);
		await client.sync();
		const clientPortableTannerLoot = new Bank(client.data.portable_tanner_loot as ItemBank);
		expect(clientPortableTannerLoot.amount('Green dragon leather')).toEqual(leatherGained);
		expect(clientPortableTannerLoot.length).toBe(1);
	});

	it(
		'should use ori',
		async () => {
			const user = await client.mockUser({
				QP: 300,
				maxed: true
			});
			await user.update({
				minion_equippedPet: itemID('Ori')
			});
			const result = await user.kill(EMonster.MAN, { quantity: 10 });
			expect(result.commandResult).toContain('is now killing 10x');
			expect(user.bank.amount('Bones')).toBeGreaterThan(10);
		},
		{
			retry: 1
		}
	);

	it('should do a vasa trip', async () => {
		const user = await client.mockUser({
			bank: new Bank().add('Elder rune', 5000).add('Saradomin brew(4)', 1000).add('Super restore(4)', 1000),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			mageGear: vasaBISGear.allItems(false)
		});
		await user.setAttackStyle([SkillsEnum.Attack]);
		const result = await user.kill(VasaMagus.id);
		const resultStr = (result.commandResult as any).embeds[0].description as string;
		expect(resultStr).toContain('Your team is off to fight');
	});

	it('should do a >30min trip with hellfire bow and consume arrows', async () => {
		const user = await client.mockUser({
			bank: new Bank()
				.add('Hellfire arrow', 10000)
				.add('Prayer potion(4)', 10000)
				.add('Dragon hunter lance')
				.add('Anti-dragon shield')
				.add('Elder rune', 5000)
				.add('Saradomin brew(4)', 1000)
				.add('Super restore(4)', 1000)
				.add('Saradomin godsword')
				.add('Dragon warhammer')
				.add('Bandos godsword')
				.add('Rocktail', 100_000),
			rangeLevel: 99,
			QP: 300,
			maxed: true,
			meleeGear: resolveItems([...gorajanWarriorOutfit, 'Dwarven blessing']),
			wildyGear: resolveItems(['Ranged master cape', 'Hellfire bow', ...gorajanArcherOutfit])
		});
		await user.runCommand(gearCommand, {
			equip: {
				gear_setup: 'wildy',
				items: '1000 hellfire arrow'
			}
		});
		await global.prisma!.playerOwnedHouse.create({ data: { user_id: user.id, pool: 99_950 } });
		await user.incrementKC(BSOMonsters.Malygos.id, 5000);
		await user.setAttackStyle([SkillsEnum.Ranged]);
		const result = await user.kill(BSOMonsters.Malygos.id, { wilderness: true });
		expect(result.commandResult).toContain('Your minion is now killing ');
		expect(result.commandResult).toContain('3x boost for Hellfire bow');
		expect(result.activityResult?.duration).toBeGreaterThan(Time.Minute * 29.9);
		expect(user.gear.wildy.ammo?.quantity).toBeLessThan(10000);
	});
});
