import { calcWhatPercent, reduceNumByPercent } from 'e';

import { inverseOfOffenceStat } from '../../gear/functions/inverseOfStat';
import type { GearSetupType } from '../../gear/types';
import { GearStat } from '../../gear/types';
import { maxDefenceStats, maxOffenceStats } from '../../structures/Gear';
import type { GearBank } from '../../structures/GearBank';
import { readableStatName } from '../../util/smallUtils';
import type { KillableMonster } from '../types';

const { floor, max } = Math;

export function calculateMonsterFoodRaw(gearBank: GearBank, monster: Readonly<KillableMonster>): [number, string] {
	let { healAmountNeeded, attackStyleToUse, attackStylesUsed } = monster;

	if (!healAmountNeeded || !attackStyleToUse || !attackStylesUsed) {
		return [0, ''];
	}

	let gearToCheck: GearSetupType = 'melee';

	switch (attackStyleToUse) {
		case GearStat.AttackMagic:
			gearToCheck = 'mage';
			break;
		case GearStat.AttackRanged:
			gearToCheck = 'range';
			break;
		default:
			break;
	}

	const gearStats = gearBank.gear[gearToCheck].stats;

	let totalPercentOfGearLevel = 0;
	let totalOffensivePercent = 0;

	// Check all styles the monster uses for defensive%
	for (const style of attackStylesUsed) {
		const inverseStyle = inverseOfOffenceStat(style);
		const usersStyle = gearStats[inverseStyle];
		const maxStyle = maxDefenceStats[inverseStyle]!;
		const percent = floor(calcWhatPercent(usersStyle, maxStyle));
		totalPercentOfGearLevel += percent;
	}

	totalOffensivePercent = floor(calcWhatPercent(gearStats[attackStyleToUse], maxOffenceStats[attackStyleToUse]));

	// Get average of all defensive%'s and limit it to a cap of 95
	totalPercentOfGearLevel = Math.min(floor(max(0, totalPercentOfGearLevel / attackStylesUsed.length)), 95);
	// Floor at 0 and cap at 95
	totalOffensivePercent = Math.min(floor(max(0, totalOffensivePercent)), 95);

	healAmountNeeded = floor(reduceNumByPercent(healAmountNeeded, totalPercentOfGearLevel));
	healAmountNeeded = floor(reduceNumByPercent(healAmountNeeded, totalOffensivePercent));

	return [
		healAmountNeeded,
		`${healAmountNeeded} HP/kill: Reduced from ${monster.healAmountNeeded}, -${floor(
			totalPercentOfGearLevel
		)}% for defence(${attackStylesUsed.map(inverseOfOffenceStat).map(readableStatName).join(', ')}), -${floor(
			totalOffensivePercent
		)}% for offensive stats(${readableStatName(attackStyleToUse)})`
	];
}

export default function calculateMonsterFood(monster: Readonly<KillableMonster>, user: MUser): [number, string] {
	return calculateMonsterFoodRaw(user.gearBank, monster);
}
