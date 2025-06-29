import { exponentialPercentScale, formatDuration } from '@oldschoolgg/toolkit/util';
import { userMention } from 'discord.js';
import {
	Time,
	calcWhatPercent,
	clamp,
	increaseNumByPercent,
	percentChance,
	randFloat,
	randInt,
	reduceNumByPercent,
	roll,
	sumArr
} from 'e';
import { Bank, EMonster, randomVariation, resolveItems } from 'oldschooljs';

import { BitField } from '../constants';
import type { Skills } from '../types';
import { formatList } from '../util';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import itemID from '../util/itemID';
import { arrows, bolts, bows, crossbows } from '../util/minionUtils';
import { formatSkillRequirements, itemNameFromID } from '../util/smallUtils';
import { TeamLoot } from './TeamLoot';
import { NexNonUniqueTable, NexUniqueTable } from './misc';

const minStats: Skills = {
	defence: 90,
	ranged: 90,
	prayer: 74
};

function nexGearStats(user: MUser) {
	const { gear } = user;
	const offence = calcWhatPercent(gear.range.stats.attack_ranged, 252);
	const defence = calcWhatPercent(gear.range.stats.defence_magic, 150);
	return {
		offence: exponentialPercentScale(offence),
		defence,
		rangeGear: gear.range
	};
}

const allowedWeapons = resolveItems(['Armadyl crossbow', 'Dragon crossbow', 'Zaryte crossbow', 'Twisted bow']);
const weaponsStr = formatList(allowedWeapons.map(itemNameFromID), 'or');
const allowedAmmo = resolveItems(['Dragon arrow', 'Ruby dragon bolts (e)', 'Rune arrow']);
const ammoStr = formatList(allowedAmmo.map(itemNameFromID), 'or');

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
	if (user.GP < 1_000_000) return [true, `${tag} needs at least 1m GP to cover potential deaths.`];
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
	teamID: number;
	fake: boolean;
}

export interface NexContext {
	quantity: number;
	team: { id: string; teamID: number; contribution: number; deaths: number[]; fake?: boolean }[];
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
		// VIP logic: perturb contribution by 10%, VIP is chosen randomly with perturbed contribution as weight
		// The unique loot chance also uses the perturbed contribution as weight

		const survivors = team
			.filter(u => !u.deaths.includes(i))
			.map(u => ({ ...u, contribution: randomVariation(u.contribution, 10) }));
		if (survivors.length === 0) {
			continue;
		}

		const totalContribution = sumArr(survivors.map(u => u.contribution));
		const VIPContribution = randFloat(0, totalContribution); // random VIP, weighted by contribution
		let cumulativeSum = 0;
		let VIP = 0;
		for (const user of survivors) {
			cumulativeSum += user.contribution;
			if (cumulativeSum >= VIPContribution) {
				VIP = user.teamID;
				break;
			}
		}

		const nonUniqueDrop = NexNonUniqueTable.roll();

		for (const teamMember of survivors.filter(m => !m.fake)) {
			const VIPBonus = teamMember.teamID === VIP ? 1.1 : 1;

			teamLoot.add(teamMember.id, nonUniqueDrop.multiply(VIPBonus)); // VIPBonus may not be an integer, loot amounts rounded down in multiply

			if (teamMember.teamID === VIP) teamLoot.add(teamMember.id, 'Big bones');

			if (roll(43) && percentChance((VIPBonus * 100 * teamMember.contribution) / totalContribution)) {
				teamLoot.add(teamMember.id, NexUniqueTable.roll());
			}

			if (roll(500) && percentChance((VIPBonus * 100 * teamMember.contribution) / totalContribution)) {
				teamLoot.add(teamMember.id, 'Nexling');
			}

			if (roll(48)) {
				teamLoot.add(teamMember.id, 'Clue scroll (elite)');
			}
		}
	}

	return teamLoot;
}

export async function calculateNexDetails({ team }: { team: MUser[] }) {
	let maxTripLength = Math.max(...team.map(u => calcMaxTripLength(u)));
	let lengthPerKill = Time.Minute * 35;
	const resultTeam: TeamMember[] = [];

	for (const member of team) {
		let { offence, defence, rangeGear } = nexGearStats(member);
		let deathChance = 100;
		const nexKC = await member.getKC(EMonster.NEX);
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

		const offensivePercents = [offence, clamp(calcWhatPercent(nexKC, 100), 0, 100)];
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
			totalDefensivePercent,
			teamID: resultTeam.length,
			fake: resultTeam.map(m => m.id).includes(member.id)
		});
	}

	lengthPerKill = clamp(lengthPerKill, Time.Minute * 6, Time.Hour);

	const quantity = Math.floor(maxTripLength / lengthPerKill);

	let wipedKill: number | null = null;

	for (let i = 0; i < quantity; i++) {
		let deathsThisKill = 0;
		for (const user of resultTeam) {
			if (percentChance(user.deathChance)) {
				user.deaths.push(i);
				deathsThisKill++;
			}
		}
		if (deathsThisKill === resultTeam.length) {
			wipedKill = i + 1;
			break;
		}
	}

	for (const teamUser of resultTeam.filter(m => !m.fake)) {
		const user = team.find(u => u.id === teamUser.id)!;
		const { rangeGear } = nexGearStats(user);
		const ammo = rangeGear.ammo?.item ?? itemID('Dragon arrow');
		// Between 50-60 ammo per kill (before reductions)
		teamUser.cost.add(ammo, randInt(50, 60) * quantity);
	}

	const duration = quantity * lengthPerKill;

	return {
		team: resultTeam,
		quantity,
		duration: wipedKill ? wipedKill * lengthPerKill - randomVariation(lengthPerKill / 2, 90) : duration,
		fakeDuration: duration,
		wipedKill
	};
}
