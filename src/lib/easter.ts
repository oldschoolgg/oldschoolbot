import { calcWhatPercent, roll } from 'e';
import { resolveItems } from './util.js';

// "Tasty",

export const easterEventMainTable = resolveItems([
	'Easter egg (1)',
	'Easter egg (2)',
	'Easter egg (3)',
	'Easter egg (4)',
	'Easter egg (5)',
	'Easter egg (6)',
	'Easter egg (7)',
	'Easter egg (8)',
	'Easter egg (9)',
	'Easter egg (10)',
	'Easter egg (11)',
	'Easter egg (12)',
	'Easter egg (13)',
	'Easter egg (14)',
	'Easter cape (1)',
	'Easter cape (2)',
	'Monkey egg (Edible)',
	'Easter Bunny hat',
	'Easter Bunny top',
	'Easter Bunny legs',
	'Easter Bunny gloves',
	'Easter Bunny boots',
	'Easter Bunny tail',
	'Elven bunny ears',
	'Dragon bunny ears',
	'Tzhaar bunny ears',
	'Rune bunny ears',
	'Vyrewatch bunny ears',
	'Arceuus bunny ears',
	'Waddles'
]);

export const ALL_EASTER_PETS = resolveItems(['Leia', 'Eggy', 'Waddles', 'Tasty']);

const hoursActive = 12 * 10;
const totalMinutes = hoursActive * 60;
export const easterEventItemChance = Math.ceil((totalMinutes / easterEventMainTable.length) * 0.65);
export const tastyPetChance = easterEventItemChance * 30 * 2 * 1.5;

const samples = 5000;
let usersThatGot = 0;
for (let user = 0; user < samples; user++) {
	let successes = 0;
	for (let i = 0; i < totalMinutes; i++) {
		if (roll(tastyPetChance)) {
			successes++;
		}
	}
	if (successes > 0) {
		usersThatGot++;
	}
}
console.log(`Users that got the pet: ${calcWhatPercent(usersThatGot, samples)}% (${usersThatGot}/${samples})`);
