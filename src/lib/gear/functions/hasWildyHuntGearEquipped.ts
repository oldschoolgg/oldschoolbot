import { GearSetup } from '..';
import getOSItem from '../../util/getOSItem';

export function hasWildyHuntGearEquipped(setup: GearSetup): [boolean, string, number] {
	const userBodyID = setup.body?.item;
	const userLegsID = setup.legs?.item;

	const minimumStatRequirmentsBodyLegs = {
		DefenceMage: 76,
		DefenceRanged: 84,
		DefenceStab: 70,
		DefenceSlash: 60,
		DefenceCrush: 75
	};

	if (!userBodyID || !userLegsID) {
		return [false, `Body and leg armour equipped in misc setup.`, 0];
	}

	const userBodyItem = getOSItem(userBodyID);
	const userLegsItem = getOSItem(userLegsID);

	if (!userBodyItem.equipment || !userLegsItem.equipment) {
		return [false, `The body and or legs equipped in misc setup dosen't have any stats.`, 0];
	}

	const userStatsBodyLegs = {
		userDefenceMage:
			userBodyItem.equipment.defence_magic + userLegsItem.equipment.defence_magic,
		userDefenceRanged:
			userBodyItem.equipment.defence_ranged + userLegsItem.equipment.defence_ranged,
		userDefenceStab: userBodyItem.equipment.defence_stab + userLegsItem.equipment.defence_stab,
		userDefenceSlash:
			userBodyItem.equipment.defence_slash + userLegsItem.equipment.defence_slash,
		userDefenceCrush:
			userBodyItem.equipment.defence_crush + userLegsItem.equipment.defence_crush
	};

	if (
		userStatsBodyLegs.userDefenceMage < minimumStatRequirmentsBodyLegs.DefenceMage ||
		userStatsBodyLegs.userDefenceRanged < minimumStatRequirmentsBodyLegs.DefenceRanged ||
		userStatsBodyLegs.userDefenceCrush < minimumStatRequirmentsBodyLegs.DefenceCrush ||
		userStatsBodyLegs.userDefenceSlash < minimumStatRequirmentsBodyLegs.DefenceSlash ||
		userStatsBodyLegs.userDefenceStab < minimumStatRequirmentsBodyLegs.DefenceStab
	) {
		return [
			false,
			`The combined defensive stats for the body and legs equipped in misc setup dosen't meet the minimum required stats: ${minimumStatRequirmentsBodyLegs.DefenceMage} Magic Defence, ${minimumStatRequirmentsBodyLegs.DefenceRanged} Ranged Defence, ${minimumStatRequirmentsBodyLegs.DefenceStab} Stab Defence, ${minimumStatRequirmentsBodyLegs.DefenceSlash} Slash Defence, ${minimumStatRequirmentsBodyLegs.DefenceCrush} Crush Defence.`,
			0
		];
	}

	const maximumStatsBodyLegs = {
		DefenceMage: 216,
		DefenceRanged: 244,
		DefenceStab: 227,
		DefenceSlash: 222,
		DefenceCrush: 217
	};

	let score =
		userStatsBodyLegs.userDefenceMage / maximumStatsBodyLegs.DefenceMage +
		userStatsBodyLegs.userDefenceRanged / maximumStatsBodyLegs.DefenceRanged +
		userStatsBodyLegs.userDefenceCrush / maximumStatsBodyLegs.DefenceCrush +
		userStatsBodyLegs.userDefenceSlash / maximumStatsBodyLegs.DefenceSlash +
		userStatsBodyLegs.userDefenceStab / maximumStatsBodyLegs.DefenceStab;

	score /= 5;

	score *= 100;

	score = Math.round(score);

	return [
		true,
		`The combined defensive stats for the body and legs equipped in misc setup is ${score}% of maximum possible stats in each defensive stats.`,
		score
	];
}
