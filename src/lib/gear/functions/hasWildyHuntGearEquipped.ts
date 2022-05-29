import getOSItem from '../../util/getOSItem';
import { GearSetup } from '..';

export function hasWildyHuntGearEquipped(setup: GearSetup): [boolean, string, number] {
	const userBodyID = setup.body?.item;
	const userLegsID = setup.legs?.item;

	const minimumStatRequirementsBodyLegs = {
		DefenceMage: 68,
		DefenceRanged: 76,
		DefenceStab: 48,
		DefenceSlash: 58,
		DefenceCrush: 71
	};

	if (!userBodyID || !userLegsID) {
		return [false, 'Body and leg armour equipped in wildy setup.', 0];
	}

	const userBodyItem = getOSItem(userBodyID);
	const userLegsItem = getOSItem(userLegsID);

	if (!userBodyItem.equipment || !userLegsItem.equipment) {
		return [false, "The body and or legs equipped in wildy setup doesn't have any stats.", 0];
	}

	const userStatsBodyLegs = {
		userDefenceMage: userBodyItem.equipment.defence_magic + userLegsItem.equipment.defence_magic,
		userDefenceRanged: userBodyItem.equipment.defence_ranged + userLegsItem.equipment.defence_ranged,
		userDefenceStab: userBodyItem.equipment.defence_stab + userLegsItem.equipment.defence_stab,
		userDefenceSlash: userBodyItem.equipment.defence_slash + userLegsItem.equipment.defence_slash,
		userDefenceCrush: userBodyItem.equipment.defence_crush + userLegsItem.equipment.defence_crush
	};

	if (
		userStatsBodyLegs.userDefenceMage < minimumStatRequirementsBodyLegs.DefenceMage ||
		userStatsBodyLegs.userDefenceRanged < minimumStatRequirementsBodyLegs.DefenceRanged ||
		userStatsBodyLegs.userDefenceCrush < minimumStatRequirementsBodyLegs.DefenceCrush ||
		userStatsBodyLegs.userDefenceSlash < minimumStatRequirementsBodyLegs.DefenceSlash ||
		userStatsBodyLegs.userDefenceStab < minimumStatRequirementsBodyLegs.DefenceStab
	) {
		return [
			false,
			`The combined defensive stats for the body and legs equipped in wildy setup doesn't meet the minimum required stats: ${minimumStatRequirementsBodyLegs.DefenceMage} Magic Defence, ${minimumStatRequirementsBodyLegs.DefenceRanged} Ranged Defence, ${minimumStatRequirementsBodyLegs.DefenceStab} Stab Defence, ${minimumStatRequirementsBodyLegs.DefenceSlash} Slash Defence, ${minimumStatRequirementsBodyLegs.DefenceCrush} Crush Defence.`,
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
		`The combined defensive stats for the body and legs equipped in wildy setup is ${score}% of maximum possible stats in each defensive stats.`,
		score
	];
}
