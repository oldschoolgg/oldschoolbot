import { Emoji, Events } from '@oldschoolgg/toolkit/constants';
import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import {
	Bank,
	BrimstoneChest,
	EItem,
	EMonster,
	EliteMimicTable,
	HallowedSackTable,
	Implings,
	type Item,
	type ItemBank,
	LarransChest,
	LootTable,
	MasterMimicTable,
	type OpenableOpenOptions,
	Openables,
	SkillsEnum,
	ZombiePiratesLocker,
	itemID,
	resolveItems
} from 'oldschooljs';

import { ClueTiers } from './clues/clueTiers';
import { cluesRaresCL } from './data/CollectionsExport';
import { defaultFarmingContract } from './minions/farming';
import type { FarmingContract } from './minions/farming/types';
import { shadeChestOpenables } from './shadesKeys';
import { nestTable } from './simulation/birdsNest';
import {
	BagFullOfGemsTable,
	BuildersSupplyCrateTable,
	CasketTable,
	CrystalChestTable,
	SpoilsOfWarTable
} from './simulation/misc';
import { openSeedPack } from './skilling/functions/calcFarmingContracts';
import getOSItem from './util/getOSItem';
import { roll } from './util/rng';

const CacheOfRunesTable = new LootTable()
	.add('Death rune', [1000, 1500], 2)
	.add('Blood rune', [1000, 1500], 2)
	.add('Soul rune', [1000, 1500], 2)
	.add('Death rune', [1800, 2400], 1)
	.add('Soul rune', [1800, 2400], 1)
	.add('Death rune', [1800, 2400], 1)
	.add(
		new LootTable().add('Death rune', [2800, 3600]).add('Soul rune', [2800, 3600]).add('Blood rune', [2800, 3600])
	);

const FrozenCacheTable = new LootTable()
	.tertiary(250, 'Ancient icon')
	.tertiary(500, 'Venator shard')
	.add('Ancient essence', [1970, 2060], 4)
	.add('Ancient essence', [540, 599], 10)
	.add('Chaos rune', 480, 5)
	.add('Rune platelegs', 3, 5)
	.add("Black d'hide body", 1, 5)
	.add('Fire rune', 1964, 5)
	.add('Cannonball', 666, 5)
	.add('Dragon plateskirt', 1, 5)
	.add('Torstol seed', 4, 5)
	.add('Coal', 163, 5)
	.add('Snapdragon seed', 5, 4)
	.add('Dragon platelegs', 2, 4)
	.add('Runite ore', 18, 3)
	.add('Grimy toadflax', 55, 3)
	.add('Limpwurt root', 21, 3)
	.add('Ranarr seed', 8, 3)
	.add('Silver ore', 101, 2)
	.add('Spirit seed', 1, 2)
	.add('Rune sword');

interface OpenArgs {
	quantity: number;
	user: MUser;
	self: UnifiedOpenable;
}

export interface UnifiedOpenable {
	name: string;
	id: number;
	openedItem: Item;
	output:
		| LootTable
		| ((args: OpenArgs) => Promise<{
				bank: Bank;
				message?: string;
		  }>);
	emoji?: string;
	aliases: string[];
	allItems: number[];
}

const clueItemsToNotifyOf = cluesRaresCL
	.concat(ClueTiers.flatMap(i => (i.milestoneRewards ? i.milestoneRewards.map(r => r.itemReward) : [])))
	.concat([itemID('Bloodhound'), itemID('Ranger boots')]);

