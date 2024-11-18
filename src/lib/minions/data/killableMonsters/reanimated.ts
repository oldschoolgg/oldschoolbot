import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { GearStat } from '../../../gear/types';
import { XPBank } from '../../../structures/Bank';
import type { KillableMonster } from '../../types';

const renanimatedMonstersRaw = [
	{
		mon: Monsters.ReanimatedGoblin,
		cost: new Bank().add('Ensouled goblin head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 130
	},
	{
		mon: Monsters.ReanimatedMonkey,
		cost: new Bank().add('Ensouled monkey head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 182
	},
	{
		mon: Monsters.ReanimatedImp,
		cost: new Bank().add('Ensouled imp head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 286
	},
	{
		mon: Monsters.ReanimatedMinotaur,
		cost: new Bank().add('Ensouled minotaur head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 364
	},
	{
		mon: Monsters.ReanimatedScorpion,
		cost: new Bank().add('Ensouled scorpion head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 454
	},
	{
		mon: Monsters.ReanimatedBear,
		cost: new Bank().add('Ensouled bear head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 480
	},
	{
		mon: Monsters.ReanimatedUnicorn,
		cost: new Bank().add('Ensouled unicorn head').add('Body rune', 4).add('Nature rune', 2),
		magicLvl: 16,
		magicXP: 32,
		prayerXP: 494
	},
	//
	{
		mon: Monsters.ReanimatedDog,
		cost: new Bank().add('Ensouled dog head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 520
	},
	{
		mon: Monsters.ReanimatedChaosDruid,
		cost: new Bank().add('Ensouled chaos druid head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 584
	},
	{
		mon: Monsters.ReanimatedGiant,
		cost: new Bank().add('Ensouled giant head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 650
	},
	{
		mon: Monsters.ReanimatedOgre,
		cost: new Bank().add('Ensouled ogre head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 716
	},
	{
		mon: Monsters.ReanimatedElf,
		cost: new Bank().add('Ensouled elf head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 754
	},
	{
		mon: Monsters.ReanimatedTroll,
		cost: new Bank().add('Ensouled troll head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 780
	},
	{
		mon: Monsters.ReanimatedHorror,
		cost: new Bank().add('Ensouled horror head').add('Body rune', 4).add('Nature rune', 3).add('Soul rune'),
		magicLvl: 41,
		magicXP: 80,
		prayerXP: 832
	},
	//
	{
		mon: Monsters.ReanimatedKalphite,
		cost: new Bank().add('Ensouled kalphite head').add('Blood rune').add('Nature rune', 3).add('Soul rune', 2),
		magicLvl: 72,
		magicXP: 138,
		prayerXP: 884
	},
	{
		mon: Monsters.ReanimatedDagannoth,
		cost: new Bank().add('Ensouled dagannoth head').add('Blood rune').add('Nature rune', 3).add('Soul rune', 2),
		magicLvl: 72,
		magicXP: 138,
		prayerXP: 936
	},
	{
		mon: Monsters.ReanimatedBloodveld,
		cost: new Bank().add('Ensouled bloodveld head').add('Blood rune').add('Nature rune', 3).add('Soul rune', 2),
		magicLvl: 72,
		magicXP: 138,
		prayerXP: 1040
	},
	{
		mon: Monsters.ReanimatedTzhaar,
		cost: new Bank().add('Ensouled tzhaar head').add('Blood rune').add('Nature rune', 3).add('Soul rune', 2),
		magicLvl: 72,
		magicXP: 138,
		prayerXP: 1104
	},
	{
		mon: Monsters.ReanimatedDemon,
		cost: new Bank().add('Ensouled demon head').add('Blood rune').add('Nature rune', 3).add('Soul rune', 2),
		magicLvl: 72,
		magicXP: 138,
		prayerXP: 1170
	},
	{
		mon: Monsters.ReanimatedHellhound,
		cost: new Bank().add('Ensouled hellhound head').add('Blood rune').add('Nature rune', 3).add('Soul rune', 2),
		magicLvl: 72,
		magicXP: 138,
		prayerXP: 1200
	},
	{
		mon: Monsters.ReanimatedAviansie,
		cost: new Bank().add('Ensouled aviansie head').add('Blood rune', 2).add('Nature rune', 4).add('Soul rune', 4),
		magicLvl: 90,
		magicXP: 170,
		prayerXP: 1234
	},
	{
		mon: Monsters.ReanimatedAbyssal,
		cost: new Bank().add('Ensouled abyssal head').add('Blood rune', 2).add('Nature rune', 4).add('Soul rune', 4),
		magicLvl: 90,
		magicXP: 170,
		prayerXP: 1300
	},
	{
		mon: Monsters.ReanimatedDragon,
		cost: new Bank().add('Ensouled dragon head').add('Blood rune', 2).add('Nature rune', 4).add('Soul rune', 4),
		magicLvl: 90,
		magicXP: 170,
		prayerXP: 1560
	}
];

export const reanimatedMonsters: KillableMonster[] = [];

for (const { mon, magicLvl, cost, prayerXP, magicXP } of renanimatedMonstersRaw) {
	reanimatedMonsters.push({
		id: mon.id,
		name: mon.name,
		aliases: mon.aliases,
		timeToFinish: magicLvl > 28 ? 13.2 * Time.Second : 8.1 * Time.Second,
		table: mon,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		healAmountNeeded: magicLvl,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		itemCost: {
			qtyPerKill: 1,
			itemCost: cost
		},
		levelRequirements: {
			magic: magicLvl
		},
		effect: ({ quantity }) => {
			const xpBank = new XPBank();
			xpBank.add('prayer', prayerXP * quantity);
			xpBank.add('magic', magicXP * quantity);
			return {
				xpBank,
				messages: [
					`You reanimated ${quantity}x ${mon.name} and received ${prayerXP * quantity} Prayer XP and ${magicXP * quantity} Magic XP.`
				]
			};
		}
	});
}
