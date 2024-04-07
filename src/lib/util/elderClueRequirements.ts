import { notEmpty, uniqueArr } from 'e';

import { gods } from '../bso/divineDominion';
import { BitField, BitFieldData, MAX_XP } from '../constants';
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
import { slayerMaskHelms } from '../data/slayerMaskHelms';
import resolveItems, { deepResolveItems } from './resolveItems';
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

export const elderSherlockItems = deepResolveItems([
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
	'Deathtouched dart',
	'Tidal collector',
	'Atlantean trident',
	resolveItems(['Brackish blade', 'Ganodermic gloves', 'Ganodermic boots']),
	gods.map(g => ('pets' in g ? g.pets[g.pets.length - 1] : undefined)).filter(notEmpty),
	slayerMaskHelms.map(h => h.helm.id),
	resolveItems(['Elder rumble greegree', 'Gorilla rumble greegree'])
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
			`You have ${elderRequiredClueCLItems.length - doesntHave.length}/${
				elderRequiredClueCLItems.length
			} required clue items in your collection log: ${doesntHave.slice(0, 20).map(itemNameFromID).join(', ')}.`
		);
	}

	// Falo the Bard items (must OWN)
	const sherlockDoesntHave = elderSherlockItems.filter(id =>
		(Array.isArray(id) ? id : getSimilarItems(id)).every(similarId => !user.allItemsOwned.has(similarId))
	);
	if (sherlockDoesntHave.length > 0) {
		unmetRequirements.push(
			`You need the following Falo the Bard items in your bank: ${sherlockDoesntHave
				.slice(0, 20)
				.map(itemOrItems =>
					Array.isArray(itemOrItems)
						? itemOrItems.map(itemNameFromID).join(' OR ')
						: itemNameFromID(itemOrItems)
				)
				.join(', ')}.`
		);
	}

	// Bitfields
	const requiredBitfields = [
		BitField.HasScrollOfFarming,
		BitField.HasScrollOfLongevity,
		BitField.HasScrollOfTheHunt,
		BitField.HasMoondashCharm,
		BitField.HasDaemonheimAgilityPass,
		BitField.HasGuthixEngram,
		BitField.HasPlantedIvy,
		BitField.HasArcaneScroll
	];
	const bitfieldsDoesntHave = requiredBitfields.filter(bit => !user.bitfield.includes(bit));
	if (bitfieldsDoesntHave.length > 0) {
		unmetRequirements.push(
			`You need the following bitfields: ${bitfieldsDoesntHave.map(bit => BitFieldData[bit].name).join(', ')}.`
		);
	}

	const clueScores = await user.calcActualClues();
	if (clueScores.clueCounts.Grandmaster < 100) {
		unmetRequirements.push('You need atleast 100 Grandmaster clues completed.');
	}

	return {
		unmetRequirements
	};
}
