import { divinationEnergies } from '@/lib/bso/divination.js';

import { itemID } from 'oldschooljs';

const i = itemID;
export const bsoShortNameMap: [number, string][] = [
	[i('Athelas'), 'athelas'],
	[i('Korulsi'), 'korulsi'],
	[i('Grimy korulsi'), 'korulsi'],
	[i('Athelas seed'), 'athelas'],
	[i('Mysterious seed'), 'mysterious'],
	[i('Mango seed'), 'mango'],
	[i('Avocado seed'), 'avocado'],
	[i('Lychee seed'), 'lychee'],
	[i('Blood orange seed'), 'b.orange'],
	[i('Spirit weed seed'), 'spirit.w'],
	[i('Spirit weed'), 'spirit.w'],
	[i('Advax berry seed'), 'advax'],
	[i('Advax berry'), 'advax'],
	[i('Divination Potion'), 'div'],
	[i('Elder logs'), 'elder'],
	[i('Clue scroll (grandmaster)'), 'grandmaster'],
	[i('Reward casket (grandmaster)'), 'grandmaster'],
	[i('Atomic energy'), 'atomic'],
	[i('Fruity zygomite spores'), 'fruity'],
	[i('Barky zygomite spores'), 'barky'],
	[i('Herbal zygomite spores'), 'herbal'],
	[i('Clue scroll (elder)'), 'elder'],
	[i('Reward casket (elder)'), 'elder']
];

for (const energy of divinationEnergies) {
	bsoShortNameMap.push([energy.item.id, energy.item.name.slice(0, 4)]);
	if (energy.boon) {
		bsoShortNameMap.push([energy.boon.id, energy.item.name.slice(0, 4)]);
	}
}
