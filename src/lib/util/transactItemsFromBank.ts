import { Bank, EItem, type ItemBank } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import { deduplicateClueScrolls } from '@/lib/clues/clueUtils.js';
import { PerkTier } from '@/lib/constants.js';
import { handleNewCLItems } from '@/lib/handleNewCLItems.js';
import { filterLootReplace } from '@/lib/slayer/slayerUtil.js';
import type { SafeUserUpdateInput } from '@/lib/user/update.js';
import type { GearWithSetupType } from '@/lib/user/userTypes.js';
import { sellPriceOfItem, sellStorePriceOfItem, specialSoldItems } from '@/lib/util/sellPrices.js';
import { getSpecialSellExchange } from '@/lib/util/specialSellExchanges.js';
import { userQueueFn } from '@/lib/util/userQueues.js';
import { findBingosWithUserParticipating } from '@/mahoji/lib/bingo/BingoManager.js';

export interface TransactItemsArgs {
	user: MUser;
	itemsToAdd?: Bank;
	itemsToRemove?: Bank;
	collectionLog?: boolean;
	filterLoot?: boolean;
	dontAddToTempCL?: boolean;
	neverUpdateHistory?: boolean;
	otherUpdates?: SafeUserUpdateInput;
	gearUpdates?: GearWithSetupType[];
}

const autoSellTaxRatePercent = 25;

function calcAutoSellBank(user: MUser, bankToSell: Bank) {
	const soldBank = new Bank();
	const botItemSellData: Prisma.BotItemSellCreateManyInput[] = [];
	let gpReceived = 0;

	for (const [item, qty] of bankToSell.items()) {
		if (item.id === EItem.ECUMENICAL_KEY && !user.hasDiary('wilderness.hard')) continue;
		const specialPrice = specialSoldItems.get(item.id);
		const pricePerStack =
			specialPrice !== undefined
				? Math.floor(specialPrice * qty)
				: Math.floor(
						(user.isIronman
							? sellStorePriceOfItem(item, qty).price
							: sellPriceOfItem(item, autoSellTaxRatePercent).price) * qty
					);
		if (pricePerStack <= 0) continue;

		soldBank.add(item.id, qty);
		gpReceived += pricePerStack;
		botItemSellData.push({
			item_id: item.id,
			quantity: qty,
			gp_received: pricePerStack,
			user_id: user.id
		});
	}

	return { soldBank, gpReceived, botItemSellData };
}

