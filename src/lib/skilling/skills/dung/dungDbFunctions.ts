import { reduceNumByPercent } from 'e';
import { KlasaUser } from 'klasa';

import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../data/CollectionsExport';
import { skillsMeetRequirements } from '../../../util';
import { SkillsEnum } from '../../types';
import { requiredSkills } from './dungData';

export function hasRequiredLevels(user: KlasaUser, floor: number) {
	return skillsMeetRequirements(user.rawSkills, requiredSkills(floor));
}

export function maxFloorUserCanDo(user: KlasaUser) {
	return [7, 6, 5, 4, 3, 2, 1].find(floor => hasRequiredLevels(user, floor)) || 1;
}

export function gorajanShardChance(user: KlasaUser) {
	let goraShardBoosts = [];
	let baseRate = 2000;
	if (user.hasItemEquippedAnywhere('Dungeoneering master cape')) {
		baseRate /= 2;
		goraShardBoosts.push('2x for Dung. mastery');
	} else if (user.skillLevel(SkillsEnum.Dungeoneering) >= 99) {
		baseRate = reduceNumByPercent(baseRate, 30);
		goraShardBoosts.push('30% for 99+ Dungeoneering');
	}

	if (user.hasItemEquippedAnywhere('Ring of luck')) {
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

export function numberOfGorajanOutfitsEquipped(user: KlasaUser) {
	let num = 0;
	for (const outfit of data) {
		if (user.getGear(outfit[1]).hasEquipped(outfit[0], true)) num++;
	}
	return num;
}
