import { Time, calcPercentOfNum, calcWhatPercent, reduceNumByPercent } from 'e';
import { randomVariation } from 'oldschooljs/dist/util';

import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { PeakTier } from '../constants';
import type { KillableMonster } from '../minions/types';
import { maxDefenceStats } from '../structures/Gear';
import type { GearBank } from '../structures/GearBank';
import type { Peak } from '../tickers';
import { percentChance } from '../util';

const peakFactor = [
	{
		peakTier: PeakTier.High,
		factor: 2.5
	},
	{
		peakTier: PeakTier.Medium,
		factor: 1
	},
	{
		peakTier: PeakTier.Low,
		factor: 0.2
	}
];

export async function increaseWildEvasionXp(user: MUser, duration: number) {
	const oldPkXp: { pk_evasion_exp: number } = await user.fetchStats({ pk_evasion_exp: true });
	const newPkXp = Math.floor(Math.min(1_000_000_000, oldPkXp.pk_evasion_exp + duration));
	await userStatsUpdate(user.id, { pk_evasion_exp: newPkXp });
}
export function calcWildyPKChance(
	currentPeak: Peak,
	gearBank: GearBank,
	monster: KillableMonster,
	duration: number,
	supplies: boolean,
	cannonMulti: boolean,
	pkEvasionExperience: number
) {
	// Chance per minute, Difficulty from 1 to 10, and factor a million difference, High peak 5x as likley encounter, Medium peak 1x, Low peak 5x as unlikley
	const peakInfluence = peakFactor.find(_peaktier => _peaktier.peakTier === currentPeak?.peakTier)?.factor ?? 1;
	const pkChance = (1 / (7_000_000 / (Math.pow(monster.pkActivityRating ?? 1, 6) * peakInfluence))) * 100;
	let chanceString = `**PK Chance:** ${pkChance.toFixed(2)}% per min (${currentPeak.peakTier} peak time)`;

	const maxReductionPercent = 75;
	const maxBoostDuration = Time.Hour * 10;
	const scaledExp = Math.min(100, (pkEvasionExperience / maxBoostDuration) * 100);
	const evasionReduction = randomVariation(calcPercentOfNum(scaledExp, maxReductionPercent), 10);

	const tripMinutes = Math.round(duration / Time.Minute);
	let pkCount = 0;
	for (let i = 0; i < tripMinutes; i++) {
		if (percentChance(pkChance)) {
			pkCount++;
		}
	}

	let died = false;
	let deathChance = monster.pkBaseDeathChance ?? 0;

	const statLvls =
		gearBank.skillsAsLevels.defence + gearBank.skillsAsLevels.magic + gearBank.skillsAsLevels.hitpoints;
	const deathChanceFromLevels = Math.max(0, (100 - (statLvls / 297) * 100) / 5);
	deathChance += deathChanceFromLevels;

	// Multi does make it riskier, but only if there's actually a team on you
	const wildyMultiMultiplier = monster.wildyMulti || cannonMulti ? 2 : 1;
	const hasSupplies = supplies ? 0.5 : 1;
	const hasOverheads = gearBank.skillsAsLevels.prayer >= 43 ? 0.25 : 1;

	// Weighted Melee gear percent protection 60% slash, 30% crush, 10% stab
	const defensiveMeleeGearPercent =
		(Math.max(0, calcWhatPercent(gearBank.gear.wildy.getStats().defence_slash, maxDefenceStats.defence_slash)) *
			60 +
			Math.max(0, calcWhatPercent(gearBank.gear.wildy.getStats().defence_crush, maxDefenceStats.defence_crush)) *
				30 +
			Math.max(0, calcWhatPercent(gearBank.gear.wildy.getStats().defence_stab, maxDefenceStats.defence_stab)) *
				10) /
		100;

	const defensiveRangeGearPercent = Math.max(
		0,
		calcWhatPercent(gearBank.gear.wildy.getStats().defence_ranged, maxDefenceStats.defence_ranged)
	);

	const defensiveMageGearPercent = Math.max(
		0,
		calcWhatPercent(gearBank.gear.wildy.getStats().defence_magic, maxDefenceStats.defence_magic)
	);

	// Weighted attack style percent, 60% magic, 40% ranged, 20% melee
	const defensiveGearPercent =
		(defensiveMageGearPercent * 60 + defensiveRangeGearPercent * 40 + defensiveMeleeGearPercent * 20) / 100;

	const deathChanceFromGear = (100 + (100 - defensiveGearPercent) * 5) / 100;
	deathChance *= deathChanceFromGear;

	deathChance *= hasSupplies;
	deathChance *= hasOverheads;
	deathChance *= wildyMultiMultiplier;
	deathChance = reduceNumByPercent(deathChance, evasionReduction);

	deathChance = Math.min(Math.max(0, deathChance), 100);
	if (pkCount > 0) {
		for (let i = 0; i < pkCount; i++) {
			if (percentChance(deathChance)) {
				died = true;
				break;
			}
		}
	}

	chanceString += `\n**Death Chance:** ${deathChance.toFixed(2)}% per pk encounter (${
		monster.pkBaseDeathChance ?? 0
	}% Base chance, ${
		deathChanceFromLevels > 0 ? `${deathChanceFromLevels.toFixed(2)}% from low combat levels, ` : ''
	}${deathChanceFromGear.toFixed(
		2
	)}x from wildy gear (weight 60% magic, 40% ranged, 20% melee), ${hasSupplies}x from anti-pk supplies, ${hasOverheads}x from overhead prayers, ${(
		(100 - evasionReduction) / 100
	).toFixed(2)}x from risky Wilderness experience, ${wildyMultiMultiplier}x from being in${
		wildyMultiMultiplier === 1 ? ' no' : ''
	} multi)`;

	return { pkCount, died, chanceString, currentPeak };
}
