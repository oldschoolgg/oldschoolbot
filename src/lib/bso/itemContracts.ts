import { itemContractResetTime } from '@/lib/bso/bsoConstants.js';
import { DragonTable } from '@/lib/bso/grandmasterClue.js';
import { Ignecarus } from '@/lib/bso/monsters/bosses/Ignecarus.js';
import { kalphiteKingLootTable } from '@/lib/bso/monsters/bosses/KalphiteKing.js';
import { VasaMagus } from '@/lib/bso/monsters/bosses/VasaMagus.js';
import { BSOMonsters } from '@/lib/bso/monsters/customMonsters.js';
import { nexLootTable } from '@/lib/bso/monsters/nex.js';
import { combinedTmbUmbEmbTables } from '@/lib/bso/openables/mysteryBoxes.js';
import { PMBTable } from '@/lib/bso/openables/pmb.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';
import { chargePortentIfHasCharges, PortentID } from '@/lib/bso/skills/divination.js';
import { allThirdAgeItems, runeAlchablesTable } from '@/lib/bso/tables/sharedTables.js';
import { LampTable } from '@/lib/bso/xpLamps.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { dateFm, Emoji, formatDuration, formatOrdinal } from '@oldschoolgg/toolkit';
import type { ButtonInteraction } from 'discord.js';
import { Bank, type ItemBank, Items, itemID, LootTable, resolveItems } from 'oldschooljs';

import { modifyBusyCounter } from '@/lib/busyCounterCache.js';
import { BitField } from '@/lib/constants.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';
import { tradePlayerItems } from '@/lib/util/tradePlayerItems.js';

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

function getItemContractDetails(mUser: MUser) {
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

function icDonateValidation(user: MUser, donator: MUser) {
	if (user.isIronman) {
		return 'Ironmen stand alone!';
	}
	if (user.id === donator.id) {
		return 'You cannot donate to yourself.';
	}
	if (user.bitfield.includes(BitField.NoItemContractDonations)) {
		return "That user doesn't want donations.";
	}
	const details = getItemContractDetails(user);
	if (!details.nextContractIsReady || !details.currentItem) {
		return "That user's Item Contract isn't ready.";
	}

	if (user.isBusy || donator.isBusy) {
		return 'One of you is busy, and cannot do this trade right now.';
	}

	const cost = new Bank().add(details.currentItem.id);
	if (!donator.bank.has(cost)) {
		return `You don't own ${cost}.`;
	}

	return {
		cost,
		details
	};
}

async function donateICHandler(interaction: ButtonInteraction) {
	const userID = interaction.customId.split('_')[2];
	if (!userID) {
		return interaction.reply({ content: 'Invalid user.', ephemeral: true });
	}

	const user = await mUserFetch(userID);
	const donator = await mUserFetch(interaction.user.id);

	const errorStr = icDonateValidation(user, donator);
	if (typeof errorStr === 'string') return interaction.reply({ content: errorStr, ephemeral: true });

	const mConfirmation = new MInteraction({ interaction });
	await mConfirmation.confirmation({
		content: `${donator}, are you sure you want to give ${errorStr.cost} to ${
			user.badgedUsername
		}? You own ${donator.bank.amount(errorStr.details.currentItem!.id)} of this item.`,
		users: [donator.id]
	});

	await user.sync();
	await donator.sync();

	const secondaryErrorStr = icDonateValidation(user, donator);
	if (typeof secondaryErrorStr === 'string') return interaction.reply({ content: secondaryErrorStr });
	const { cost } = secondaryErrorStr;

	try {
		modifyBusyCounter(donator.id, 1);
		await tradePlayerItems(donator, user, cost);
		await donator.statsBankUpdate('ic_donations_given_bank', cost);
		await user.statsBankUpdate('ic_donations_received_bank', cost);
		const handInResult = await handInContract(new MInteraction({ interaction }), user);
		const nextIcDetails = getItemContractDetails(user);
		return interaction.reply({
			content: `${donator} donated ${cost} for ${user}'s Item Contract!

${user.mention} ${handInResult}

${Emoji.ItemContract} Your next contract is: ${nextIcDetails.currentItem?.name} ${dateFm(new Date(Date.now() + itemContractResetTime))}.`,
			allowedMentions: {
				users: [user.id]
			}
		});
	} catch (err) {
		Logging.logError({ err: err as Error, interaction: new MInteraction({ interaction }) });
	} finally {
		modifyBusyCounter(donator.id, -1);
	}
}

async function handInContract(interaction: MInteraction, user: MUser): Promise<string> {
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

export const ItemContracts = {
	skip,
	handInContract,
	donateICHandler,
	getItemContractDetails
};
