import { uniqueArr } from '@oldschoolgg/toolkit';
import { type ItemBank, Items } from 'oldschooljs';

import { GEListingType, type Prisma } from '@/prisma/main.js';

// Mapping format: old item ID -> new item ID.
export const brokenItemRemap: Record<number, number> = {
	// Saradomin cape wrong ID was being used in medium caskets.
	4041: 10446,
	// Zamorak cape wrong ID was being used in medium caskets.
	4042: 10450,
	// Venator ring old/untradeable ID was being used, causing the wrong visual/icon.
	25487: 28310,
	// Ultor ring old/untradeable ID was being used, causing the wrong visual/icon.
	25485: 28307,
	// Magus ring old/untradeable ID was being used, causing the wrong visual/icon.
	25486: 28313,
	// Bellator ring old/untradeable ID was being used, causing the wrong visual/icon.
	25488: 28316,
	// Soulreaper axe old ID was being used, causing the wrong visual/icon.
	25484: 28338
};

const gearFields = [
	'gear_fashion',
	'gear_melee',
	'gear_mage',
	'gear_range',
	'gear_misc',
	'gear_other',
	'gear_skilling',
	'gear_wildy'
] as const;

type GEListingSnapshot = {
	id: number;
	item_id: number;
	quantity_remaining: number;
	type: GEListingType;
};

export function buildGEListingRemapPlan(listings: GEListingSnapshot[]): {
	listingIDsByOldID: Record<number, number[]>;
	sellQtyByOldID: Record<number, number>;
	totalListingsToUpdate: number;
} {
	const listingIDsByOldID: Record<number, number[]> = {};
	const sellQtyByOldID: Record<number, number> = {};
	for (const listing of listings) {
		if (!brokenItemRemap[listing.item_id]) continue;
		if (!listingIDsByOldID[listing.item_id]) {
			listingIDsByOldID[listing.item_id] = [];
		}
		listingIDsByOldID[listing.item_id].push(listing.id);
		if (listing.type === GEListingType.Sell) {
			sellQtyByOldID[listing.item_id] = (sellQtyByOldID[listing.item_id] ?? 0) + listing.quantity_remaining;
		}
	}
	return {
		listingIDsByOldID,
		sellQtyByOldID,
		totalListingsToUpdate: Object.values(listingIDsByOldID).reduce((acc, ids) => acc + ids.length, 0)
	};
}

export function remapBankObject(bank: ItemBank): { bank: ItemBank; moves: Record<number, number>; changed: boolean } {
	const next = { ...bank };
	const moves: Record<number, number> = {};
	let changed = false;
	for (const [oldIDString, newID] of Object.entries(brokenItemRemap)) {
		const oldID = Number(oldIDString);
		const oldQty = Number(next[oldID] ?? 0);
		if (!oldQty) continue;
		const existingNewQty = Number(next[newID] ?? 0);
		next[newID] = existingNewQty + oldQty;
		delete next[oldID];
		moves[oldID] = oldQty;
		changed = true;
	}
	return { bank: next, moves, changed };
}

export function remapFavouriteItems(favourites: number[]): { favourites: number[]; changed: boolean } {
	const remapped = uniqueArr(favourites.map(id => brokenItemRemap[id] ?? id));
	const changed =
		favourites.length !== remapped.length || favourites.some((itemID, index) => itemID !== remapped[index]);
	return { favourites: remapped, changed };
}

export function remapGearSetup(setup: Record<string, { item: number } | null> | null): {
	setup: Record<string, { item: number } | null> | null;
	changed: boolean;
} {
	if (!setup) return { setup, changed: false };
	const cloned = structuredClone(setup);
	let changed = false;
	for (const [slot, data] of Object.entries(cloned)) {
		if (!data) continue;
		const remapped = brokenItemRemap[data.item];
		if (!remapped) continue;
		cloned[slot] = { ...data, item: remapped };
		changed = true;
	}
	return { setup: cloned, changed };
}

