import type { Tame, TameActivity } from '@prisma/client';
import { Time, objectEntries } from 'e';
import { Bank, Misc, Monsters } from 'oldschooljs';
import type { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { ChambersOfXeric, TheatreOfBlood } from 'oldschooljs/dist/simulation/misc';

import killableMonsters, { NightmareMonster } from './minions/data/killableMonsters';
import { customDemiBosses } from './minions/data/killableMonsters/custom/demiBosses';
import { Planks } from './minions/data/planks';
import type { KillableMonster } from './minions/types';

import type { handleFinish } from '../tasks/tames/tameTasks';
import Tanning from './skilling/skills/crafting/craftables/tanning';
import type { MTame } from './structures/MTame';
import { assert, calculateSimpleMonsterDeathChance } from './util';
import getOSItem from './util/getOSItem';
import { handleSpecialCoxLoot } from './util/handleSpecialCoxLoot';
import itemID from './util/itemID';
import resolveItems from './util/resolveItems';

export enum TameSpeciesID {
	Igne = 1,
	Monkey = 2,
	Eagle = 3
}

interface FeedableItem {
	item: Item;
	tameSpeciesCanBeFedThis: TameSpeciesID[];
	description: string;
	announcementString: string;
}

export const tameFeedableItems: FeedableItem[] = [
	{
		item: getOSItem('Ori'),
		description: '25% extra loot',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Igne],
		announcementString: 'Your tame will now get 25% extra loot!'
	},
	{
		item: getOSItem('Zak'),
		description: '+35 minutes longer max trip length',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Igne, TameSpeciesID.Monkey],
		announcementString: 'Your tame now has a much longer max trip length!'
	},
	{
		item: getOSItem('Abyssal cape'),
		description: '20% food reduction',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Igne],
		announcementString: 'Your tame now has 20% food reduction!'
	},
	{
		item: getOSItem('Voidling'),
		description: '10% faster collecting',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Monkey],
		announcementString: 'Your tame can now collect items 10% faster thanks to the Voidling helping them teleport!'
	},
	{
		item: getOSItem('Ring of endurance'),
		description: '10% faster collecting',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Monkey],
		announcementString:
			'Your tame can now collect items 10% faster thanks to the Ring of endurance helping them run for longer!'
	},
	{
		item: getOSItem('Dwarven warhammer'),
		description: '30% faster PvM',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Igne],
		announcementString: "Your tame can now kill 30% faster! It's holding the Dwarven warhammer in its claws..."
	},
	{
		item: getOSItem('Mr. E'),
		description: 'Chance to get 2x loot',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Igne, TameSpeciesID.Monkey],
		announcementString: "With Mr. E's energy absorbed, your tame now has a chance at 2x loot!"
	},
	{
		item: getOSItem('Klik'),
		description: 'Makes tanning spell faster',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Monkey],
		announcementString:
			"Your tame uses a spell to infuse Klik's fire breathing ability into itself. It can now tan hides much faster."
	},
	{
		item: getOSItem('Impling locator'),
		description: 'Allows your tame to passively catch implings',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Eagle, TameSpeciesID.Igne],
		announcementString: 'Your tame now has the ability to find and catch implings.'
	},
	{
		item: getOSItem('Elder knowledge'),
		description: 'Allows your tame to complete elder clues and gives a chance of increased loot.',
		tameSpeciesCanBeFedThis: [TameSpeciesID.Eagle],
		announcementString: 'Your tame now has the ability to complete elder clues and a chance of increased loot.'
	}
];

export const seaMonkeyStaves = [
	{
		tier: 1,
		item: getOSItem('Seamonkey staff (t1)'),
		creationCost: new Bank().add('Polypore staff'),
		userMagicLevel: 95,
		description: 'Can cast basic spells.'
	},
	{
		tier: 2,
		item: getOSItem('Seamonkey staff (t2)'),
		creationCost: new Bank().add('Seamonkey staff (t1)').add('Oceanic relic'),
		userMagicLevel: 105,
		description: 'Can cast advanced spells.'
	},
	{
		tier: 3,
		item: getOSItem('Seamonkey staff (t3)'),
		creationCost: new Bank().add('Seamonkey staff (t2)').add('Aquifer aegis'),
		userMagicLevel: 115,
		description: 'Can cast advanced spells, faster.'
	}
] as const;

export interface SeaMonkeySpell {
	id: 1 | 2 | 3 | 4;
	tierRequired: number;
	name: string;
	description: string;
	itemIDs: number[];
}

