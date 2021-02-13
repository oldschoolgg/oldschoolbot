import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Time } from './constants';
import { GearSetupTypes, GearStat } from './gear/types';
import { KillableMonster } from './minions/types';
import resolveItems from './util/resolveItems';
import { makeKillTable } from './util/setCustomMonster';

export const torvaOutfit = resolveItems([
	'Torva full helm',
	'Torva platebody',
	'Torva platelegs',
	'Torva boots',
	'Torva gloves'
]);
export const pernixOutfit = resolveItems([
	'Pernix cowl',
	'Pernix body',
	'Pernix chaps',
	'Pernix boots',
	'Pernix gloves'
]);
export const virtusOutfit = resolveItems([
	'Virtus mask',
	'Virtus robe top',
	'Virtus robe legs',
	'Virtus boots',
	'Virtus gloves'
]);
export const ancientWeapons = resolveItems(['Virtus wand', 'Virtus book', 'Zaryte bow']);

export const allNexItems = [torvaOutfit, pernixOutfit, virtusOutfit, ancientWeapons].flat();
export const allKeyPieces = resolveItems([
	'Key piece 1',
	'Key piece 2',
	'Key piece 3',
	'Key piece 4'
]);
export const allKeyItems = resolveItems([
	'Frozen key',
	'Key piece 1',
	'Key piece 2',
	'Key piece 3',
	'Key piece 4'
]);

export const NexMonster: KillableMonster = {
	id: 46274,
	name: 'Nex',
	aliases: ['nex'],
	timeToFinish: Time.Minute * 25,
	table: {
		kill: makeKillTable(
			new LootTable()
				.every('Big bones')
				.add(
					new LootTable()
						.every('Saradomin brew(4)', [10, 80])
						.every('Super restore(4)', [10, 80])
				)
				.add('Magic logs', 375)
				.add('Green dragonhide', 400)
				.add('Uncut dragonstone', 20)
				.add('Onyx bolts (e)', 375)
				.add('Grimy avantoe', 75)
				.add('Grimy dwarf weed', 75)
				.add('Grimy torstol', 40)
				.add('Torstol seed', 12)
				.add('Magic seed', 5)
				.tertiary(250, 'Ancient emblem')
				.tertiary(5, 'Tradeable mystery box')
				.tertiary(5, 'Clue scroll grandmaster')
				.tertiary(3000, 'Bloodsoaked feather')
		)
	},
	emoji: '',
	wildy: false,
	canBeKilled: false,
	difficultyRating: 10,
	qpRequired: 0,
	groupKillable: true,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		prayer: 95
	},
	healAmountNeeded: 120 * 20,
	attackStyleToUse: GearSetupTypes.Range,
	attackStylesUsed: [GearStat.AttackRanged],
	minimumGearRequirements: {
		[GearSetupTypes.Range]: {
			[GearStat.AttackRanged]: 33 + 20 + 4 + 10 + 7 + 8 + 70 + 12 + 7
		}
	}
};
