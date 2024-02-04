import { type Tame, tame_growth } from '@prisma/client';
import { round } from 'e';
import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { getSimilarItems } from '../data/similarItems';
import { prisma } from '../settings/prisma';
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
	nickname: string | null;
	maxSupportLevel: number;
	growthLevel: number;
	currentSupportLevel: number;

	private currentLevel(maxLevel: number) {
		return round(maxLevel / this.growthLevel, 2);
	}

	constructor(tame: Tame) {
		this.tame = tame;
		this.id = tame.id;
		this.nickname = tame.nickname;
		this.userID = tame.user_id;
		this.species = tameSpecies.find(i => i.id === tame.species_id)!;
		this.growthStage = tame.growth_stage;
		this.fedItems = new Bank(this.tame.fed_items as ItemBank);
		this.equippedArmor = tame.equipped_armor === null ? null : getOSItem(tame.equipped_armor);
		this.equippedPrimary = tame.equipped_primary === null ? null : getOSItem(tame.equipped_primary);
		this.maxSupportLevel = tame.max_support_level;
		this.growthLevel = 3 - [tame_growth.baby, tame_growth.juvenile, tame_growth.adult].indexOf(tame.growth_stage);
		this.currentSupportLevel = this.currentLevel(this.maxSupportLevel);
	}

	toString() {
		return `${this.nickname ?? this.species.name}`;
	}

	hasBeenFed(itemID: number | string) {
		const { id } = Items.get(itemID)!;
		const items = getSimilarItems(id);
		return items.some(i => this.fedItems.has(i));
	}

	hasEquipped(item: number | string) {
		const { id } = Items.get(item)!;
		const items = getSimilarItems(id);
		return items.some(i => this.equippedArmor?.id === i || this.equippedPrimary?.id === i);
	}

	async addToStatsBank(
		key:
			| 'total_cost'
			| 'demonic_jibwings_saved_cost'
			| 'third_age_jibwings_loot'
			| 'abyssal_jibwings_loot'
			| 'implings_loot',
		bank: Bank
	) {
		await prisma.tame.update({
			where: {
				id: this.id
			},
			data: {
				[key]: new Bank(this.tame[key] as ItemBank).add(bank).bank
			}
		});
	}
}