export async function fixBrokenBankCommand(user: MUser): Promise<string> {
	const MAX_RETRIES = 5;
	let retries = 0;

	const runFixTransaction = async () => {
		return prisma.$transaction(
			async tx => {
				const txUser = await tx.user.findUniqueOrThrow({
					where: { id: user.id },
					select: {
						bank: true,
						collectionLogBank: true,
						temp_cl: true,
						favoriteItems: true,
						gear_fashion: true,
						gear_melee: true,
						gear_mage: true,
						gear_range: true,
						gear_misc: true,
						gear_other: true,
						gear_skilling: true,
						gear_wildy: true
					}
				});

				const userStats = await tx.userStats.upsert({
					where: { user_id: BigInt(user.id) },
					create: { user_id: BigInt(user.id) },
					update: {},
					select: { sacrificed_bank: true }
				});

				const brokenIDKeys = Object.keys(brokenItemRemap).map(Number);
				const activeGEListings = await tx.gEListing.findMany({
					where: {
						user_id: user.id,
						item_id: {
							in: brokenIDKeys
						},
						cancelled_at: null,
						fulfilled_at: null
					},
					select: {
						id: true,
						item_id: true,
						quantity_remaining: true,
						type: true
					}
				});
				const gePlan = buildGEListingRemapPlan(activeGEListings);
				const changes: Prisma.UserUpdateInput = {};
				const moveTotals: Record<number, number> = {};
				const touchedAreas: string[] = [];
				let geListingsUpdated = 0;

				const accumulateMoves = (moves: Record<number, number>) => {
					for (const [itemID, qty] of Object.entries(moves)) {
						const id = Number(itemID);
						moveTotals[id] = (moveTotals[id] ?? 0) + qty;
					}
				};

				const bankRes = remapBankObject(txUser.bank as ItemBank);
				if (bankRes.changed) {
					changes.bank = bankRes.bank;
					touchedAreas.push('bank');
					accumulateMoves(bankRes.moves);
				}

				const clRes = remapBankObject(txUser.collectionLogBank as ItemBank);
				if (clRes.changed) {
					changes.collectionLogBank = clRes.bank;
					touchedAreas.push('collection log');
					accumulateMoves(clRes.moves);
				}

				const tempCLRes = remapBankObject(txUser.temp_cl as ItemBank);
				if (tempCLRes.changed) {
					changes.temp_cl = tempCLRes.bank;
					touchedAreas.push('temp CL');
					accumulateMoves(tempCLRes.moves);
				}

				const favouriteRes = remapFavouriteItems(txUser.favoriteItems);
				if (favouriteRes.changed) {
					changes.favoriteItems = favouriteRes.favourites;
					touchedAreas.push('favourites');
				}

				for (const gearField of gearFields) {
					const currentSetup = txUser[gearField] as Record<string, { item: number } | null> | null;
					const gearResult = remapGearSetup(currentSetup);
					if (!gearResult.changed) continue;
					changes[gearField] = gearResult.setup as any;
					touchedAreas.push(gearField.replace('gear_', 'gear '));
				}

				const sacRes = remapBankObject(userStats.sacrificed_bank as ItemBank);
				if (Object.keys(changes).length === 0 && !sacRes.changed && gePlan.totalListingsToUpdate === 0) {
					return {
						changed: false,
						touchedAreas: [] as string[],
						moveTotals: {} as Record<number, number>,
						geListingsUpdated: 0
					};
				}

				if (Object.keys(changes).length > 0) {
					await tx.user.update({
						where: { id: user.id },
						data: changes
					});
				}

				if (sacRes.changed) {
					await tx.userStats.update({
						where: { user_id: BigInt(user.id) },
						data: {
							sacrificed_bank: sacRes.bank
						}
					});
					touchedAreas.push('sacrificed bank');
					accumulateMoves(sacRes.moves);
				}

				for (const [oldIDString, newID] of Object.entries(brokenItemRemap)) {
					const oldID = Number(oldIDString);
					const listingIDs = gePlan.listingIDsByOldID[oldID] ?? [];
					if (listingIDs.length > 0) {
						const listingUpdateResult = await tx.gEListing.updateMany({
							where: {
								id: {
									in: listingIDs
								},
								user_id: user.id,
								item_id: oldID,
								cancelled_at: null,
								fulfilled_at: null
							},
							data: {
								item_id: newID
							}
						});
						if (listingUpdateResult.count !== listingIDs.length) {
							throw new Error(`Failed to remap all expected GE listings for item ${oldID}.`);
						}
						geListingsUpdated += listingUpdateResult.count;
					}

					const sellQtyMoved = gePlan.sellQtyByOldID[oldID] ?? 0;
					if (sellQtyMoved <= 0) continue;

					const sellQtyMovedBigInt = BigInt(sellQtyMoved);
					const oldBankRow = await tx.gEBank.findUnique({
						where: {
							item_id: oldID
						},
						select: {
							quantity: true
						}
					});
					if (!oldBankRow || oldBankRow.quantity < sellQtyMovedBigInt) {
						throw new Error(
							`Unable to safely remap GE bank for item ${oldID}; expected at least ${sellQtyMoved} quantity.`
						);
					}

					await tx.gEBank.update({
						where: {
							item_id: oldID
						},
						data: {
							quantity: {
								decrement: sellQtyMovedBigInt
							}
						}
					});
					await tx.gEBank.upsert({
						where: {
							item_id: newID
						},
						create: {
							item_id: newID,
							quantity: sellQtyMovedBigInt
						},
						update: {
							quantity: {
								increment: sellQtyMovedBigInt
							}
						}
					});
					await tx.gEBank.deleteMany({
						where: {
							item_id: oldID,
							quantity: {
								lte: BigInt(0)
							}
						}
					});
				}
				if (geListingsUpdated > 0) {
					touchedAreas.push('G.E. listings');
				}

				return {
					changed: true,
					touchedAreas,
					moveTotals,
					geListingsUpdated
				};
			},
			{
				isolationLevel: 'RepeatableRead'
			}
		);
	};

	let result:
		| {
				changed: boolean;
				touchedAreas: string[];
				moveTotals: Record<number, number>;
				geListingsUpdated: number;
		  }
		| undefined;
	while (retries < MAX_RETRIES) {
		try {
			result = await runFixTransaction();
			break;
		} catch (error) {
			if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2034') {
				retries++;
				continue;
			}
			throw error;
		}
	}
	if (!result) {
		throw new Error('Failed to fix bank due to transaction conflicts.');
	}

	await user.sync();

	if (!result.changed) {
		return 'No remappable broken items found on your account.';
	}

	const movedSummary = Object.entries(result.moveTotals)
		.map(([oldID, qty]) => {
			const newID = brokenItemRemap[Number(oldID)];
			const oldName = Items.get(Number(oldID))?.name ?? `Item ${oldID}`;
			const newName = Items.get(newID)?.name ?? `Item ${newID}`;
			return `${qty.toLocaleString()}x ${oldName} (${oldID} -> ${newID}, ${newName})`;
		})
		.join('\n');

	const movedSection = movedSummary.length > 0 ? `\n\nMoved:\n${movedSummary}` : '';
	const geSummary =
		result.geListingsUpdated > 0 ? `\nUpdated ${result.geListingsUpdated} active G.E. listing(s).` : '';
	return `Fixed broken item mappings in: ${uniqueArr(result.touchedAreas).join(', ')}.${movedSection}${geSummary}`;
}