const clueOpenables: UnifiedOpenable[] = [];
for (const clueTier of ClueTiers) {
	const casketItem = getOSItem(clueTier.id);
	clueOpenables.push({
		name: casketItem.name,
		id: casketItem.id,
		openedItem: casketItem,
		aliases: [clueTier.name.toLowerCase()],
		output: async ({ quantity, user, self }) => {
			const clueTier = ClueTiers.find(c => c.id === self.id)!;
			const loot = clueTier.table.roll(quantity);
			let mimicNumber = 0;
			if (clueTier.mimicChance) {
				const table = clueTier.name === 'Master' ? MasterMimicTable : EliteMimicTable;
				for (let i = 0; i < quantity; i++) {
					if (roll(clueTier.mimicChance)) {
						loot.add(table.roll());
						mimicNumber++;
					}
				}
			}

			const message = `${quantity}x ${clueTier.name} Clue Casket${quantity > 1 ? 's' : ''} ${
				mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
			}`;

			const stats = await user.fetchStats({ openable_scores: true });
			const nthCasket = ((stats.openable_scores as ItemBank)[clueTier.id] ?? 0) + quantity;

			// If this tier has a milestone reward, and their new score meets the req, and
			// they don't own it already, add it to the loot.

			if (clueTier.milestoneRewards) {
				for (const reward of clueTier.milestoneRewards) {
					if (nthCasket >= reward.scoreNeeded && user.allItemsOwned.amount(reward.itemReward) === 0) {
						loot.add(reward.itemReward);
					}
				}
			}

			// Here we check if the loot has any ultra-rares (3rd age, gilded, bloodhound),
			// and send a notification if they got one.
			const announcedLoot = loot.filter(
				i =>
					clueItemsToNotifyOf.includes(i.id) &&
					!clueTier.milestoneRewards?.some(r => r.itemReward === i.id && user.cl.has(i.id))
			);

			if (announcedLoot.length > 0) {
				globalClient.emit(
					Events.ServerNotification,
					`**${user.badgedUsername}'s** minion, ${user.minionName}, just opened their ${formatOrdinal(
						nthCasket
					)} ${clueTier.name} casket and received **${announcedLoot}**!`
				);
			}

			if (loot.length === 0) {
				return { bank: loot };
			}

			if (mimicNumber > 0) {
				if (!user.owns('Mimic scroll case')) {
					loot.add('Mimic scroll case');
				}
				await user.incrementKC(EMonster.MIMIC, mimicNumber);
			}

			return { bank: loot, message };
		},
		emoji: Emoji.Casket,
		allItems: clueTier.allItems
	});
}

