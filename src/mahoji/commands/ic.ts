import { User } from '@prisma/client';
import { randArrItem, roll } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank, LootTable } from 'oldschooljs';

import { allMbTables, MysteryBoxes, PMBTable } from '../../lib/bsoOpenables';
import { Emoji } from '../../lib/constants';
import { AbyssalDragonLootTable } from '../../lib/minions/data/killableMonsters/custom/AbyssalDragon';
import { Ignecarus } from '../../lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { kalphiteKingLootTable } from '../../lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import { VasaMagus } from '../../lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { BSOMonsters } from '../../lib/minions/data/killableMonsters/custom/customMonsters';
import { nexLootTable } from '../../lib/nex';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { DragonTable } from '../../lib/simulation/grandmasterClue';
import { allThirdAgeItems, runeAlchablesTable } from '../../lib/simulation/sharedTables';
import { formatDuration, itemID, updateBankSetting, updateGPTrackSetting } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getOSItem from '../../lib/util/getOSItem';
import { itemContractResetTime } from '../../lib/util/getUsersPerkTier';
import resolveItems from '../../lib/util/resolveItems';
import { LampTable } from '../../lib/xpLamps';
import { OSBMahojiCommand } from '../lib/util';
import {
	getMahojiBank,
	handleMahojiConfirmation,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch,
	userStatsBankUpdate
} from '../mahojiSettings';

const contractTable = new LootTable()
	.every('Coins', [1_000_000, 3_500_000])
	.tertiary(50, LampTable)
	.tertiary(50, MysteryBoxes)
	.add(DragonTable, [1, 2], 2)
	.add(runeAlchablesTable, [1, 3], 3)
	.every(runeAlchablesTable, [1, 3])
	.add(
		new LootTable()
			.add('Clue scroll (beginner)', 1, 50)
			.add('Clue scroll (easy)', 1, 40)
			.add('Clue scroll (medium)', 1, 30)
			.add('Clue scroll (hard)', 1, 20)
			.add('Clue scroll (elite)', 1, 10)
			.add('Clue scroll (master)', 1, 5)
			.add('Clue scroll (grandmaster)', 1, 2)
	);

const itemContractItemsSet = new Set([
	...allMbTables,
	...kalphiteKingLootTable.allItems.filter(i => i !== itemID('Baby kalphite king')),
	...AbyssalDragonLootTable.allItems,
	...VasaMagus.allItems,
	...Ignecarus.allItems.filter(i => i !== itemID('Dragon egg')),
	...nexLootTable.allItems,
	...PMBTable.allItems,
	...[
		...BSOMonsters.FrostDragon.table.allItems,
		...BSOMonsters.GanodermicBeast.table.allItems,
		...BSOMonsters.Grifolaroo.table.allItems,
		...BSOMonsters.RumPumpedCrab.table.allItems,
		...BSOMonsters.QueenBlackDragon.table.allItems
	],
	...resolveItems([
		'Untradeable mystery box',
		'Tradeable mystery box',
		'Pet mystery box',
		'Holiday mystery box',
		'Dwarven bar',
		'Dwarven ore'
	])
]);

const cantBeContract = resolveItems(['Coins']);
for (const id of cantBeContract) {
	itemContractItemsSet.delete(id);
}

const itemContractItems = Array.from(itemContractItemsSet);

function pickItemContract(streak: number) {
	let item = randArrItem(itemContractItems);
	if (streak > 50) {
		let fifties = Math.floor(streak / 50);
		for (let i = 0; i < fifties; i++) {
			if (roll(95 + i * 5)) {
				item = randArrItem(allThirdAgeItems);
			}
		}
	}

	return item;
}

export function getItemContractDetails(mUser: User) {
	const currentDate = Date.now();
	let lastDate = Number(mUser.last_item_contract_date);
	if (lastDate === 0) lastDate = Date.now() - itemContractResetTime;
	const difference = currentDate - lastDate;
	const totalContracts = mUser.total_item_contracts;
	const streak = mUser.item_contract_streak;
	const currentItem = mUser.current_item_contract ? getOSItem(mUser.current_item_contract) : null;
	let durationRemaining = Date.now() - (lastDate + itemContractResetTime);
	const nextContractIsReady = difference >= itemContractResetTime;
	const bank = getMahojiBank(mUser);

	const owns = currentItem ? bank.has(currentItem.id) : null;
	return {
		totalContracts,
		streak,
		currentItem,
		nextContractIsReady,
		durationRemaining,
		differenceFromLastContract: difference,
		owns,
		canSkip: difference < itemContractResetTime,
		lastDate,
		infoStr: `**Current Contract:** ${
			currentItem ? `${currentItem.name} (ID: ${currentItem.id}) (You${owns ? '' : " don't"} own it)` : '*None*'
		}
**Current Streak:** ${streak}
**Total Contracts Completed:** ${totalContracts}
${!currentItem ? `**Next Contract:** ${nextContractIsReady ? 'Ready now.' : formatDuration(durationRemaining)}` : ''}`
	};
}

