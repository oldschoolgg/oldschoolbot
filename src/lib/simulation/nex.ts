/**
 * pay 100k to get items back if die
 *
 * --- REQUIREMENTS ---
 * requires dragon cbow or armadyl cbow or zaryte cbow or twisted bow
 *
 */

import { User } from '@prisma/client';
import { User as DJUser } from 'discord.js';
import { KlasaUser } from 'klasa';
import { LootTable } from 'oldschooljs';

import { getSkillsOfMahojiUser } from '../../mahoji/mahojiSettings';
import { Skills } from '../types';
import { formatSkillRequirements, skillsMeetRequirements } from '../util';

const minStats: Skills = {
	attack: 90,
	strength: 90,
	defence: 90,
	ranged: 90,
	magic: 94,
	prayer: 77
};

interface TeamMember {
	user: User;
	djsUser: DJUser;
}

interface NexContext {
	quantity: number;
	team: TeamMember[];
}

interface NexResult {
	inhibitedReason: string;
}

async function checkNexUser(user: User, klasaUser: KlasaUser) {
	if (!skillsMeetRequirements(getSkillsOfMahojiUser(user), minStats)) {
		return `${klasaUser.username} doesn't have the skill requirements: ${formatSkillRequirements(minStats)}.`;
	}
	if (user.GP < 100_000) return `${klasaUser.username} doesn't have 100k GP`;
	return null;
}

const NexUniqueTable = new LootTable()
	.add('Nihil horn', 1, 2)
	.add('Zaryte vambraces', 1, 2)
	.add('Ancient hilt', 1, 2)
	.add('Torva full helm (damaged)', 1, 2)
	.add('Torva platebody (damaged)', 1, 2)
	.add('Torva platelegs (damaged)', 1, 2);

const NexNonUniqueTable = new LootTable()
	.add('Blood rune', [84, 325], 3)
	.add('Death rune', [85, 170], 3)
	.add('Soul rune', [86, 227], 3)
	.add('Dragon bolts (unf)', [12, 90], 3)
	.add('Cannonball', [42, 298], 3)
	.add('Air rune', [123, 1365])
	.add('Fire rune', [210, 1655])
	.add('Water rune', [193, 1599])
	.add('Onyx bolts (e)', [11, 29])
	.add('Air orb', [6, 20], 3)
	.add('Uncut ruby', [3, 26], 3)
	.add('Wine of zamorak', [4, 14], 3)
	.add('Coal', [23, 95])
	.add('Runite ore', [2, 28])
	.add(new LootTable().every('Shark', 3).every('Prayer potion(4)', 1), 1, 1)
	.add(new LootTable().every('Saradomin brew(4)', 2).every('Super restore(4)', 1), 1, 1)
	.add('Ecumenical key shard', [6, 39])
	.add('Nihil shard', [1, 20])
	.add('Blood essence', [1, 2])
	.add('Coins', [8539, 26_748])
	.oneIn(10, 'Rune sword')
	.tertiary(20, 'Clue scroll (elite)');
