import { KlasaUser } from 'klasa';
import { Bank, LootTable, Openables } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { BeginnerClueTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import { Mimic } from 'oldschooljs/dist/simulation/misc';
import { Implings } from 'oldschooljs/dist/simulation/openables/Implings';

import { openSeedPack } from '../commands/Minion/seedpack';
import { Emoji, Events, MIMIC_MONSTER_ID } from './constants';
import { cluesRaresCL } from './data/CollectionsExport';
import ClueTiers from './minions/data/clueTiers';
import { defaultFarmingContract } from './minions/farming';
import { UserSettings } from './settings/types/UserSettings';
import {
	BagFullOfGemsTable,
	BuildersSupplyCrateTable,
	CasketTable,
	CrystalChestTable,
	SpoilsOfWarTable
} from './simulation/misc';
import { itemID, roll } from './util';
import { formatOrdinal } from './util/formatOrdinal';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

interface OpenArgs {
	quantity: number;
	user: KlasaUser;
	self: UnifiedOpenable;
}

interface UnifiedOpenable {
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
	.concat(ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward))
	.concat([itemID('Bloodhound')]);

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
			let loot = new Bank(clueTier.table.open(quantity));
			let mimicNumber = 0;
			if (clueTier.mimicChance) {
				for (let i = 0; i < quantity; i++) {
					if (roll(clueTier.mimicChance)) {
						loot.add(Mimic.open(clueTier.name as 'master' | 'elite'));
						mimicNumber++;
					}
				}
			}

			const message = `You opened ${quantity} ${clueTier.name} Clue Casket${quantity > 1 ? 's' : ''} ${
				mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
			}`;

			const nthCasket = (user.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) + quantity;

			// If this tier has a milestone reward, and their new score meets the req, and
			// they don't own it already, add it to the loot.
			if (
				clueTier.milestoneReward &&
				nthCasket >= clueTier.milestoneReward.scoreNeeded &&
				user.allItemsOwned().amount(clueTier.milestoneReward.itemReward) === 0
			) {
				loot.add(clueTier.milestoneReward.itemReward);
			}

			// Here we check if the loot has any ultra-rares (3rd age, gilded, bloodhound),
			// and send a notification if they got one.
			const announcedLoot = loot.filter(i => clueItemsToNotifyOf.includes(i.id), false);
			if (announcedLoot.length > 0) {
				user.client.emit(
					Events.ServerNotification,
					`**${user.username}'s** minion, ${user.minionName}, just opened their ${formatOrdinal(nthCasket)} ${
						clueTier.name
					} casket and received **${announcedLoot}**!`
				);
			}

			if (loot.length === 0) {
				return { bank: loot };
			}

			await user.incrementClueScore(clueTier.id, quantity);

			if (mimicNumber > 0) {
				await user.incrementMonsterScore(MIMIC_MONSTER_ID, mimicNumber);
			}

			return { bank: loot, message };
		},
		emoji: Emoji.Casket,
		allItems: BeginnerClueTable.allItems
	});
}

const osjsOpenables: UnifiedOpenable[] = [
	{
		name: 'Brimstone chest',
		id: 23_083,
		openedItem: getOSItem(23_083),
		aliases: ['brimstone chest', 'brimstone'],
		output: Openables.BrimstoneChest.table,
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
		output: Openables.LarransChest.table,
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
		aliases: ['seed pack'],
		output: async (
			args: OpenArgs
		): Promise<{
			bank: Bank;
			message?: string;
		}> => {
			const { plantTier } = args.user.settings.get(UserSettings.Minion.FarmingContract) ?? defaultFarmingContract;
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
	...clueOpenables,
	...osjsOpenables
];

for (const openable of allOpenables) {
	openable.aliases.push(openable.openedItem.name);
	openable.aliases.push(openable.id.toString());
}

export const allOpenablesIDs = new Set(allOpenables.map(i => i.id));
