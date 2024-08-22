import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { GearStat } from '../../../gear/types';
import itemID from '../../../util/itemID';
import type { KillableMonster } from '../../types';

export const creatureCreationCreatures: KillableMonster[] = [];
const creatures = [
	[Monsters.Newtroost, new Bank().add('Eye of newt').add('Feather').freeze()],
	[Monsters.Unicow, new Bank().add('Cowhide').add('Unicorn horn').freeze()],
	[Monsters.Spidine, new Bank().add("Red spiders' eggs").add('Raw sardine').freeze()],
	[Monsters.Swordchick, new Bank().add('Raw swordfish').add('Raw chicken').freeze()],
	[Monsters.Jubster, new Bank().add('Raw jubbly').add('Raw lobster').freeze()],
	[Monsters.Frogeel, new Bank().add('Raw cave eel').add('Giant frog legs').freeze()]
] as const;
for (const [creature, cost] of creatures) {
	creatureCreationCreatures.push({
		id: creature.id,
		name: creature.name,
		aliases: creature.aliases,
		timeToFinish: Time.Minute * 1.3,
		table: creature,
		defaultAttackStyles: [SkillsEnum.Attack],
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged],
		itemCost: {
			itemCost: cost,
			qtyPerKill: 1
		},
		qpRequired: 35,
		itemInBankBoosts: [
			{
				[itemID('Bandos chestplate')]: 13,
				[itemID('Torva platebody')]: 13
			},
			{
				[itemID('Bandos tassets')]: 13,
				[itemID('Torva platelegs')]: 13
			},
			{
				[itemID('Dragon claws')]: 11
			},
			{
				[itemID('Abyssal whip')]: 15
			},
			{
				[itemID('Dragon defender')]: 15
			},
			{
				[itemID('Amulet of torture')]: 15,
				[itemID('Amulet of fury')]: 6
			},
			{
				[itemID('Infernal cape')]: 15,
				[itemID('Fire cape')]: 6
			},
			{
				[itemID('Primordial boots')]: 15,
				[itemID('Dragon boots')]: 6
			}
		]
	});
}
