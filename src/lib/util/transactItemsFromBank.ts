import type { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { randomInteger } from 'remeda';
import { findBingosWithUserParticipating } from '../../mahoji/lib/bingo/BingoManager';
import { mahojiUserSettingsUpdate } from '../MUser';
import { ClueTiers } from '../clues/clueTiers';
import { handleNewCLItems } from '../handleNewCLItems';
import { filterLootReplace } from '../slayer/slayerUtil';
import type { ItemBank } from '../types';
import type { ActivityTaskOptions } from '../types/minions';
import { logError } from './logError';
import { userQueueFn } from './userQueues';

async function deduplicateClueScrolls({
	userID,
	loot,
	currentBank,
	tripOptions
}: { userID: string; loot: Bank; currentBank: Bank; tripOptions: ActivityTaskOptions | undefined }): Promise<{
	newLoot: Bank;
	droppedClues: Prisma.DroppedClueScrollCreateInput[];
}> {
	const droppedClues: Prisma.DroppedClueScrollCreateInput[] = [];
	const newLoot = loot.clone();
	for (const { scrollID } of ClueTiers) {
		if (!newLoot.has(scrollID)) continue;
		const amountOwned = currentBank.amount(scrollID);
		const amountInLoot = newLoot.amount(scrollID);

		newLoot.set(scrollID, amountOwned > 0 ? 0 : 1);

		const leftOvers = amountInLoot - amountOwned;
		if (tripOptions) {
			for (let i = 0; i < leftOvers; i++) {
				const dateReceived = new Date(
					randomInteger(tripOptions.finishDate - tripOptions.duration, tripOptions.finishDate)
				);
				droppedClues.push({
					user_id: userID,
					item_id: scrollID,
					date_received: dateReceived
				});
			}
		}
	}
	if (droppedClues.length > 0) {
		await prisma.droppedClueScroll.createMany({
			data: droppedClues
		});
	}
	return {
		newLoot,
		droppedClues
	};
}

export interface TransactItemsArgs {
	userID: string;
	itemsToAdd?: Bank;
	itemsToRemove?: Bank;
	collectionLog?: boolean;
	filterLoot?: boolean;
	dontAddToTempCL?: boolean;
	neverUpdateHistory?: boolean;
	otherUpdates?: Prisma.UserUpdateArgs['data'];
	tripOptions?: ActivityTaskOptions;
}

declare global {
	var transactItems: typeof transactItemsFromBank;
}

global.transactItems = transactItemsFromBank;
async function transactItemsFromBank({
	userID,
	collectionLog = false,
	filterLoot = true,
	dontAddToTempCL = false,
	tripOptions,
	...options
}: TransactItemsArgs) {
	let itemsToAdd = options.itemsToAdd ? options.itemsToAdd.clone() : undefined;
	const itemsToRemove = options.itemsToRemove ? options.itemsToRemove.clone() : undefined;

	return userQueueFn(userID, async function transactItemsInner() {
		const settings = await mUserFetch(userID);
		const messages: string[] = [];

		const gpToRemove = (itemsToRemove?.amount('Coins') ?? 0) - (itemsToAdd?.amount('Coins') ?? 0);
		if (itemsToRemove && settings.GP < gpToRemove) {
			const errObj = new Error(
				`${settings.usernameOrMention} doesn't have enough coins! They need ${gpToRemove} GP, but only have ${settings.GP} GP.`
			);
			logError(errObj, undefined, {
				userID: settings.id,
				previousGP: settings.GP.toString(),
				gpToRemove: gpToRemove.toString(),
				itemsToAdd: itemsToAdd?.toString() ?? '',
				itemsToRemove: itemsToRemove.toString()
			});
			throw errObj;
		}
		const currentBank = new Bank(settings.user.bank as ItemBank);
		const previousCL = new Bank(settings.user.collectionLogBank as ItemBank);

		let clUpdates: Prisma.UserUpdateArgs['data'] = {};
		if (itemsToAdd) {
			const dedupeResult = await deduplicateClueScrolls({
				loot: itemsToAdd.clone(),
				currentBank: currentBank.clone().remove(itemsToRemove ?? {}),
				userID,
				tripOptions
			});
			itemsToAdd = dedupeResult.newLoot;
			messages.push(`Dropped ${dedupeResult.droppedClues.length} clue scrolls`);
			const { bankLoot, clLoot } = filterLoot
				? filterLootReplace(settings.allItemsOwned, itemsToAdd)
				: { bankLoot: itemsToAdd, clLoot: itemsToAdd };
			itemsToAdd = bankLoot;

			clUpdates = collectionLog ? settings.calculateAddItemsToCLUpdates({ items: clLoot, dontAddToTempCL }) : {};
		}

		let gpUpdate: { increment: number } | undefined = undefined;
		if (itemsToAdd) {
			const coinsInLoot = itemsToAdd.amount('Coins');
			if (coinsInLoot > 0) {
				gpUpdate = {
					increment: coinsInLoot
				};
				itemsToAdd.remove('Coins', itemsToAdd.amount('Coins'));
			}
		}

		const newBank = new Bank(currentBank);
		if (itemsToAdd) newBank.add(itemsToAdd);

		if (itemsToRemove) {
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
					`Tried to remove ${itemsToRemove} from ${userID}. but they don't own them. Missing: ${itemsToRemove
						.clone()
						.remove(currentBank)}`
				);
				logError(errObj, undefined, {
					userID: settings.id,
					previousGP: settings.GP.toString(),
					gpToRemove: gpToRemove.toString(),
					itemsToAdd: itemsToAdd?.toString() ?? '',
					itemsToRemove: itemsToRemove.toString()
				});
				throw errObj;
			}
			newBank.remove(itemsToRemove);
		}

		const { newUser } = await mahojiUserSettingsUpdate(userID, {
			bank: newBank.toJSON(),
			GP: gpUpdate,
			...clUpdates,
			...options.otherUpdates
		});

		const itemsAdded = new Bank(itemsToAdd);
		if (itemsAdded && gpUpdate && gpUpdate.increment > 0) {
			itemsAdded.add('Coins', gpUpdate.increment);
		}

		const itemsRemoved = new Bank(itemsToRemove);
		if (itemsRemoved && gpUpdate && gpUpdate.increment < 0) {
			itemsRemoved.add('Coins', gpUpdate.increment);
		}

		const newCL = new Bank(newUser.collectionLogBank as ItemBank);

		if (!dontAddToTempCL && collectionLog) {
			const activeBingos = await findBingosWithUserParticipating(userID);
			for (const bingo of activeBingos) {
				if (bingo.isActive()) {
					bingo.handleNewItems(userID, itemsAdded);
				}
			}
		}

		if (!options.neverUpdateHistory) {
			await handleNewCLItems({ itemsAdded, user: settings, previousCL, newCL });
		}

		return {
			previousCL,
			itemsAdded,
			itemsRemoved: itemsToRemove,
			newBank: new Bank(newUser.bank as ItemBank),
			newCL,
			newUser,
			messages
		};
	});
}
