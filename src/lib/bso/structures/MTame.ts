import { BSOItem } from '@/lib/bso/BSOItem.js';
import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';
import {
	type Species,
	TameSpeciesID,
	type TameTaskOptions,
	tameFeedableItems,
	tameSpecies
} from '@/lib/bso/tames/tames.js';

import { roll } from '@oldschoolgg/rng';
import { formatDuration, round, Time } from '@oldschoolgg/toolkit';
import { Bank, type Item, type ItemBank, Items } from 'oldschooljs';

import { type Prisma, type Tame, tame_growth } from '@/prisma/main.js';
import { getSimilarItems } from '@/lib/data/similarItems.js';
import { patronMaxTripBonus } from '@/lib/util/calcMaxTripLength.js';

export class MTame {
	tame: Tame;
	id: number;
	userID: string;
	species: Species;
	growthStage: tame_growth;
	equippedArmor: Item | null;
	equippedPrimary: Item | null;
	nickname: string | null;
	growthLevel: number;
	currentSupportLevel: number;
	speciesVariant: number;
	levelsFromEggFeed: number | null;
	lastActivityDate: Date | null;

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
		this.equippedArmor = tame.equipped_armor === null ? null : Items.getOrThrow(tame.equipped_armor);
		this.equippedPrimary = tame.equipped_primary === null ? null : Items.getOrThrow(tame.equipped_primary);
		this.growthLevel = 3 - [tame_growth.baby, tame_growth.juvenile, tame_growth.adult].indexOf(tame.growth_stage);
		this.speciesVariant = tame.species_variant;
		this.growthPercentage = tame.growth_percent;
		this.levelsFromEggFeed = tame.levels_from_egg_feed;
		this.lastActivityDate = tame.last_activity_date;

		this.maxSupportLevel = tame.max_support_level;
		this.maxCombatLevel = tame.max_combat_level;
		this.maxGathererLevel = tame.max_gatherer_level;
		this.maxArtisanLevel = tame.max_artisan_level;

		this.currentSupportLevel = this.currentLevel(this.maxSupportLevel);
	}

	private getLevel(type: 'combat' | 'gatherer' | 'support' | 'artisan') {
		const growth = this.growthLevel;
		switch (type) {
			case 'combat':
				return round(this.maxCombatLevel / growth, 2);
			case 'gatherer':
				return round(this.maxGathererLevel / growth, 2);
			case 'support':
				return round(this.maxSupportLevel / growth, 2);
			case 'artisan':
				return round(this.maxArtisanLevel / growth, 2);
		}
	}

	public isIgne() {
		return this.species.id === TameSpeciesID.Igne;
	}

	public isMonkey() {
		return this.species.id === TameSpeciesID.Monkey;
	}

	public isEagle() {
		return this.species.id === TameSpeciesID.Eagle;
	}

	get isShiny(): boolean {
		return this.speciesVariant === this.species.shinyVariant;
	}

	get totalLoot() {
		return new Bank(this.tame.max_total_loot as ItemBank);
	}

	get fedItems() {
		return new Bank(this.tame.fed_items as ItemBank);
	}

	get hatchDate() {
		return this.tame.date;
	}

	get totalCost() {
		return new Bank(this.tame.total_cost as ItemBank);
	}

	get elderKnowledgeLootBank() {
		return new Bank(this.tame.elder_knowledge_loot_bank as ItemBank);
	}

	toString() {
		return `${this.nickname ?? this.species.name}`;
	}

	relevantLevel(): number {
		const category = this.species.relevantLevelCategory;
		return this.getLevel(category);
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
		const { id } = Items.getItem(itemID)!;
		const items = getSimilarItems(id);
		return items.some(i => this.fedItems.has(i));
	}

	hasEquipped(item: number | string) {
		const { id } = Items.getItem(item)!;
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
				[key]: new Bank(this.tame[key] as ItemBank).add(bank).toJSON()
			}
		});
	}

	async update(data: Prisma.TameUncheckedUpdateInput) {
		Logging.logDebug(`Updating Tame[${this.id}] with data: ${JSON.stringify(data)}`);
		const newTame = await prisma.tame.update({
			where: { id: this.id },
			data
		});
		this.tame = newTame;
	}

	calcMaxTripLength({ user, activity }: { user: MUser; activity: TameTaskOptions['type'] }): {
		maxTripLength: number;
		messages: string[];
	} {
		const messages: string[] = [];

		let maxTripLength = Time.Minute * 20 * (4 - this.growthLevel);

		if (this.hasBeenFed(BSOItem.ZAK)) {
			maxTripLength += Time.Minute * 35;
			messages.push('+35mins trip length (ate a Zak)');
		}

		const patronBonus = patronMaxTripBonus(user) * 2;
		if (patronBonus > 0) {
			maxTripLength += patronBonus;
			messages.push(`+${formatDuration(patronBonus, true)} trip length (Patron bonus)`);
		}

		if (user.hasCard('vampire')) {
			maxTripLength += Time.Minute * 10;
			messages.push(`${BSOEmoji.VampireCard} +10mins trip length`);
		}

		if (activity === 'Clues') {
			if (
				this.equippedArmor &&
				[BSOItem.ABYSSAL_JIBWINGS_E, BSOItem.DEMONIC_JIBWINGS_E, BSOItem.THIRD_AGE_JIBWINGS_E].includes(
					this.equippedArmor.id
				)
			) {
				maxTripLength += Time.Minute * 30;
				messages.push('+30mins trip length for enhanced jibwings');
			}
		}

		return { maxTripLength, messages };
	}
}
