import { Bank, type ItemBank } from 'oldschooljs';

import { deduplicateClueScrolls } from '@/lib/clues/clueUtils.js';
import { handleNewCLItems } from '@/lib/handleNewCLItems.js';
import { filterLootReplace } from '@/lib/slayer/slayerUtil.js';
import type { SafeUserUpdateInput } from '@/lib/user/update.js';
import type { GearWithSetupType } from '@/lib/user/userTypes.js';
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

	let clUpdates: Partial<Record<'temp_cl' | 'collectionLogBank', ItemBank>> = {};
	let clLootBank: Bank | null = null;
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

		clUpdates = collectionLog ? user.calculateAddItemsToCLUpdates({ items: clLoot, dontAddToTempCL }) : {};
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

	if (!dontAddToTempCL && collectionLog) {
		const activeBingos = await findBingosWithUserParticipating(user.id);
		for (const bingo of activeBingos) {
			if (bingo.isActive()) {
				bingo.handleNewItems(user.id, itemsAdded);
			}
		}
	}

	if (!neverUpdateHistory) {
		await handleNewCLItems({ itemsAdded, user: user, previousCL, newCL });
	}

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