async function unqueuedTransactItems({
	user,
	collectionLog,
	dontAddToTempCL,
	otherUpdates,
	filterLoot,
	neverUpdateHistory,
	gearUpdates,
	...options
}: TransactItemsArgs) {
	let itemsToAdd = options.itemsToAdd ? options.itemsToAdd.clone() : undefined;
	const itemsToRemove = options.itemsToRemove ? options.itemsToRemove.clone() : undefined;
	await user.sync();

	const gpToRemove = (itemsToRemove?.amount('Coins') ?? 0) - (itemsToAdd?.amount('Coins') ?? 0);
	if (itemsToRemove && user.GP < gpToRemove) {
		const errObj = new Error(
			`${user.usernameOrMention} doesn't have enough coins! They need ${gpToRemove} GP, but only have ${user.GP} GP.`
		);
		Logging.logError(errObj, {
			userID: user.id,
			previousGP: user.GP.toString(),
			gpToRemove: gpToRemove.toString(),
			itemsToAdd: itemsToAdd?.toString() ?? '',
			itemsToRemove: itemsToRemove.toString()
		});
		throw errObj;
	}
	const currentBank = new Bank(user.user.bank as ItemBank);
	const previousCL = new Bank(user.user.collectionLogBank as ItemBank);

	let clLootBank: Bank | null = null;
	const clItemsAdded = new Bank();
	if (itemsToAdd) {
		const errors = itemsToAdd.validate();
		if (errors.length > 0) {
			throw new Error(
				`Invalid itemsToAdd: UserID[${user.id}] Items[${itemsToAdd.toString()}] Errors[${errors.join(', ')}]`
			);
		}
		const { bankLoot, clLoot } = filterLoot
			? filterLootReplace({ currentBank, itemsToAdd })
			: { bankLoot: itemsToAdd, clLoot: itemsToAdd };
		clLootBank = clLoot;
		itemsToAdd = bankLoot;

		if (collectionLog) clItemsAdded.add(clLoot);
	}

	let gpUpdate: { increment: number } | undefined;
	if (itemsToAdd) {
		const coinsInLoot = itemsToAdd.amount('Coins');
		if (coinsInLoot > 0) {
			gpUpdate = {
				increment: coinsInLoot
			};
			itemsToAdd.remove('Coins', itemsToAdd.amount('Coins'));
		}
	}

	let autoSoldBank = new Bank();
	let autoDroppedBank = new Bank();
	let autoSellGPReceived = 0;
	let autoSellData: Prisma.BotItemSellCreateManyInput[] = [];

	if (itemsToAdd && itemsToAdd.length > 0 && (await user.fetchPerkTier()) >= PerkTier.Four) {
		const autoSellPreference = new Bank(user.user.auto_sell_bank as ItemBank);
		const autoDropPreference = new Bank(user.user.auto_drop_bank as ItemBank);

		if (autoSellPreference.length > 0) {
			for (let i = 0; i < 20; i++) {
				const specialExchange = getSpecialSellExchange(
					itemsToAdd.filter(item => autoSellPreference.has(item.id))
				);
				if (!specialExchange) break;
				itemsToAdd.remove(specialExchange.itemsToRemove);
				itemsToAdd.add(specialExchange.itemsToAdd);
				if (specialExchange.collectionLog) clItemsAdded.add(specialExchange.itemsToAdd);
				if (specialExchange.extraCollectionLogItems) clItemsAdded.add(specialExchange.extraCollectionLogItems);
			}

			const sellResult = calcAutoSellBank(
				user,
				itemsToAdd.filter(item => autoSellPreference.has(item.id))
			);
			autoSoldBank = sellResult.soldBank;
			autoSellGPReceived = sellResult.gpReceived;
			autoSellData = sellResult.botItemSellData;
			if (autoSoldBank.length > 0) {
				itemsToAdd.remove(autoSoldBank);
				if (gpUpdate) gpUpdate.increment += autoSellGPReceived;
				else gpUpdate = { increment: autoSellGPReceived };
			}
		}

		if (autoDropPreference.length > 0) {
			autoDroppedBank = itemsToAdd.filter(item => autoDropPreference.has(item.id));
			if (autoDroppedBank.length > 0) itemsToAdd.remove(autoDroppedBank);
		}
	}

	const newBank = new Bank(currentBank);
	if (itemsToAdd) newBank.add(itemsToAdd);

	if (itemsToRemove) {
		const errors = itemsToRemove.validate();
		if (errors.length > 0) {
			throw new Error(
				`Invalid itemsToRemove: UserID[${user.id}] Items[${itemsToRemove.toString()}] Errors[${errors.join(', ')}]`
			);
		}
		if (itemsToRemove.has('Coins')) {
			if (!gpUpdate) {
				gpUpdate = {
					increment: 0 - itemsToRemove.amount('Coins')
				};
			} else {
				gpUpdate.increment -= itemsToRemove.amount('Coins');
			}
			itemsToRemove.remove('Coins', itemsToRemove.amount('Coins'));
		}
		if (!newBank.has(itemsToRemove)) {
			const errObj = new Error(
				`Tried to remove ${itemsToRemove} from ${user.id}. but they don't own them. Missing: ${itemsToRemove
					.clone()
					.remove(currentBank)}`
			);
			Logging.logError(errObj, {
				userID: user.id,
				previousGP: user.GP.toString(),
				gpToRemove: gpToRemove.toString(),
				itemsToAdd: itemsToAdd?.toString() ?? '',
				itemsToRemove: itemsToRemove.toString()
			});
			throw errObj;
		}
		newBank.remove(itemsToRemove);
	}

	deduplicateClueScrolls(newBank);

	const clUpdates: Partial<Record<'temp_cl' | 'collectionLogBank', ItemBank>> =
		clItemsAdded.length > 0 ? user.calculateAddItemsToCLUpdates({ items: clItemsAdded, dontAddToTempCL }) : {};

	const updateData = {
		bank: newBank.toJSON(),
		GP: gpUpdate,
		...clUpdates,
		...otherUpdates
	} as const;
	const newUser = await user.rawUpdate({ data: updateData, gearUpdates });

	const itemsAdded = new Bank(itemsToAdd);
	if (itemsAdded && gpUpdate && gpUpdate.increment > 0) {
		itemsAdded.add('Coins', gpUpdate.increment);
	}

	const itemsRemoved = new Bank(itemsToRemove);
	if (itemsRemoved && gpUpdate && gpUpdate.increment < 0) {
		itemsRemoved.add('Coins', gpUpdate.increment);
	}

	const newCL = new Bank(newUser.user.collectionLogBank as ItemBank);

	if (!dontAddToTempCL && clItemsAdded.length > 0) {
		const activeBingos = await findBingosWithUserParticipating(user.id);
		for (const bingo of activeBingos) {
			if (bingo.isActive()) {
				bingo.handleNewItems(user.id, clItemsAdded);
			}
		}
	}

	if (!neverUpdateHistory) {
		await handleNewCLItems({ itemsAdded: clItemsAdded, user: user, previousCL, newCL });
	}

	const sideEffects: Promise<unknown>[] = [];
	if (autoSoldBank.length > 0) {
		sideEffects.push(
			ClientSettings.updateClientGPTrackSetting('gp_sell', autoSellGPReceived),
			ClientSettings.updateBankSetting('sold_items_bank', autoSoldBank),
			user.statsBankUpdate('items_sold_bank', autoSoldBank),
			user.statsUpdate({
				sell_gp: {
					increment: autoSellGPReceived
				}
			}),
			prisma.botItemSell.createMany({ data: autoSellData })
		);
	}
	if (autoDroppedBank.length > 0) {
		sideEffects.push(ClientSettings.updateBankSetting('dropped_items', autoDroppedBank));
	}
	if (sideEffects.length > 0) await Promise.all(sideEffects);

	return {
		previousCL,
		itemsAdded,
		itemsRemoved: itemsToRemove,
		newBank: new Bank(newUser.user.bank as ItemBank),
		newCL,
		newUser,
		clLootBank
	};
}

export async function transactItemsFromBank({
	user,
	collectionLog = false,
	filterLoot = true,
	dontAddToTempCL = false,
	...options
}: TransactItemsArgs) {
	return userQueueFn(user.id, async () =>
		unqueuedTransactItems({
			user,
			collectionLog,
			dontAddToTempCL,
			filterLoot,
			...options
		})
	);
}
