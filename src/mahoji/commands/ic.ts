import { itemContractResetTime } from '@/lib/bso/bsoConstants.js';
import { DragonTable } from '@/lib/bso/grandmasterClue.js';
import { Ignecarus } from '@/lib/bso/monsters/bosses/Ignecarus.js';
import { kalphiteKingLootTable } from '@/lib/bso/monsters/bosses/KalphiteKing.js';
import { VasaMagus } from '@/lib/bso/monsters/bosses/VasaMagus.js';
import { BSOMonsters } from '@/lib/bso/monsters/customMonsters.js';
import { nexLootTable } from '@/lib/bso/monsters/nex.js';
import { combinedTmbUmbEmbTables } from '@/lib/bso/openables/bsoOpenables.js';
import { MysteryBoxes, PMBTable } from '@/lib/bso/openables/tables.js';
import { chargePortentIfHasCharges, PortentID } from '@/lib/bso/skills/divination.js';
import { allThirdAgeItems, runeAlchablesTable } from '@/lib/bso/tables/sharedTables.js';
import { LampTable } from '@/lib/bso/xpLamps.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { Emoji, formatDuration, formatOrdinal, makeComponents } from '@oldschoolgg/toolkit';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Bank, type ItemBank, Items, itemID, LootTable, resolveItems } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import type { MInteraction } from '@/lib/structures/MInteraction.js';

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

export const itemContractItemsSet = new Set([
	...combinedTmbUmbEmbTables,
	...kalphiteKingLootTable.allItems.filter(i => i !== itemID('Baby kalphite king')),
	// ...AbyssalDragonLootTable.allItems,
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
		const fifties = Math.floor(streak / 50);
		for (let i = 0; i < fifties; i++) {
			if (roll(95 + i * 5)) {
				item = randArrItem(allThirdAgeItems);
			}
		}
	}

	return item;
}

export function getItemContractDetails(mUser: MUser) {
	const currentDate = Date.now();
	let lastDate = Number(mUser.user.last_item_contract_date);
	if (lastDate === 0) lastDate = Date.now() - itemContractResetTime;
	const difference = currentDate - lastDate;
	const totalContracts = mUser.user.total_item_contracts;
	const streak = mUser.user.item_contract_streak;
	const currentItem = mUser.user.current_item_contract ? Items.getOrThrow(mUser.user.current_item_contract) : null;
	const durationRemaining = Date.now() - (lastDate + itemContractResetTime);
	const nextContractIsReady = difference >= itemContractResetTime;
	const { bank } = mUser;

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

async function skip(interaction: MInteraction, user: MUser) {
	const { currentItem, differenceFromLastContract, streak, canSkip } = getItemContractDetails(user);
	if (!currentItem) return "You don't have a contract to skip.";
	if (canSkip) {
		return `Your current contract is a ${currentItem.name} (ID:${
			currentItem.id
		}), you can't skip it yet, you need to wait ${formatDuration(
			itemContractResetTime - differenceFromLastContract
		)}.`;
	}

	await interaction.confirmation(
		`Are you sure you want to skip your item contract? You won't be able to get another contract for ${formatDuration(
			itemContractResetTime / 2
		)}.`
	);

	const newItem = pickItemContract(streak);

	await user.update({
		last_item_contract_date: Date.now() - itemContractResetTime / 2,
		current_item_contract: newItem,
		item_contract_streak: 0
	});

	return `You skipped your item contract, your streak was reset, and your next contract will be available in ${formatDuration(
		itemContractResetTime / 2
	)}.`;
}

export async function handInContract(interaction: MInteraction, user: MUser): Promise<string> {
	const { nextContractIsReady, durationRemaining, currentItem, owns, streak, totalContracts } =
		getItemContractDetails(user);

	if (!nextContractIsReady) {
		return `You have no item contract available at the moment. Come back in ${formatDuration(durationRemaining)}.`;
	}

	if (!currentItem) {
		await user.update({
			current_item_contract: pickItemContract(streak),
			last_item_contract_date: Date.now()
		});
		return handInContract(interaction, user);
	}

	if (!owns) {
		return `Your current contract is a ${currentItem.name} (Id: ${currentItem.id}), go get one!`;
	}
	const cost = new Bank().add(currentItem.id);
	const newStreak = streak + 1;

	await interaction.confirmation(
		`Are you sure you want to hand in ${cost} for your ${formatOrdinal(newStreak)} Item Contract?`
	);

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

	const { didCharge } = await chargePortentIfHasCharges({
		user,
		portentID: PortentID.LuckyPortent,
		charges: 1
	});
	if (didCharge) {
		await user.statsBankUpdate('loot_from_lucky_portent', loot);
		loot.multiply(2);
	}

	await user.update({
		last_item_contract_date: Date.now(),
		total_item_contracts: {
			increment: 1
		},
		current_item_contract: pickItemContract(newStreak),
		item_contract_bank: new Bank()
			.add(currentItem.id)
			.add(user.user.item_contract_bank as ItemBank)
			.toJSON(),
		item_contract_streak: {
			increment: 1
		}
	});

	await user.removeItemsFromBank(cost);
	await user.addItemsToBank({ items: loot, collectionLog: false });

	await Promise.all([
		ClientSettings.updateBankSetting('item_contract_cost', cost),
		ClientSettings.updateBankSetting('item_contract_loot', loot),
		ClientSettings.updateClientGPTrackSetting('gp_ic', loot.amount('Coins')),
		user.statsBankUpdate('ic_cost_bank', cost),
		user.statsBankUpdate('ic_loot_bank', loot)
	]);

	let res = `You handed in a ${currentItem.name} and received ${loot}. You've completed ${
		totalContracts + 1
	} Item Contracts, and your streak is now at ${newStreak}.`;
	if (gotBonus.length > 0) {
		res += `\n\n${gotBonus}`;
	}
	if (didCharge) {
		res += '\n\nYour Lucky Portent doubled your loot!';
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
			type: 'Subcommand',
			name: 'info',
			description: 'View stats and info on your Item Contracts.'
		},
		{
			type: 'Subcommand',
			name: 'send',
			description: 'Hand in your contract and receive a new one.'
		},
		{
			type: 'Subcommand',
			name: 'skip',
			description: 'Skip your current contract.'
		}
	],
	run: async ({ options, userID, interaction }: CommandRunOptions<{ info?: {}; send?: {}; skip?: {} }>) => {
		const user = await mUserFetch(userID);
		const details = getItemContractDetails(user);
		const components =
			details.nextContractIsReady &&
			details.currentItem !== null &&
			!user.isIronman &&
			!user.bitfield.includes(BitField.NoItemContractDonations)
				? makeComponents([
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel('Donate IC')
							.setEmoji('988422348434718812')
							.setCustomId(`DONATE_IC_${user.id}`)
					])
				: undefined;

		if (options.info) {
			if (!details.nextContractIsReady) {
				return {
					content: `${
						Emoji.ItemContract
					} You have no item contract available at the moment. Come back in ${formatDuration(
						details.durationRemaining
					)}.

${details.infoStr}`
				};
			}
			return { content: `${Emoji.ItemContract} ${details.infoStr}`, components };
		}
		const res = options.skip ? await skip(interaction, user) : await handInContract(interaction, user);

		const nextIcDetails = getItemContractDetails(user);
		return `${Emoji.ItemContract} ${res}\n\n${nextIcDetails.infoStr}`;
	}
};
