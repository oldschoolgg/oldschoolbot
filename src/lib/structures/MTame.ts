import type { Tame } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Species, tameSpecies } from '../tames';
import type { ItemBank } from '../types';
import getOSItem from '../util/getOSItem';

export class MTame {
	tame: Tame;
	id: number;
	userID: string;
	species: Species;
	growthStage: string;
	fedItems: Bank;
	equippedArmor: Item | null;
	equippedPrimary: Item | null;

	constructor(tame: Tame) {
		this.tame = tame;
		this.id = tame.id;
		this.userID = tame.user_id;
		this.species = tameSpecies.find(i => i.id === tame.species_id)!;
		this.growthStage = tame.growth_stage;
		this.fedItems = new Bank(this.tame.fed_items as ItemBank);

		this.equippedArmor = tame.equipped_armor === null ? null : getOSItem(tame.equipped_armor);
		this.equippedPrimary = tame.equipped_primary === null ? null : getOSItem(tame.equipped_primary);
	}
}
