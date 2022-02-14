import { KlasaUser } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { BeginnerClueTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import { Mimic } from 'oldschooljs/dist/simulation/misc';

import { client } from '..';
import { Emoji, Events, MIMIC_MONSTER_ID } from './constants';
import { cluesRaresCL } from './data/CollectionsExport';
import ClueTiers from './minions/data/clueTiers';
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
				// imageOptions: {
				// 	flags: Record<string, string>;
				// };
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
				client.emit(
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
	...clueOpenables
];

export const allOpenablesIDs = new Set(allOpenables.map(i => i.id));
