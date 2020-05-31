import { Monsters } from 'oldschooljs';

import { KillableMonster } from '../../../types';
import resolveItems from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';

const killableBosses: KillableMonster[] = [
	{
		id: Monsters.GeneralGraardor.id,
		name: Monsters.GeneralGraardor.name,
		aliases: Monsters.GeneralGraardor.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.GeneralGraardor,
		emoji: '<:Pet_general_graardor:324127377376673792>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		notifyDrops: resolveItems(['Pet general graardor']),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
		},
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.CommanderZilyana.id,
		name: Monsters.CommanderZilyana.name,
		aliases: Monsters.CommanderZilyana.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.CommanderZilyana,
		emoji: '<:Pet_zilyana:324127378248957952>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		notifyDrops: resolveItems(['Pet zilyana']),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Ranger boots')]: 5,
			[itemID('Armadyl crossbow')]: 5
		},
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Kreearra.id,
		name: Monsters.Kreearra.name,
		aliases: Monsters.Kreearra.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.Kreearra,
		emoji: '<:Pet_kreearra:324127377305239555>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		notifyDrops: resolveItems(["Pet kree'arra"]),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Armadyl crossbow')]: 5
		},
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.KrilTsutsaroth.id,
		name: Monsters.KrilTsutsaroth.name,
		aliases: Monsters.KrilTsutsaroth.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.KrilTsutsaroth,
		emoji: '<:Pet_kril_tsutsaroth:324127377527406594>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		notifyDrops: resolveItems(["Pet k'ril tsutsaroth"]),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
		},
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43
		}
	}
];

export default killableBosses;
