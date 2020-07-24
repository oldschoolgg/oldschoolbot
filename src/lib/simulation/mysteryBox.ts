import Loot from 'oldschooljs/dist/structures/Loot';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

export const mysteryBox = (qty = 1) => {
	const loot = new Loot();

	for (let i = 0; i < qty; i++) {
		loot.add(Items.filter(i => (i as Item).tradeable_on_ge).random().id, 1);
	}

	return loot.values();
};
