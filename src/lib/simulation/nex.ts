import { userMention } from '@discordjs/builders';
import {
	calcWhatPercent,
	clamp,
	increaseNumByPercent,
	percentChance,
	randArrItem,
	randInt,
	reduceNumByPercent,
	roll,
	sumArr,
	Time
} from 'e';
import { Bank } from 'oldschooljs';
import { randomVariation } from 'oldschooljs/dist/util/util';

import { BitField, NEX_ID } from '../constants';
import type { Skills } from '../types';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import itemID from '../util/itemID';
import { arrows, bolts, bows, crossbows } from '../util/minionUtils';
import resolveItems from '../util/resolveItems';
import { exponentialPercentScale, formatDuration, formatSkillRequirements, itemNameFromID } from '../util/smallUtils';
import { NexNonUniqueTable, NexUniqueTable } from './misc';
import { TeamLoot } from './TeamLoot';

const minStats: Skills = {
	defence: 90,
	ranged: 90,
	prayer: 74
};

export function nexGearStats(user: MUser) {
	let { gear } = user;
	const offence = calcWhatPercent(gear.range.stats.attack_ranged, 252);
	const defence = calcWhatPercent(gear.range.stats.defence_magic, 150);
	return {
		offence: exponentialPercentScale(offence),
		defence,
		rangeGear: gear.range
	};
}

const allowedWeapons = resolveItems(['Armadyl crossbow', 'Dragon crossbow', 'Zaryte crossbow', 'Twisted bow']);
const weaponsStr = allowedWeapons.map(itemNameFromID).join(', ');
const allowedAmmo = resolveItems(['Dragon arrow', 'Ruby dragon bolts (e)', 'Rune arrow']);
const ammoStr = allowedAmmo.map(itemNameFromID).join(', ');

const minimumCostOwned = new Bank()
	.add('Saradomin brew(4)', 8)
	.add('Super restore(4)', 5)
	.add('Ranging potion(4)', 2)
	.add('Sanfew serum(4)')
	.multiply(5);

export function checkNexUser(user: MUser): [false] | [true, string] {
	const tag = userMention(user.id);
	if (!user.hasSkillReqs(minStats)) {
		return [true, `${tag} doesn't have the skill requirements: ${formatSkillRequirements(minStats)}.`];
	}
	if (user.GP < 1_000_000) return [true, `${tag} needs atleast 1m GP to cover potential deaths.`];
	const { offence, defence, rangeGear } = nexGearStats(user);
	if (offence < 50) {
		return [
			true,
			`${tag}'s range gear is terrible! You need higher range attack. You have ${offence.toFixed(
				2
			)}%, you need 50%.`
		];
	}
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
	if (
		(crossbows.includes(weapon.id) && arrows.includes(ammo.item)) ||
		(bows.includes(weapon.id) && bolts.includes(ammo.item))
	) {
		return [true, `${tag} is using incorrect ammo for their type of weapon.`];
	}
	if (ammo.quantity < 600) {
		return [
			true,
			`${tag} has less than 600 ${itemNameFromID(ammo.item)} equipped, they might run out in the fight!`
		];
	}
	const { bank } = user;
	if (!bank.has(minimumCostOwned)) {
		return [true, `${tag} needs to own a minimum of these supplies: ${minimumCostOwned}`];
	}
	const { cl } = user;
	if (!cl.has('Frozen key') && !bank.has('Frozen key')) {
		return [true, `${tag} needs to have created a Frozen key to fight Nex.`];
	}

	return [false];
}

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

export interface NexContext {
	quantity: number;
	team: { id: string; contribution: number; deaths: number[]; ghost?: true }[];
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

	for (let i = 0; i < quantity; i++) {
		const survivors = team.filter(usr => !usr.deaths.includes(i));
		if (survivors.length === 0) {
			continue;
		}

		const uniqueRecipient = roll(43) ? randArrItem(survivors).id : null;
		const nonUniqueDrop = NexNonUniqueTable.roll();

		for (const teamMember of survivors) {
			teamLoot.add(teamMember.id, nonUniqueDrop);
			if (teamMember.id === uniqueRecipient) {
				teamLoot.add(teamMember.id, NexUniqueTable.roll());
			}
			if (roll(48)) {
				teamLoot.add(teamMember.id, 'Clue scroll (elite)');
			}
		}

		if (roll(500)) {
			const recipient = randArrItem(survivors);
			teamLoot.add(recipient.id, 'Nexling');
		}
	}

