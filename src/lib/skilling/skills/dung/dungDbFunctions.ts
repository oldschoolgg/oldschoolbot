import { reduceNumByPercent } from 'e';

import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../data/CollectionsExport';
import { skillsMeetRequirements } from '../../../util';
import { SkillsEnum } from '../../types';
import { requiredSkills } from './dungData';

export function hasRequiredLevels(user: MUser, floor: number) {
	return skillsMeetRequirements(user.skillsAsXP, requiredSkills(floor));
}

export function calcMaxFloorUserCanDo(user: MUser) {
	return [7, 6, 5, 4, 3, 2, 1].find(floor => hasRequiredLevels(user, floor)) || 1;
}

export function calcUserGorajanShardChance(user: MUser) {
	return calcGorajanShardChance({
		hasMasterCape: user.hasEquippedOrInBank('Dungeoneering master cape'),
		dungLevel: user.skillLevel(SkillsEnum.Dungeoneering),
		hasRingOfLuck: user.hasEquippedOrInBank('Ring of luck')
	});
}

export function calcGorajanShardChance({
	hasMasterCape,
	dungLevel,
	hasRingOfLuck
}: {
	hasMasterCape: boolean;
	dungLevel: number;
	hasRingOfLuck: boolean;
}) {
	const goraShardBoosts = [];
	let baseRate = 2000;
	if (hasMasterCape) {
		baseRate /= 2;
		goraShardBoosts.push('2x for Dung. mastery');
	} else if (dungLevel >= 99) {
		baseRate = reduceNumByPercent(baseRate, 30);
		goraShardBoosts.push('30% for 99+ Dungeoneering');
	}

	if (hasRingOfLuck) {
		baseRate = reduceNumByPercent(baseRate, 5);
		goraShardBoosts.push('5% for Ring of Luck');
	}
	return {
		chance: baseRate,
		boosts: goraShardBoosts
	};
}

const data = [
	[gorajanWarriorOutfit, 'melee'],
	[gorajanOccultOutfit, 'mage'],
	[gorajanArcherOutfit, 'range']
] as const;

export function numberOfGorajanOutfitsEquipped(user: MUser) {
	let num = 0;
	for (const outfit of data) {
		if (user.gear[outfit[1]].hasEquipped(outfit[0], true)) num++;
	}
	return num;
}
