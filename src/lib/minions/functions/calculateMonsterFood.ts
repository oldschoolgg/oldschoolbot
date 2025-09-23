import { calcWhatPercent, reduceNumByPercent } from 'e';
import { GearStat } from 'oldschooljs/gear';

import { inverseOfOffenceStat } from '@/lib/gear/functions/inverseOfStat.js';
import type { GearSetupType } from '@/lib/gear/types.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { maxDefenceStats, maxOffenceStats } from '@/lib/structures/Gear';
import type { GearBank } from '@/lib/structures/GearBank';
import { readableStatName } from '@/lib/util/smallUtils';

const { floor, max } = Math;

export function calculateMonsterFoodRaw(gearBank: GearBank, monster: Readonly<KillableMonster>): [number, string] {
	let { healAmountNeeded, attackStyleToUse, attackStylesUsed } = monster;

	if (!healAmountNeeded || !attackStyleToUse || !attackStylesUsed) {
		return [0, ''];
	}

	if (monster.name === 'Koschei the deathless') {
		return [monster.healAmountNeeded!, ''];
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

	if (monster.wildy) gearToCheck = 'wildy';
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

	// Get average of all defensive%'s and limit it to a cap of 75
	totalPercentOfGearLevel = Math.min(floor(max(0, totalPercentOfGearLevel / attackStylesUsed.length)), 75);
	// Floor at 0 and cap at 80
	totalOffensivePercent = Math.min(floor(max(0, totalOffensivePercent)), 80);

	healAmountNeeded = floor(reduceNumByPercent(healAmountNeeded, totalPercentOfGearLevel));
	healAmountNeeded = floor(reduceNumByPercent(healAmountNeeded, totalOffensivePercent));

	const hasAbyssalCape = gearBank.hasEquipped('Abyssal cape');
	if (hasAbyssalCape) {
		healAmountNeeded = Math.floor(healAmountNeeded * 0.5);
	}

	return [
		healAmountNeeded,
		`${healAmountNeeded} HP/kill: Reduced from ${monster.healAmountNeeded}, -${floor(
			totalPercentOfGearLevel
		)}% for defence(${attackStylesUsed.map(inverseOfOffenceStat).map(readableStatName).join(', ')}), -${floor(
			totalOffensivePercent
		)}% for offensive stats(${readableStatName(attackStyleToUse)})${
			hasAbyssalCape ? ', -50% for Abyssal cape' : ''
		}`
	];
}

export default function calculateMonsterFood(monster: Readonly<KillableMonster>, user: MUser): [number, string] {
	return calculateMonsterFoodRaw(user.gearBank, monster);
}
