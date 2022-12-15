import { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { bingoIsActive, determineBingoProgress, onFinishTile } from '../../mahoji/lib/bingo';
import { mahojiUserSettingsUpdate } from '../../mahoji/settingsUpdate';
import { deduplicateClueScrolls } from '../clues/clueUtils';
import { handleNewCLItems } from '../handleNewCLItems';
import { filterLootReplace } from '../slayer/slayerUtil';
import { ItemBank } from '../types';
import { sanitizeBank } from '../util';
import { logError } from './logError';
import { userQueueFn } from './userQueues';

interface TransactItemsArgs {
	userID: string;
	itemsToAdd?: Bank;
	itemsToRemove?: Bank;
	collectionLog?: boolean;
	filterLoot?: boolean;
	dontAddToTempCL?: boolean;
}

declare global {
	const transactItems: typeof transactItemsFromBank;
}
declare global {
	namespace NodeJS {
		interface Global {
			transactItems: typeof transactItemsFromBank;
		}
	}
}
global.transactItems = transactItemsFromBank;
export async function transactItemsFromBank({
	userID,
	collectionLog = false,
	filterLoot = true,
	dontAddToTempCL = false,
	...options
}: TransactItemsArgs) {
	let itemsToAdd = options.itemsToAdd ? options.itemsToAdd.clone() : undefined;
	let itemsToRemove = options.itemsToRemove ? options.itemsToRemove.clone() : undefined;
	return userQueueFn(userID, async () => {
		const settings = await mUserFetch(userID);
		const gpToRemove = (itemsToRemove?.amount('Coins') ?? 0) - (itemsToAdd?.amount('Coins') ?? 0);
		if (itemsToRemove && settings.GP < gpToRemove) {
			const errObj = new Error(`${settings.usernameOrMention} doesn't have enough coins!`);
			logError(errObj, undefined, {
				userID: settings.id,
				previousGP: settings.GP.toString(),
				gpToRemove: gpToRemove.toString(),
				itemsToAdd: itemsToAdd?.toString() ?? '',
				itemsToRemove: itemsToRemove.toString()
			});
			throw errObj;
		}
		const currentBank = new Bank().add(settings.user.bank as ItemBank);
		const previousCL = new Bank().add(settings.user.collectionLogBank as ItemBank);
		const previousTempCL = new Bank().add(settings.user.temp_cl as ItemBank);

		let clUpdates: Prisma.UserUpdateArgs['data'] = {};
		if (itemsToAdd) {
			itemsToAdd = deduplicateClueScrolls({
				loot: itemsToAdd.clone(),
				currentBank: currentBank.clone().remove(itemsToRemove ?? {})
			});
			const { bankLoot, clLoot } = filterLoot
				? filterLootReplace(settings.allItemsOwned(), itemsToAdd)
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

		const newBank = new Bank().add(currentBank);
		if (itemsToAdd) newBank.add(itemsToAdd);

		sanitizeBank(newBank);

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
			bank: newBank.bank,
			GP: gpUpdate,
			...clUpdates
		});

		const itemsAdded = new Bank().add(itemsToAdd);
		if (itemsAdded && gpUpdate && gpUpdate.increment > 0) {
			itemsAdded.add('Coins', gpUpdate.increment);
		}

		const itemsRemoved = new Bank().add(itemsToRemove);
		if (itemsRemoved && gpUpdate && gpUpdate.increment < 0) {
			itemsRemoved.add('Coins', gpUpdate.increment);
		}

		const newCL = new Bank(newUser.collectionLogBank as ItemBank);
		const newTempCL = new Bank(newUser.temp_cl as ItemBank);

		if (newUser.bingo_tickets_bought > 0 && bingoIsActive()) {
			const before = determineBingoProgress(previousTempCL);
			const after = determineBingoProgress(newTempCL);
			// If they finished a tile, process it.
			if (before.tilesCompletedCount !== after.tilesCompletedCount) {
				onFinishTile(newUser, before, after);
			}
		}

		handleNewCLItems({ itemsAdded, user: settings, previousCL, newCL });

		return {
			previousCL,
			itemsAdded,
			itemsRemoved: itemsToRemove,
			newBank: new Bank(newUser.bank as ItemBank),
			newCL,
			newUser
		};
	});
}
