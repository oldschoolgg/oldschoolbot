import { KlasaUser } from 'klasa';
import { O } from 'ts-toolbelt';

import { GearSetupTypes, GearStat, maxDefenceStats, maxOffenceStats, maxOtherStats } from '../../gear';
import { inverseOfOffenceStat } from '../../gear/functions/inverseOfStat';
import { calcWhatPercent, reduceNumByPercent } from '../../util';
import { KillableMonster } from '../types';

const { floor, max } = Math;

export default function calculateMonsterFood(
	monster: O.Readonly<KillableMonster>,
	user: O.Readonly<KlasaUser>,
	burstOrBarrage: boolean = false
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

	if (burstOrBarrage) {
		attackStyleToUse = GearStat.AttackMagic;
		gearToCheck = GearSetupTypes.Mage;
	}

	const gear = user.getGear(gearToCheck);
	const gearStats = gear.stats;

	if (gearToCheck === GearSetupTypes.Melee) {
		attackStyleToUse = GearStat[gear.getHighestMeleeStat()];
	}

	const strengthStat =
		gearToCheck === GearSetupTypes.Melee
			? GearStat.MeleeStrength
			: gearToCheck === GearSetupTypes.Range
			? GearStat.RangedStrength
			: GearStat.MagicDamage;

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
	totalPercentOfGearLevel *= 0.5;
	const usersStyleOff = gearStats[attackStyleToUse];
	const maxStyleOff = maxOffenceStats[attackStyleToUse];
	const offPercent = floor(calcWhatPercent(usersStyleOff, maxStyleOff) * 0.75);
	messages.push(
		`Your ${attackStyleToUse} bonus is ${offPercent}% of the best (${usersStyleOff} out of ${maxStyleOff})`
	);
	totalOffensivePercent = offPercent;

	const maxUserStr = gearStats[strengthStat];
	const maxStr = maxOtherStats[strengthStat];
	const strPercent = floor(calcWhatPercent(maxUserStr, maxStr));
	messages.push(`Your ${strengthStat} bonus is ${strPercent}% of the best (${maxUserStr} out of ${maxStr})`);
	totalOffensivePercent += strPercent / 2;

	// Get average of all defensive%'s and limit it to a cap of 50
	totalPercentOfGearLevel = Math.min(floor(max(0, totalPercentOfGearLevel / attackStylesUsed.length)), 50);
	// Floor at 0 and cap at 75
	totalOffensivePercent = Math.min(floor(max(0, totalOffensivePercent)), 75);

	messages.push(`You use ${floor(totalPercentOfGearLevel)}% less food because of your defensive stats.`);
	healAmountNeeded = reduceNumByPercent(healAmountNeeded, totalPercentOfGearLevel);
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
