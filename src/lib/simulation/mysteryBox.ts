import Loot from 'oldschooljs/dist/structures/Loot';
import { Items } from 'oldschooljs';

export const mysteryBox = (qty = 1) => {
	const loot = new Loot();

	for (let i = 0; i < qty; i++) {
		loot.add(Items.random().id, 1);
	}

	return loot.values();
};