async function skip(interaction: SlashCommandInteraction, user: KlasaUser, mUser: User) {
	const { currentItem, differenceFromLastContract, streak, canSkip } = getItemContractDetails(mUser);
	if (!currentItem) return "You don't have a contract to skip.";
	if (canSkip) {
		return `Your current contract is a ${currentItem.name} (ID:${
			currentItem.id
		}), you can't skip it yet, you need to wait ${formatDuration(
			itemContractResetTime - differenceFromLastContract
		)}.`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to skip your item contract? You won't be able to get another contract for ${formatDuration(
			itemContractResetTime / 2
		)}.`
	);

	const newItem = pickItemContract(streak);

	await mahojiUserSettingsUpdate(user.id, {
		last_item_contract_date: Date.now() - itemContractResetTime / 2,
		current_item_contract: newItem,
		item_contract_streak: 0
	});

	return `You skipped your item contract, your streak was reset, and your next contract will be available in ${formatDuration(
		itemContractResetTime / 2
	)}.`;
}

async function handInContract(
	interaction: SlashCommandInteraction | null,
	user: KlasaUser,
	mUser: User
): Promise<string> {
	const { nextContractIsReady, durationRemaining, currentItem, owns, streak, totalContracts } =
		getItemContractDetails(mUser);

	if (!nextContractIsReady) {
		return `You have no item contract available at the moment. Come back in ${formatDuration(durationRemaining)}.`;
	}

	if (!currentItem) {
		const { newUser } = await mahojiUserSettingsUpdate(user.id, {
			current_item_contract: pickItemContract(streak),
			last_item_contract_date: Date.now()
		});
		return handInContract(interaction, user, newUser);
	}

	if (!owns) {
		return `Your current contract is a ${currentItem.name} (Id: ${currentItem.id}), go get one!`;
	}
	const cost = new Bank().add(currentItem.id);
	const newStreak = streak + 1;

	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to hand in ${cost} for your ${formatOrdinal(newStreak)} Item Contract?`
		);
	}

	const loot = new Bank().add(contractTable.roll());
	let gotBonus = '';
	for (const [kc, rolls] of [
		[100, 25],
		[50, 15],
		[25, 10],
		[10, 5]
	]) {
		if (newStreak % kc === 0) {
			gotBonus = `You got ${rolls} bonus rolls for your ${formatOrdinal(newStreak)} contract!`;
			for (let i = 0; i < rolls; i++) {
				loot.add(contractTable.roll());
				loot.add(runeAlchablesTable.roll(5));
			}
			break;
		}
	}

	await mahojiUserSettingsUpdate(user.id, {
		last_item_contract_date: Date.now(),
		total_item_contracts: {
			increment: 1
		},
		current_item_contract: pickItemContract(newStreak),
		item_contract_bank: new Bank().add(currentItem.id).add(user.settings.get(UserSettings.ItemContractBank)).bank,
		item_contract_streak: {
			increment: 1
		}
	});

	await user.removeItemsFromBank(cost);
	await user.addItemsToBank({ items: loot, collectionLog: false });

	await Promise.all([
		updateBankSetting(globalClient, ClientSettings.EconomyStats.ItemContractCost, cost),
		updateBankSetting(globalClient, ClientSettings.EconomyStats.ItemContractLoot, loot),
		updateGPTrackSetting('gp_ic', loot.amount('Coins')),
		userStatsBankUpdate(user.id, 'ic_cost_bank', cost),
		userStatsBankUpdate(user.id, 'ic_loot_bank', loot)
	]);

	let res = `You handed in a ${currentItem.name} and received ${loot}. You've completed ${
		totalContracts + 1
	} Item Contracts, and your streak is now at ${newStreak}.`;
	if (gotBonus.length > 0) {
		res += `\n\n${gotBonus}`;
	}
	return res;
}

export const icCommand: OSBMahojiCommand = {
	name: 'ic',
	description: 'Hand in random items for rewards.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'info',
			description: 'View stats and info on your Item Contracts.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'send',
			description: 'Hand in your contract and receive a new one.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'skip',
			description: 'Skip your current contract.'
		}
	],
	run: async ({ options, userID, interaction }: CommandRunOptions<{ info?: {}; send?: {}; skip?: {} }>) => {
		const user = await globalClient.fetchUser(userID);
		const mUser = await mahojiUsersSettingsFetch(userID);
		if (options.info) return `${Emoji.ItemContract} ${getItemContractDetails(mUser).infoStr}`;
		const res = options.skip
			? await skip(interaction, user, mUser)
			: await handInContract(interaction, user, mUser);
		const newUser = await mahojiUsersSettingsFetch(user.id);
		return `${Emoji.ItemContract} ${res}\n\n${getItemContractDetails(newUser).infoStr}`;
	}
};