export const seaMonkeySpells: SeaMonkeySpell[] = [
	{
		id: 1,
		tierRequired: 2,
		name: 'Tan Leather',
		description: 'Tan leather into soft leather.',
		itemIDs: Tanning.map(i => i.id)
	},
	{
		id: 2,
		tierRequired: 2,
		name: 'Plank Make',
		description: 'Create planks from logs.',
		itemIDs: Planks.map(i => i.outputItem)
	},
	{
		id: 3,
		tierRequired: 2,
		name: 'Spin flax',
		description: 'Spin flax into bowstrings.',
		itemIDs: [itemID('Bow string')]
	},
	{
		id: 4,
		tierRequired: 2,
		name: 'Superglass make',
		description: 'Turns seaweed/sand into molten glass',
		itemIDs: [itemID('Molten glass')]
	}
];

export const igneArmors = [
	{
		item: getOSItem('Dragon igne armor'),
		coxDeathChance: 85,
		foodReduction: 5,
		nightmareDeathChance: 55
	},
	{
		item: getOSItem('Barrows igne armor'),
		coxDeathChance: 75,
		foodReduction: 8,
		nightmareDeathChance: 33
	},
	{
		item: getOSItem('Volcanic igne armor'),
		coxDeathChance: 65,
		foodReduction: 10,
		nightmareDeathChance: 15
	},
	{
		item: getOSItem('Justiciar igne armor'),
		coxDeathChance: 50,
		foodReduction: 15,
		nightmareDeathChance: 8
	},
	{
		item: getOSItem('Drygore igne armor'),
		coxDeathChance: 30,
		foodReduction: 22,
		nightmareDeathChance: 4
	},
	{
		item: getOSItem('Dwarven igne armor'),
		coxDeathChance: 10,
		foodReduction: 27,
		nightmareDeathChance: 1.5
	},
	{
		item: getOSItem('Gorajan igne armor'),
		coxDeathChance: 5,
		foodReduction: 33,
		nightmareDeathChance: 0.5
	}
].map(i => ({ ...i, tameSpecies: [TameSpeciesID.Igne], slot: 'equipped_armor' as const }));

export type TameKillableMonster = {
	loot: (opts: { quantity: number; tame: MTame }) => Bank;
	deathChance?: (opts: { tame: Tame; kc: number }) => number;
	oriWorks?: boolean;
	mustBeAdult?: boolean;
	minArmorTier?: Item;
} & Omit<KillableMonster, 'table'>;

function calcPointsForTame(tame: MTame) {
	const lvl = tame.maxCombatLevel;
	if (lvl < 75) return 25_000;
	if (lvl < 80) return 26_500;
	if (lvl < 85) return 28_000;
	if (lvl < 90) return 30_000;
	return 35_000;
}

export const tameKillableMonsters: TameKillableMonster[] = [
	{
		id: 334_912,
		name: 'Chambers of Xeric',
		aliases: ['cox', 'chambers of xeric'],
		timeToFinish: Time.Minute * 90,
		emoji: '<:Dharoks_helm:403038864199122947>',
		wildy: false,
		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		loot({ quantity, tame }) {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				loot.add(
					ChambersOfXeric.complete({ team: [{ id: '1', personalPoints: calcPointsForTame(tame) }] })['1']
				);
				handleSpecialCoxLoot(null, loot);
			}

			return loot;
		},
		deathChance: ({ tame }) => {
			const armorEquipped = tame.equipped_armor;
			if (!armorEquipped) return 95;
			const armorObj = igneArmors.find(i => i.item.id === armorEquipped)!;
			assert(Boolean(armorObj), `${armorEquipped} not valid armor`);
			return armorObj.coxDeathChance;
		},
		healAmountNeeded: 1588,
		mustBeAdult: true,
		oriWorks: false,
		itemCost: {
			qtyPerKill: 1,
			itemCost: new Bank().add('Stamina potion(4)', 2)
		}
	},
	{
		id: 315_932,
		name: 'Theatre of Blood',
		aliases: ['tob', 'theatre of blood'],
		timeToFinish: Time.Minute * 90,
		itemsRequired: resolveItems([]),
		loot({ quantity }) {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				const thisLoot = TheatreOfBlood.complete({
					hardMode: true,
					team: [
						{ id: '1', deaths: [] },
						{ id: '2', deaths: [] }
					]
				});
				loot.add(thisLoot.loot['1']);
			}

			return loot;
		},
		deathChance: ({ tame }) => {
			const armorEquipped = tame.equipped_armor;
			if (!armorEquipped) return 95;
			const armorObj = igneArmors.find(i => i.item.id === armorEquipped)!;
			return armorObj.coxDeathChance;
		},
		healAmountNeeded: 1888,
		mustBeAdult: true,
		oriWorks: false
	},
	{
		id: NightmareMonster.id,
		name: 'The Nightmare',
		aliases: ['nightmare', 'the nightmare'],
		timeToFinish: Time.Minute * 35,
		itemsRequired: resolveItems([]),
		loot({ quantity }) {
			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				const _loot = Misc.Nightmare.kill({
					team: [
						{
							id: '1',
							damageDone: 2400
						}
					],
					isPhosani: false
				});
				loot.add(_loot['1']);
			}

			return loot;
		},
		deathChance: ({ tame }) => {
			const armorEquipped = tame.equipped_armor;
			if (!armorEquipped) return 80;
			const armorObj = igneArmors.find(i => i.item.id === armorEquipped)!;
			return armorObj.nightmareDeathChance;
		},
		healAmountNeeded: 900,
		mustBeAdult: true,
		oriWorks: false
	},
	...killableMonsters.map(
		(i): TameKillableMonster => ({
			...i,
			loot: ({ quantity }) => {
				return i.table.kill(quantity, {});
			},
			deathChance: ({ kc }) => {
				if (i.deathProps) {
					return calculateSimpleMonsterDeathChance({ ...i.deathProps, currentKC: kc });
				}
				return 0;
			}
		})
	)
];