const osjsOpenables: UnifiedOpenable[] = [
	{
		name: 'Brimstone chest',
		id: 23_083,
		openedItem: getOSItem(23_083),
		aliases: ['brimstone chest', 'brimstone'],
		output: async (
			args: OpenArgs
		): Promise<{
			bank: Bank;
		}> => {
			const fishLvl = args.user.skillLevel(SkillsEnum.Fishing);
			const brimstoneOptions: OpenableOpenOptions = {
				fishLvl
			};
			const openLoot: Bank = BrimstoneChest.open(args.quantity, brimstoneOptions);

			return { bank: openLoot };
		},
		allItems: Openables.BrimstoneChest.table.allItems
	},
	{
		name: 'Elven crystal chest',
		id: 23_951,
		openedItem: getOSItem(23_951),
		aliases: ['elven crystal chest', 'elven chest', 'enhanced', 'enhanced crystal chest', 'elven chest', 'elven'],
		output: Openables.ElvenCrystalChest.table,
		allItems: Openables.ElvenCrystalChest.table.allItems
	},
	{
		name: 'Giant egg sac(full)',
		id: 23_517,
		openedItem: getOSItem(23_517),
		aliases: ['giant egg sac(full)', 'giant egg sac full'],
		output: Openables.GiantEggSacFull.table,
		allItems: Openables.GiantEggSacFull.table.allItems
	},
	{
		name: 'Grubby chest',
		id: 23_499,
		openedItem: getOSItem(23_499),
		aliases: ['grubby chest', 'grubby'],
		output: Openables.GrubbyChest.table,
		allItems: Openables.GrubbyChest.table.allItems
	},
	{
		name: 'Bronze HAM chest',
		id: 8867,
		openedItem: getOSItem(8867),
		aliases: ['bronze', 'bronze ham chest', 'bronze chest'],
		output: Openables.BronzeHAMChest.table,
		allItems: Openables.BronzeHAMChest.table.allItems
	},
	{
		name: 'Iron HAM chest',
		id: 8869,
		openedItem: getOSItem(8869),
		aliases: ['iron', 'iron ham chest', 'iron chest'],
		output: Openables.IronHAMChest.table,
		allItems: Openables.IronHAMChest.table.allItems
	},
	{
		name: 'Silver HAM chest',
		id: 8868,
		openedItem: getOSItem(8868),
		aliases: ['silver', 'silver ham chest', 'silver chest'],
		output: Openables.SilverHAMChest.table,
		allItems: Openables.SilverHAMChest.table.allItems
	},
	{
		name: 'Steel HAM chest',
		id: 8866,
		openedItem: getOSItem(8866),
		aliases: ['steel', 'steel ham chest', 'steel chest'],
		output: Openables.SteelHAMChest.table,
		allItems: Openables.SteelHAMChest.table.allItems
	},
	{
		name: "Larran's chest",
		id: 23_490,
		openedItem: getOSItem(23_490),
		aliases: [
			'larran big chest',
			'larrans big chest',
			"larran's big chest",
			"larran's small chest",
			'larran small chest',
			'larrans small chest',
			"larran's small chest"
		],
		output: async (
			args: OpenArgs
		): Promise<{
			bank: Bank;
		}> => {
			const fishLvl = args.user.skillLevel(SkillsEnum.Fishing);
			const larransOptions: OpenableOpenOptions = {
				fishLvl,
				chestSize: 'big'
			};
			const openLoot: Bank = LarransChest.open(args.quantity, larransOptions);

			return { bank: openLoot };
		},
		allItems: Openables.LarransChest.table.allItems
	},
	{
		name: 'Muddy chest',
		id: 991,
		openedItem: getOSItem(991),
		aliases: ['muddy chest', 'muddy'],
		output: Openables.MuddyChest.table,
		allItems: Openables.MuddyChest.table.allItems
	},
	{
		name: 'Mystery box',
		id: 6199,
		openedItem: getOSItem(6199),
		aliases: ['mystery box', 'mystery', 'mbox'],
		output: Openables.MysteryBox.table,
		allItems: Openables.MysteryBox.table.allItems
	},
	{
		name: 'Nest box (empty)',
		id: 12_792,
		openedItem: getOSItem(12_792),
		aliases: ['nest box (empty)', 'empty nest box', 'nest box empty'],
		output: Openables.NestBoxEmpty.table,
		allItems: Openables.NestBoxEmpty.table.allItems
	},
	{
		name: 'Nest box (ring)',
		id: 12_794,
		openedItem: getOSItem(12_794),
		aliases: ['nest box (ring)', 'ring nest box', 'nest box ring'],
		output: Openables.NestBoxRing.table,
		allItems: Openables.NestBoxRing.table.allItems
	},
	{
		name: 'Nest box (seeds)',
		id: 12_793,
		openedItem: getOSItem(12_793),
		aliases: ['nest box (seeds)', 'seeds nest box', 'nest box seeds', 'seed nest box'],
		output: Openables.NestBoxSeeds.table,
		allItems: Openables.NestBoxSeeds.table.allItems
	},
	{
		name: 'Bird nest',
		id: 5070,
		openedItem: getOSItem(5070),
		aliases: ['bird nest', 'nest'],
		output: nestTable,
		allItems: nestTable.allItems
	},
	{
		name: 'Amylase pack',
		id: 12641,
		openedItem: getOSItem(12641),
		aliases: ['amylase pack', 'amylase'],
		output: new LootTable().every('Amylase crystal', 100),
		allItems: resolveItems(['Amylase crystal'])
	},
	{
		name: 'Ogre coffin',
		id: 4850,
		openedItem: getOSItem(4850),
		aliases: ['ogre coffin', 'ogre chest', 'ogre coffin chest'],
		output: Openables.OgreCoffin.table,
		allItems: Openables.OgreCoffin.table.allItems
	},
	{
		name: 'Seed pack',
		id: 22_993,
		openedItem: getOSItem(22_993),
		aliases: ['seed pack', 'sp'],
		output: async (
			args: OpenArgs
		): Promise<{
			bank: Bank;
			message?: string;
		}> => {
			const { plantTier } =
				(args.user.user.minion_farmingContract as FarmingContract | null) ?? defaultFarmingContract;
			const openLoot = new Bank();
			for (let i = 0; i < args.quantity; i++) {
				openLoot.add(openSeedPack(plantTier));
			}
			return { bank: openLoot };
		},
		allItems: Openables.SeedPack.table.allItems
	},
	{
		name: 'Sinister chest',
		id: 993,
		openedItem: getOSItem(993),
		aliases: ['sinister chest', 'sinister'],
		output: Openables.SinisterChest.table,
		allItems: Openables.SinisterChest.table.allItems
	},
	{
		name: "Ore pack (Giant's Foundry)",
		id: 27_019,
		openedItem: getOSItem(27_019),
		aliases: ["ore pack (giant's foundry)", 'giants', 'foundry', 'giants foundry'],
		output: Openables.GiantsFoundryOrePack.table,
		allItems: Openables.GiantsFoundryOrePack.table.allItems
	},
	{
		name: 'Ore pack (Volcanic Mine)',
		id: 27_693,
		openedItem: getOSItem(27_693),
		aliases: ['ore pack (volcanic mine)', 'volcanic', 'volcanic mine'],
		output: Openables.VolcanicMineOrePack.table,
		allItems: Openables.VolcanicMineOrePack.table.allItems
	},
	{
		name: 'Intricate pouch',
		id: 26_908,
		openedItem: getOSItem(26_908),
		aliases: ['intricate pouch', 'intricate'],
		output: Openables.IntricatePouch.table,
		allItems: Openables.IntricatePouch.table.allItems
	},
	{
		name: "Zombie Pirate's Locker",
		id: EItem.ZOMBIE_PIRATE_KEY,
		openedItem: getOSItem('Zombie pirate key'),
		aliases: ['zombie pirate key', 'zombie pirate locker', 'pirate locker'],
		output: ZombiePiratesLocker.table,
		allItems: ZombiePiratesLocker.table.allItems
	}
];

