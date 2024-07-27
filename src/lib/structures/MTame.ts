import { type Tame, tame_growth } from '@prisma/client';
import { Time, roll, round } from 'e';
import { Bank, Items } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import { getSimilarItems } from '../data/similarItems';

import { type Species, TameSpeciesID, tameFeedableItems, tameSpecies } from '../tames';
import type { ItemBank } from '../types';
import getOSItem from '../util/getOSItem';

export class MTame {
	tame: Tame;
	id: number;
	userID: string;
	species: Species;
	growthStage: tame_growth;
	fedItems: Bank;
	equippedArmor: Item | null;
	equippedPrimary: Item | null;
	nickname: string | null;
	growthLevel: number;
	currentSupportLevel: number;
	totalLoot: Bank;
	speciesVariant: number;

	maxSupportLevel: number;
	maxCombatLevel: number;
	maxGathererLevel: number;
	maxArtisanLevel: number;
	growthPercentage: number;

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
		this.growthLevel = 3 - [tame_growth.baby, tame_growth.juvenile, tame_growth.adult].indexOf(tame.growth_stage);
		this.totalLoot = new Bank(this.tame.max_total_loot as ItemBank);
		this.speciesVariant = tame.species_variant;
		this.growthPercentage = tame.growth_percent;

		this.maxSupportLevel = tame.max_support_level;
		this.maxCombatLevel = tame.max_combat_level;
		this.maxGathererLevel = tame.max_gatherer_level;
		this.maxArtisanLevel = tame.max_artisan_level;

		this.currentSupportLevel = this.currentLevel(this.maxSupportLevel);
	}

	toString() {
		return `${this.nickname ?? this.species.name}`;
	}

	async addDuration(durationMilliseconds: number): Promise<string | null> {
		if (this.growthStage === tame_growth.adult) return null;
		const percentToAdd = durationMilliseconds / Time.Minute / 20;
		const newPercent = Math.max(1, Math.min(100, this.growthPercentage + percentToAdd));

		if (newPercent >= 100) {
			const newTame = await prisma.tame.update({
				where: {
					id: this.id
				},
				data: {
					growth_stage: this.growthStage === tame_growth.baby ? tame_growth.juvenile : tame_growth.adult,
					growth_percent: 0
				}
			});
			return `Your tame has grown into a ${newTame.growth_stage}!`;
		}

		await prisma.tame.update({
			where: {
				id: this.id
			},
			data: {
				growth_percent: newPercent
			}
		});

		return `Your tame has grown ${percentToAdd.toFixed(2)}%!`;
	}

	doubleLootCheck(loot: Bank) {
		const hasMrE = this.fedItems.has('Mr. E');
		let doubleLootMsg = '';
		if (hasMrE && roll(12)) {
			loot.multiply(2);
			doubleLootMsg = '\n**2x Loot from Mr. E**';
		}

		return { loot, doubleLootMsg };
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

	isMaxedIgneTame() {
		return (
			this.species.id === TameSpeciesID.Igne &&
			this.growthStage === 'adult' &&
			this.equippedPrimary?.name === 'Gorajan igne claws' &&
			this.equippedArmor?.name === 'Gorajan igne armor' &&
			tameFeedableItems
				.filter(t => t.tameSpeciesCanBeFedThis.includes(TameSpeciesID.Igne))
				.map(i => i.item.id)
				.every(id => this.hasBeenFed(id))
		);
	}

	async addToStatsBank(
		key:
			| 'total_cost'
			| 'demonic_jibwings_saved_cost'
			| 'third_age_jibwings_loot'
			| 'abyssal_jibwings_loot'
			| 'implings_loot'
			| 'elder_knowledge_loot_bank',
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