const overrides = [
	{
		id: customDemiBosses.Nihiliz.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.Treebeard.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.QueenBlackDragon.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.SeaKraken.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: customDemiBosses.Malygos.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: Monsters.Callisto.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: Monsters.Vetion.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	},
	{
		id: Monsters.Venenatis.id,
		minArmorTier: getOSItem('Justiciar igne armor')
	}
] as const;

for (const override of overrides) {
	const obj = tameKillableMonsters.find(i => i.id === override.id)!;
	for (const [key, val] of objectEntries(override)) {
		// @ts-ignore trust me
		obj[key] = val;
	}
}

export async function getIgneTameKC(tame: Tame) {
	const result = await prisma.$queryRaw<{ mid: number; kc: number }[]>`SELECT (data->>'monsterID')::int AS mid, SUM((data->>'quantity')::int)::int AS kc
										  FROM tame_activity
										  WHERE tame_id = ${tame.id}
										  AND completed = true
										  GROUP BY data->>'monsterID';`;
	const namedBank: Record<string, number> = {};
	const idBank: Record<number, number> = {};
	for (const { mid, kc } of result) {
		const mon = tameKillableMonsters.find(i => i.id === mid);
		if (!mon) continue;
		namedBank[mon.name] = kc;
		idBank[mon.id] = kc;
	}

	return { namedBank, idBank, sortedTuple: Object.entries(namedBank).sort((a, b) => b[1] - a[1]) };
}

export type Nursery = {
	egg: {
		species: number;
		insertedAt: number;
	} | null;
	eggsHatched: number;
	hasFuel: boolean;
} | null;

export enum TameType {
	Combat = 'pvm',
	Gatherer = 'collect',
	Support = 'support',
	Artisan = 'craft'
}

export interface TameTaskCombatOptions {
	type: TameType.Combat;
	monsterID: number;
	quantity: number;
}

export interface TameTaskGathererOptions {
	type: TameType.Gatherer;
	itemID: number;
	quantity: number;
}

export interface TameTaskSpellCastingOptions {
	type: 'SpellCasting';
	spellID: number;
	itemID: number;
	quantity: number;
	loot: ItemBank;
}

export interface TameTaskClueOptions {
	type: 'Clues';
	clueID: number;
	quantity: number;
}

export interface ArbitraryTameActivity {
	name: string;
	id: 'Tempoross' | 'Wintertodt';
	run: (opts: {
		previousTameCL: Bank;
		handleFinish: typeof handleFinish;
		user: MUser;
		tame: MTame;
		duration: number;
		activity: TameActivity;
	}) => Promise<void>;
	allowedTames: TameSpeciesID[];
}

interface ArbitraryTameActivityData {
	type: ArbitraryTameActivity['id'];
}

export type TameTaskOptions =
	| ArbitraryTameActivityData
	| TameTaskCombatOptions
	| TameTaskGathererOptions
	| TameTaskSpellCastingOptions
	| TameTaskClueOptions;