for (const impling of Implings) {
	osjsOpenables.push({
		name: impling.name,
		id: impling.id,
		openedItem: getOSItem(impling.id),
		aliases: [...impling.aliases, `${impling.name} jar`],
		output: impling.table,
		allItems: impling.table.allItems
	});
}

export const allOpenables: UnifiedOpenable[] = [
	{
		name: 'Birthday present',
		id: 11_918,
		openedItem: getOSItem(11_918),
		aliases: ['present', 'birthday present'],
		output: new LootTable().oneIn(10, 'War ship').every('Slice of birthday cake'),
		emoji: '<:birthdayPresent:680041979710668880>',
		allItems: resolveItems(['War ship', 'Slice of birthday cake'])
	},
	{
		name: 'Casket',
		id: 405,
		openedItem: getOSItem(405),
		aliases: ['casket'],
		output: CasketTable,
		emoji: Emoji.Casket,
		allItems: CasketTable.allItems
	},
	{
		name: 'Crystal chest',
		id: 989,
		openedItem: getOSItem(989),
		aliases: ['crystal chest'],
		output: CrystalChestTable,
		allItems: CrystalChestTable.allItems
	},
	{
		name: 'Builders supply crate',
		id: 24_884,
		openedItem: getOSItem('Builders supply crate'),
		aliases: ['builders supply crate'],
		output: BuildersSupplyCrateTable,
		allItems: BuildersSupplyCrateTable.allItems
	},
	{
		name: 'Hallowed sack',
		id: 24_946,
		openedItem: getOSItem('Hallowed sack'),
		aliases: ['hallowed sack', 'hallow sack'],
		output: HallowedSackTable,
		allItems: HallowedSackTable.allItems
	},
	{
		name: 'Infernal eel',
		id: 21_293,
		openedItem: getOSItem('Infernal eel'),
		aliases: ['infernal eel'],
		output: new LootTable()
			.add('Tokkul', [14, 20], 86)
			.add('Lava scale shard', [1, 5], 8)
			.add('Onyx bolt tips', 1, 6),
		emoji: Emoji.Casket,
		allItems: resolveItems(['Tokkul', 'Lava scale shard', 'Onyx bolt tips'])
	},
	{
		name: 'Scaly blue dragonhide',
		id: 27_897,
		openedItem: getOSItem('Scaly blue dragonhide'),
		aliases: ['Scaly blue dragonhide'],
		output: new LootTable().add('Blue dragon scale', 50),
		emoji: Emoji.Casket,
		allItems: resolveItems(['Blue dragon scale'])
	},
	{
		name: 'Spoils of war',
		id: itemID('Spoils of war'),
		openedItem: getOSItem('Spoils of war'),
		aliases: ['Spoils of war'],
		output: SpoilsOfWarTable,
		allItems: SpoilsOfWarTable.allItems
	},
	{
		name: 'Bag full of gems',
		id: itemID('Bag full of gems'),
		openedItem: getOSItem('Bag full of gems'),
		aliases: ['bag full of gems', 'gem bag'],
		output: BagFullOfGemsTable,
		allItems: BagFullOfGemsTable.allItems
	},
	{
		name: 'Cache of runes',
		id: itemID('Cache of runes'),
		openedItem: getOSItem('Cache of runes'),
		aliases: ['cache of runes'],
		output: CacheOfRunesTable,
		allItems: CacheOfRunesTable.allItems
	},
	{
		name: 'Frozen cache',
		id: itemID('Frozen cache'),
		openedItem: getOSItem('Frozen cache'),
		aliases: ['frozen cache'],
		output: FrozenCacheTable,
		allItems: FrozenCacheTable.allItems
	},
	...clueOpenables,
	...osjsOpenables,
	...shadeChestOpenables
];

for (const openable of allOpenables) {
	openable.aliases.push(openable.openedItem.name);
	openable.aliases.push(openable.id.toString());
}

export const allOpenablesIDs = new Set(allOpenables.map(i => i.id));

export function getOpenableLoot({
	openable,
	quantity,
	user
}: {
	openable: UnifiedOpenable;
	quantity: number;
	user: MUser;
}) {
	return openable.output instanceof LootTable
		? { bank: openable.output.roll(quantity), message: null }
		: openable.output({ user, self: openable, quantity });
}
