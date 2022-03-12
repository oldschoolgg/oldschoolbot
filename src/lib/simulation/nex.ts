/**
 * pay 100k to get items back if die
 *
 */

import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { calcWhatPercent, percentChance, randArrItem, reduceNumByPercent, roll, sumArr, Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { getSkillsOfMahojiUser, getUserGear } from '../../mahoji/mahojiSettings';
import { NEX_ID } from '../constants';
import { Skills } from '../types';
import { clamp, formatDuration, formatSkillRequirements, itemNameFromID, skillsMeetRequirements } from '../util';
import getUsersPerkTier from '../util/getUsersPerkTier';
import { calcMaxTripLength } from '../util/minionUtils';
import resolveItems from '../util/resolveItems';
import { TeamLoot } from './TeamLoot';

const minStats: Skills = {
	defence: 90,
	ranged: 90,
	prayer: 77
};

function gearStats(user: User) {
	let gear = getUserGear(user);
	const offence = calcWhatPercent(gear.range.stats.attack_ranged, 252);
	const defence = calcWhatPercent(gear.range.stats.defence_magic, 150);
	return {
		offence,
		defence,
		rangeGear: gear.range
	};
}

const allowedWeapons = resolveItems(['Dragon crossbow', 'Zaryte crossbow', 'Twisted bow']);
const weaponsStr = allowedWeapons.map(itemNameFromID).join(', ');
const allowedAmmo = resolveItems(['Dragon arrow', 'Ruby dragon bolts (e)']);
const ammoStr = allowedAmmo.map(itemNameFromID).join(', ');

export function checkNexUser(user: User): [false] | [true, string] {
	const tag = userMention(user.id);
	if (!skillsMeetRequirements(getSkillsOfMahojiUser(user), minStats)) {
		return [true, `${tag} doesn't have the skill requirements: ${formatSkillRequirements(minStats)}.`];
	}
	if (user.GP < 1_000_000) return [true, `${tag} needs atleast 1m GP to cover potential deaths.`];
	const { offence, defence, rangeGear } = gearStats(user);
	if (offence < 50) return [true, `${tag}'s range gear is terrible! You need higher range attack.`];
	if (defence < 50) return [true, `${tag}'s range gear is terrible! You need higher mage defence.`];
	for (const slot of ['ammo', 'body', 'feet', 'head', 'body', 'legs'] as const) {
		if (!rangeGear[slot]) {
			return [true, `${tag} has no item equipped in their ${slot} slot, in their range gear.`];
		}
	}
	const weapon = rangeGear.equippedWeapon();
	if (!weapon) return [true, `${tag} is trying to go to Nex with no weapon?!`];
	if (!allowedWeapons.includes(weapon.id)) {
		return [true, `${tag} needs to be using one of these weapons: ${weaponsStr}.`];
	}
	const { ammo } = rangeGear;
	if (!ammo) return [true, `${tag} has no ammo for their weapon equipped.`];
	if (!allowedAmmo.includes(ammo.item)) {
		return [true, `${tag} needs to be using one of these types of ammo: ${ammoStr}`];
	}
	if (ammo.quantity < 200) {
		return [
			true,
			`${tag} has less than 200 ${itemNameFromID(ammo.item)} equipped, they might run out in the fight!`
		];
	}
	return [false];
}

export const NexUniqueTable = new LootTable()
	.add('Nihil horn', 1, 2)
	.add('Zaryte vambraces', 1, 2)
	.add('Ancient hilt', 1, 2)
	.add('Torva full helm (damaged)', 1, 2)
	.add('Torva platebody (damaged)', 1, 2)
	.add('Torva platelegs (damaged)', 1, 2);

export const NexNonUniqueTable = new LootTable()
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
	.oneIn(25, 'Nihil shard', [1, 20])
	.add('Blood essence', [1, 2])
	.add('Coins', [8539, 26_748])
	.oneIn(100, 'Rune sword')
	.tertiary(20, 'Clue scroll (elite)');

interface TeamMember {
	id: string;
	/**
	 * 0% - 100%, how well they did in the fight.
	 */
	contribution: number;
	died: boolean;
	deathChance: number;
	cost: Bank;
	deaths: number[];
	messages: string[];
	totalOffensivePecent: number;
	totalDefensivePercent: number;
}

interface NexContext {
	quantity: number;
	team: { id: string; contribution: number; deaths: number[] }[];
}

export const purpleNexItems = resolveItems([
	'Nexling',
	'Ancient hilt',
	'Nihil horn',
	'Zaryte vambraces',
	'Torva full helm (damaged)',
	'Torva platebody (damaged)',
	'Torva platelegs (damaged)'
]);

export function handleNexKills({ quantity, team }: NexContext) {
	const teamLoot = new TeamLoot(purpleNexItems);
	const uniqueDecider = new SimpleTable<string>();
	for (const user of team) uniqueDecider.add(user.id);

	for (let i = 0; i < quantity; i++) {
		const uniqueRecipient = roll(53) ? uniqueDecider.roll().item : null;
		for (const teamMember of team) {
			if (teamMember.deaths.includes(i)) continue;
			teamLoot.add(teamMember.id, NexNonUniqueTable.roll());
			if (teamMember.id === uniqueRecipient) {
				teamLoot.add(teamMember.id, NexUniqueTable.roll());
			}
		}

		if (roll(500)) {
			const recipient = randArrItem(team);
			teamLoot.add(recipient.id, 'Nexling');
		}
	}

	return teamLoot;
}

export function calculateNexDetails({ team }: { team: User[] }) {
	const maxTripLength = calcMaxTripLength(
		[...team].sort((a, b) => getUsersPerkTier(b.bitfield) - getUsersPerkTier(a.bitfield))[0]
	);
	let lengthPerKill = Time.Minute * 20;
	let resultTeam: TeamMember[] = [];

	for (const member of team) {
		const { offence, defence } = gearStats(member);
		let deathChance = 100;
		let nexKC = (member.monsterScores as ItemBank)[NEX_ID] ?? 0;
		const kcPercent = clamp(calcWhatPercent(nexKC, 100), 0, 100);

		let offensivePercents = [offence, clamp(calcWhatPercent(nexKC, 100), 0, 100)];
		const totalOffensivePecent = sumArr(offensivePercents) / offensivePercents.length;
		const contribution = reduceNumByPercent(100, totalOffensivePecent);

		const defensivePercents = [defence, clamp(kcPercent * 2, 0, 100)];
		const totalDefensivePercent = sumArr(defensivePercents) / defensivePercents.length;
		deathChance = reduceNumByPercent(deathChance, totalDefensivePercent);
		deathChance = clamp(deathChance, 5, 100);

		const reducedTime = reduceNumByPercent(lengthPerKill, kcPercent / 4 + offence / 7);
		const messages: string[] = [`-${formatDuration(lengthPerKill - reducedTime, true)}`];

		lengthPerKill = reducedTime;

		const cost = new Bank().add('Saradomin brew(4)', 8).add('Super restore(4)', 5).add('Ranging potion(4)', 2);

		resultTeam.push({
			id: member.id,
			contribution,
			deathChance,
			died: percentChance(deathChance),
			cost,
			deaths: [],
			messages,
			totalOffensivePecent,
			totalDefensivePercent
		});
	}

	lengthPerKill = clamp(lengthPerKill, Time.Minute * 5, Time.Hour);

	let quantity = Math.floor(maxTripLength / lengthPerKill);

	let wipedKill: number | null = null;

	const deaths: Record<string, number[]> = {};
	for (const user of resultTeam) deaths[user.id] = [];
	for (let i = 0; i < quantity; i++) {
		let deathsThisKill = 0;
		for (const user of resultTeam) {
			if (percentChance(user.deathChance)) {
				deaths[user.id].push(i);
				deathsThisKill++;
			}
		}
		if (deathsThisKill === resultTeam.length) wipedKill = i + 1;
		break;
	}
	for (const [id, deathArr] of Object.entries(deaths)) {
		resultTeam[resultTeam.indexOf(resultTeam.find(i => i.id === id)!)].deaths = deathArr;
	}

	const duration = quantity * lengthPerKill;

	return {
		team: resultTeam,
		quantity,
		duration: wipedKill ? wipedKill * lengthPerKill : duration,
		fakeDuration: duration,
		wipedKill,
		deaths
	};
}