	for (const member of team) {
		if (member.ghost) {
			teamLoot.map.delete(member.id);
		}
	}
	return teamLoot;
}

export async function calculateNexDetails({ team }: { team: MUser[] }) {
	let maxTripLength = Math.max(...team.map(u => calcMaxTripLength(u)));
	let lengthPerKill = Time.Minute * 35;
	let resultTeam: TeamMember[] = [];

	for (const member of team) {
		let { offence, defence, rangeGear } = nexGearStats(member);
		let deathChance = 100;
		let nexKC = await member.getKC(NEX_ID);
		const kcLearningCap = 500;
		const kcPercent = clamp(calcWhatPercent(nexKC, kcLearningCap), 0, 100);
		const messages: string[] = [];

		if ([rangeGear.ammo?.item].includes(itemID('Rune arrow'))) {
			offence -= 5;
		}
		offence -= 5;
		const isUsingZCB = rangeGear.weapon?.item === itemID('Zaryte crossbow');
		if (isUsingZCB) offence += 5;

		offence -= 2;
		const isUsingVambs = rangeGear.hands?.item === itemID('Zaryte vambraces');
		if (isUsingVambs) offence += 2;

		offence -= 5;
		const hasRigour = member.bitfield.includes(BitField.HasDexScroll);
		if (hasRigour) offence += 5;

		let offensivePercents = [offence, clamp(calcWhatPercent(nexKC, 100), 0, 100)];
		const totalOffensivePecent = sumArr(offensivePercents) / offensivePercents.length;
		const contribution = totalOffensivePecent;

		const defensivePercents = [defence, clamp(kcPercent * 2, 0, 100)];
		const totalDefensivePercent = sumArr(defensivePercents) / defensivePercents.length;
		deathChance = reduceNumByPercent(deathChance, totalDefensivePercent);
		deathChance = clamp(deathChance, 5, 100);

		let timeReductionPercent = clamp(kcPercent / 4.5 + offence / 7, 1, 100);
		if (isUsingZCB) timeReductionPercent = increaseNumByPercent(timeReductionPercent, 5);
		const reducedTime = reduceNumByPercent(lengthPerKill, timeReductionPercent);
		messages.push(`${timeReductionPercent.toFixed(1)}% faster`);

		lengthPerKill = reducedTime;

		for (const [shield, time, shortName] of [
			[itemID('Elysian spirit shield'), increaseNumByPercent(lengthPerKill, 3), 'ely'],
			[itemID('Spectral spirit shield'), increaseNumByPercent(lengthPerKill, 3), 'spectral']
		] as const) {
			if (rangeGear.shield?.item === shield) {
				const timeToAdd = Math.ceil(time / team.length);
				maxTripLength += timeToAdd;
				messages.push(`+${formatDuration(timeToAdd, true)} for ${shortName}`);
			}
		}

		if (rangeGear.shield?.item === itemID('Elysian spirit shield')) {
			deathChance = reduceNumByPercent(deathChance, 30);
			messages.push('-30% death% for ely');
		}

		const cost = new Bank()
			.add('Saradomin brew(4)', 8)
			.add('Super restore(4)', 5)
			.add('Ranging potion(4)', 2)
			.add('Sanfew serum(4)');

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

	lengthPerKill = clamp(lengthPerKill, Time.Minute * 6, Time.Hour);

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
		if (deathsThisKill === resultTeam.length) {
			wipedKill = i + 1;
			break;
		}
	}
	for (const [id, deathArr] of Object.entries(deaths)) {
		resultTeam[resultTeam.indexOf(resultTeam.find(i => i.id === id)!)].deaths = deathArr;
	}

	/**
	 * Ammo
	 */
	for (const user of team) {
		const { rangeGear } = nexGearStats(user);
		const teamUser = resultTeam.findIndex(a => a.id === user.id);
		const ammo = rangeGear.ammo?.item ?? itemID('Dragon arrow');
		// Between 50-60 ammo per kill (before reductions)
		resultTeam[teamUser].cost.add(ammo, randInt(50, 60) * quantity);
	}

	const duration = quantity * lengthPerKill;

	return {
		team: resultTeam,
		quantity,
		duration: wipedKill ? wipedKill * lengthPerKill - randomVariation(lengthPerKill / 2, 90) : duration,
		fakeDuration: duration,
		wipedKill,
		deaths
	};
}
