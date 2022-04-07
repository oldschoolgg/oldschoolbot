import { Time } from 'e';
import { LootTable, Monsters } from 'oldschooljs';

import { GearStat } from '../../../../gear';
import { CustomMonster } from './customMonsters';

export const Olof: CustomMonster = {
	id: 39_186,
	name: 'Olof',
	aliases: ['olof', 'fool'],
	timeToFinish: Time.Minute * 20,
	table: new LootTable()
		.add('Bronze arrow')
		.add('Bones')
		.add('Bronze bar')
		.add('Bronze knife')
		.add('Beer')
		.add('Bronze wire')
		.add('Copper ore')
		.add('Bronze dagger')
		.add('Tin ore')
		.add('Silk')
		.add('Pot of flour')
		.add('Molten glass')
		.add("Olof's gold"),
	qpRequired: 5,
	healAmountNeeded: 100 * 20,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackSlash],
	groupKillable: false,
	respawnTime: Time.Minute,
	levelRequirements: {
		dungeoneering: 33
	},
	baseMonster: Monsters.BlackDemon,
	hp: 657
};
