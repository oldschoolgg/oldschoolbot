import { uniqueArr } from 'e';

import { MAX_XP } from '../constants';
import {
	cluesBeginnerCL,
	cluesEasyCL,
	cluesEliteCL,
	cluesGrandmasterCL,
	cluesHardCL,
	cluesMasterCL,
	cluesMediumCL,
	cluesSharedCL,
	expertCapesCL
} from '../data/CollectionsExport';
import { getSimilarItems } from '../data/similarItems';
import resolveItems from './resolveItems';
import { itemNameFromID } from './smallUtils';

export const elderRequiredClueCLItems = uniqueArr([
	...cluesGrandmasterCL,
	...cluesEliteCL,
	...cluesBeginnerCL,
	...cluesEasyCL,
	...cluesMediumCL,
	...cluesHardCL,
	...cluesMasterCL,
	...cluesSharedCL
]);

export const elderSherlockItems = resolveItems([
	'Tzkal cape',
	'Axe of the high sungod',
	'Hellfire bow',
	'Ignis ring(i)',
	'Infernal bulwark',
	'Royal crossbow',
	'Spellbound ring(i)',
	'Titan ballista',
	'Ring of piercing (i)',
	'Drygore axe',
	'Dwarven warhammer',
	'Deathtouched dart'
]);

export const elderSherlockCLItems = resolveItems([
	'Ganodermic slayer helm',
	'Farseer kiteshield',
	'Elder rumble greegree',
	'Karambinana'
]);

export async function checkElderClueRequirements(user: MUser) {
	let unmetRequirements: string[] = [];

	// 120 all
	for (const [skill, lvl] of Object.entries(user.skillsAsLevels)) {
		if (lvl < 120) {
			unmetRequirements.push(`You need level 120 ${skill}.`);
		}
	}

	// Atleast 1 5b XP skill
	const highestSkill = Object.entries(user.skillsAsXP).sort((a, b) => b[1] - a[1])[0];
	if (highestSkill[1] < MAX_XP) {
		unmetRequirements.push(
			`You need atleast 1 skill with the max (5b) XP, your highest skill is ${
				highestSkill[0]
			} with ${highestSkill[1].toLocaleString()} XP.`
		);
	}

	// Atleast 2 expert capes
	let count = 0;
	for (const cape of expertCapesCL) {
		if (user.cl.has(cape)) count++;
	}
	if (count < 2) {
		unmetRequirements.push('You need to have bought atleast 2 Expert capes.');
	}

	// All clue cls excluding the ('Rare' ones)

	const doesntHave = elderRequiredClueCLItems.filter(id => !user.cl.has(id));
	if (doesntHave.length > 0) {
		unmetRequirements.push(
			`You need the following clue items in your collection log: ${doesntHave
				.slice(0, 20)
				.map(itemNameFromID)
				.join(', ')}.`
		);
	}

	// Sherlock items (must OWN)
	const sherlockDoesntHave = elderSherlockItems.filter(id =>
		getSimilarItems(id).every(similarId => !user.allItemsOwned.has(similarId))
	);
	if (sherlockDoesntHave.length > 0) {
		unmetRequirements.push(
			`You need the following sherlock items in your bank: ${sherlockDoesntHave
				.slice(0, 20)
				.map(itemNameFromID)
				.join(', ')}.`
		);
	}

	// Sherlock CL items (must be in CL)
	const sherlockCLDoesntHave = elderSherlockCLItems.filter(id =>
		getSimilarItems(id).every(similarId => !user.cl.has(similarId))
	);
	if (sherlockCLDoesntHave.length > 0) {
		unmetRequirements.push(
			`You need the following sherlock items in your collection log: ${sherlockCLDoesntHave
				.slice(0, 20)
				.map(itemNameFromID)
				.join(', ')}.`
		);
	}

	return {
		unmetRequirements
	};
}
