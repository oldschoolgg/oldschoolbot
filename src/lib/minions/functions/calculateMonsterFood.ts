import { calcWhatPercent, reduceNumByPercent } from 'e';
import { KlasaUser } from 'klasa';

import { GearSetupType, GearStat, maxDefenceStats, maxOffenceStats, readableStatName } from '../../gear';
import { inverseOfOffenceStat } from '../../gear/functions/inverseOfStat';
import killableMonsters from '../data/killableMonsters';
import { KillableMonster } from '../types';

const { floor, max } = Math;

export default function calculateMonsterFood(
	monster: Readonly<KillableMonster>,
	user: Readonly<KlasaUser>
): [number, string] {
	let { healAmountNeeded, attackStyleToUse, attackStylesUsed } = monster;

	if (!healAmountNeeded || !attackStyleToUse || !attackStylesUsed) {
		return [0, ''];
	}

	if (monster.name === 'Koschei the deathless') {
		return [killableMonsters.find(m => m.id === monster.id)!.healAmountNeeded!, ''];
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

	const gearStats = user.getGear(gearToCheck).stats;

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

	const hasAbyssalCape = user.hasItemEquippedAnywhere('Abyssal cape');
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
