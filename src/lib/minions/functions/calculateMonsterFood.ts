import { KlasaUser } from 'klasa';
import { O } from 'ts-toolbelt';

import { GearSetupTypes, GearStat, maxDefenceStats, maxOffenceStats } from '../../gear';
import { inverseOfOffenceStat } from '../../gear/functions/inverseOfStat';
import { calcWhatPercent, reduceNumByPercent } from '../../util';
import { KillableMonster } from '../types';

const { floor, max } = Math;

export default function calculateMonsterFood(
	monster: O.Readonly<KillableMonster>,
	user: O.Readonly<KlasaUser>
): [number, string[]] {
	const messages: string[] = [];
	let { healAmountNeeded, attackStyleToUse, attackStylesUsed } = monster;

	if (!healAmountNeeded || !attackStyleToUse || !attackStylesUsed) {
		return [0, messages];
	}

	messages.push(`${monster.name} needs ${healAmountNeeded}HP worth of food per kill.`);

	let gearToCheck = GearSetupTypes.Melee;

	switch (attackStyleToUse) {
		case GearStat.AttackMagic:
			gearToCheck = GearSetupTypes.Mage;
			break;
		case GearStat.AttackRanged:
			gearToCheck = GearSetupTypes.Range;
			break;
		default:
			break;
	}

	const gearStats = user.getGear(gearToCheck).stats;

	let totalPercentOfGearLevel = 0;
	let totalOffensivePercent = 0;

	// Check all styles the monster uses for defensive%
	for (const style of attackStylesUsed) {
		const inverseStyle = inverseOfOffenceStat(style);
		const usersStyle = gearStats[inverseStyle];
		const maxStyle = maxDefenceStats[inverseStyle]!;
		const percent = floor(calcWhatPercent(usersStyle, maxStyle));
		messages.push(`Your ${inverseStyle} bonus is ${percent}% of the best (${usersStyle} out of ${maxStyle})`);
		totalPercentOfGearLevel += percent;
	}

	totalOffensivePercent = floor(calcWhatPercent(gearStats[attackStyleToUse], maxOffenceStats[attackStyleToUse]));

	// Get average of all defensive%'s and limit it to a cap of 95
	totalPercentOfGearLevel = Math.min(floor(max(0, totalPercentOfGearLevel / attackStylesUsed.length)), 95);
	// Floor at 0 and cap at 95
	totalOffensivePercent = Math.min(floor(max(0, totalOffensivePercent)), 95);

	messages.push(`You use ${floor(totalPercentOfGearLevel)}% less food because of your defensive stats.`);
	healAmountNeeded = floor(reduceNumByPercent(healAmountNeeded, totalPercentOfGearLevel));
	messages.push(`You use ${floor(totalOffensivePercent)}% less food because of your offensive stats.`);
	healAmountNeeded = floor(reduceNumByPercent(healAmountNeeded, totalOffensivePercent));

	messages.push(
		`You use ${(100 - calcWhatPercent(healAmountNeeded, monster.healAmountNeeded!)).toFixed(
			2
		)}% less food (${healAmountNeeded}HP instead of ${
			monster.healAmountNeeded
		}HP) because of your ${gearToCheck} gear`
	);

	return [healAmountNeeded, messages];
}