export const tameSpecies: Species[] = [
	{
		id: TameSpeciesID.Igne,
		type: TameType.Combat,
		name: 'Igne',
		variants: [1, 2, 3],
		shinyVariant: 4,
		shinyChance: 30,
		combatLevelRange: [70, 100],
		artisanLevelRange: [1, 10],
		supportLevelRange: [1, 10],
		gathererLevelRange: [1, 10],
		relevantLevelCategory: 'combat',
		hatchTime: Time.Hour * 18.5,
		egg: getOSItem(48_210),
		mergingCost: new Bank()
			.add('Ignecarus scales', 100)
			.add('Zenyte', 6)
			.add('Onyx', 10)
			.add('Draconic visage', 1)
			.add('Soul rune', 2500)
			.add('Elder rune', 100)
			.add('Astral rune', 600)
			.add('Coins', 10_000_000),
		emoji: '<:dragonEgg:858948148641660948>',
		emojiID: '858948148641660948'
	},
	{
		id: TameSpeciesID.Monkey,
		type: TameType.Gatherer,
		name: 'Monkey',
		variants: [1, 2, 3],
		shinyVariant: 4,
		shinyChance: 60,
		combatLevelRange: [12, 24],
		artisanLevelRange: [1, 10],
		supportLevelRange: [1, 10],
		gathererLevelRange: [75, 100],
		relevantLevelCategory: 'gatherer',
		hatchTime: Time.Hour * 4.5,
		egg: getOSItem('Monkey egg'),
		emoji: '<:monkey_egg:883326001445224488>',
		emojiID: '883326001445224488',
		mergingCost: new Bank()
			.add('Banana', 3000)
			.add('Magic banana', 50)
			.add('Chimpling jar')
			.add('Soul rune', 2500)
			.add('Elder rune', 100)
			.add('Astral rune', 600)
			.add('Coins', 10_000_000)
	},
	{
		id: TameSpeciesID.Eagle,
		type: TameType.Support,
		name: 'Eagle',
		variants: [1, 2, 3],
		shinyVariant: 4,
		shinyChance: 60,
		combatLevelRange: [5, 25],
		artisanLevelRange: [1, 10],
		supportLevelRange: [50, 100],
		gathererLevelRange: [20, 40],
		relevantLevelCategory: 'support',
		hatchTime: Time.Hour * 4.5,
		egg: getOSItem('Eagle egg'),
		emoji: '<:EagleEgg:1201712371371085894>',
		emojiID: '1201712371371085894',
		mergingCost: new Bank()
			.add('Solite', 150)
			.add('Soul rune', 2500)
			.add('Elder rune', 100)
			.add('Astral rune', 600)
			.add('Coins', 10_000_000)
	}
];

export interface Species {
	id: TameSpeciesID;
	type: TameType;
	name: string;
	// Tame type within its specie
	variants: number[];
	shinyVariant: number;
	shinyChance: number;
	/**
	 * Tames get assigned a max level in these ranges,
	 * in a bell curve fashion, where the middle of the range
	 * is significantly more likely than the head/tail of the range.
	 *
	 * The maximum level is always 100. The minimum is 1.
	 *
	 * If your tame gets assigned a max level of 80,
	 * as a baby, the level will be (80/4). Fully grown, adult,
	 * it will be 80.
	 */
	combatLevelRange: [number, number];
	artisanLevelRange: [number, number];
	supportLevelRange: [number, number];
	gathererLevelRange: [number, number];
	relevantLevelCategory: 'combat' | 'artisan' | 'support' | 'gatherer';
	hatchTime: number;
	egg: Item;
	mergingCost: Bank;
	emoji: string;
	emojiID: string;
}

export async function createTameTask({
	user,
	channelID,
	type,
	data,
	duration,
	selectedTame,
	fakeDuration,
	deaths
}: {
	user: MUser;
	channelID: string;
	type: TameTaskOptions['type'];
	data: TameTaskOptions;
	duration: number;
	selectedTame: Tame;
	fakeDuration?: number;
	deaths?: number;
}) {
	const activity = prisma.tameActivity.create({
		data: {
			user_id: user.id,
			start_date: new Date(),
			finish_date: new Date(Date.now() + duration),
			completed: false,
			type,
			data: data as any,
			channel_id: channelID,
			duration: Math.floor(duration),
			tame_id: selectedTame.id,
			fake_duration: fakeDuration,
			deaths
		}
	});

	return activity;
}

export async function getAllUserTames(userID: bigint | string) {
	const tames = await prisma.tame.findMany({
		where: {
			user_id: userID.toString()
		},
		include: {
			tame_activity: {
				where: {
					completed: false
				}
			}
		}
	});
	return tames;
}
