import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { StashUnit, User } from '@prisma/client';
import { partition } from 'e';
import { Bank } from 'oldschooljs';

import type { IStashUnit, StashUnitTier } from '../../../lib/clues/stashUnits';
import { allStashUnitTiers, allStashUnitsFlat } from '../../../lib/clues/stashUnits';

import { assert } from '../../../lib/util';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { itemNameFromID } from '../../../lib/util/smallUtils';
import { getMahojiBank } from '../../mahojiSettings';

export async function getParsedStashUnits(userID: string): Promise<ParsedUnit[]> {
	const currentStashUnits = await prisma.stashUnit.findMany({
		where: {
			user_id: BigInt(userID)
		}
	});
	const parsed = [];
	for (const unit of allStashUnitsFlat) {
		const builtUnit = currentStashUnits.find(i => i.stash_id === unit.id);
		const tier = allStashUnitTiers.find(i => i.units.includes(unit))!;

		parsed.push({
			unit,
			isFull: builtUnit
				? unit.items.every(slot => {
						if (Array.isArray(slot)) {
							return slot.some(i => builtUnit.items_contained.includes(i));
						}
						return builtUnit.items_contained.includes(slot);
					})
				: false,
			builtUnit,
			tier
		});
	}
	return parsed;
}

export interface ParsedUnit {
	unit: IStashUnit;
	isFull: boolean;
	builtUnit: StashUnit | undefined;
	tier: StashUnitTier;
}
export async function stashUnitViewCommand(
	user: User,
	stashID: string | undefined,
	notBuilt: boolean | undefined
): CommandResponse {
	const parsedUnits = await getParsedStashUnits(user.id);
	if (stashID) {
		const unit = parsedUnits.find(i => stringMatches(i.unit.id.toString(), stashID));
		if (!unit || !unit.builtUnit) return "You don't have this unit built.";
		return `${unit.unit.desc} - ${unit.tier.tier} STASH Unit
Contains: ${unit.builtUnit.items_contained.map(itemNameFromID).join(', ')}`;
	}

	if (notBuilt) {
		let str = "Stash units you haven't built/filled:\n";
		for (const { unit, tier } of parsedUnits.filter(i => !i.isFull || !i.builtUnit)) {
			str += `${unit.desc} (${tier.tier} tier): ${unit.items
				.map(item => [item].flat()[0])
				.map(itemNameFromID)
				.join(', ')}\n`;
		}
		if (str.length < 1000) {
			return {
				content: str
			};
		}
		return {
			files: [{ attachment: Buffer.from(str), name: 'stashunits.txt' }]
		};
	}

	let str = '**Your STASH Units**\n';
	for (const tier of allStashUnitTiers) {
		const parsedUnitsOfThisTier = parsedUnits.filter(i => tier.units.includes(i.unit));
		const [fullUnits] = partition(parsedUnitsOfThisTier, unit => unit.isFull);
		const [builtUnits] = partition(parsedUnitsOfThisTier, unit => unit.builtUnit !== undefined);
		str += `${tier.tier}: Built ${builtUnits.length}, filled ${fullUnits.length} out of ${parsedUnitsOfThisTier.length}\n`;
	}
	return str;
}

export async function stashUnitBuildAllCommand(user: MUser) {
	const parsedUnits = await getParsedStashUnits(user.id);
	const notBuilt = parsedUnits.filter(i => i.builtUnit === undefined);
	if (notBuilt.length === 0) return 'You have already built all STASH units.';
	const stats = user.skillsAsLevels;
	const checkBank = user.bank.clone();
	const costBank = new Bank();

	const toBuild: ParsedUnit[] = [];

	for (const parsedUnit of notBuilt) {
		if (parsedUnit.tier.constructionLevel > stats.construction) continue;
		if (!checkBank.has(parsedUnit.tier.cost)) continue;
		checkBank.remove(parsedUnit.tier.cost);
		costBank.add(parsedUnit.tier.cost);
		toBuild.push(parsedUnit);
	}

	if (toBuild.length === 0) {
		return 'There are no STASH units that you are able to build currently, due to lack of supplies or Construction level.';
	}

	if (!user.owns(costBank)) return "You don't own the items to do this.";
	await user.removeItemsFromBank(costBank);
	await prisma.stashUnit.createMany({
		data: toBuild.map(parsedUnit => ({
			user_id: BigInt(user.id),
			stash_id: parsedUnit.unit.id,
			items_contained: [],
			has_built: true
		}))
	});

	return `You created ${toBuild.length} STASH units, using ${costBank}.`;
}

export async function stashUnitFillAllCommand(user: MUser, mahojiUser: User): CommandResponse {
	const parsedUnits = await getParsedStashUnits(user.id);
	const notBuiltAndNotFilled = parsedUnits.filter(i => i.builtUnit !== undefined && !i.isFull);
	if (notBuiltAndNotFilled.length === 0) return 'There are no STASH units left that you can fill.';

	const checkBank = getMahojiBank(mahojiUser);
	const costBank = new Bank();

	const toFill: (ParsedUnit & { itemsToFillWith: Bank })[] = [];

	outerLoop: for (const parsedUnit of notBuiltAndNotFilled) {
		const costForThisUnit = new Bank();
		for (const itemOrItems of parsedUnit.unit.items) {
			const possibleItems = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
			const ownedItem = possibleItems.find(i => checkBank.has(i));
			if (!ownedItem) continue outerLoop;
			costForThisUnit.add(ownedItem);
		}
		if (checkBank.has(costForThisUnit)) {
			checkBank.remove(costForThisUnit);
			costBank.add(costForThisUnit);
			toFill.push({ ...parsedUnit, itemsToFillWith: costForThisUnit });
		}
	}

	if (toFill.length === 0) {
		return 'There are no STASH units that you are able to fill currently.';
	}
	assert(costBank.length !== 0);

	if (!user.owns(costBank)) return "You don't own the items to do this.";
	await user.removeItemsFromBank(costBank);

	const result = await prisma.$transaction(
		toFill.map(i =>
			prisma.stashUnit.update({
				where: {
					stash_id_user_id: {
						user_id: BigInt(user.id),
						stash_id: i.unit.id
					}
				},
				data: {
					items_contained: i.itemsToFillWith.items().map(i => i[0].id)
				}
			})
		)
	);
	assert(result.length === toFill.length);

	const { file } = await makeBankImage({ bank: costBank, title: 'Items Removed For Stash Units' });

	return { files: [file], content: `You filled ${result.length} STASH units, with these items.` };
}

export async function stashUnitUnfillCommand(user: MUser, unitID: string) {
	const parsedUnits = await getParsedStashUnits(user.id);
	const unit = parsedUnits.find(i => stringMatches(i.unit.id.toString(), unitID));
	if (!unit || !unit.builtUnit) return 'Invald unit.';
	const containedItems = unit.builtUnit.items_contained;
	if (containedItems.length === 0) return 'You have no items in this STASH.';
	const loot = new Bank();
	for (const id of containedItems) loot.add(id);
	await prisma.stashUnit.update({
		where: {
			stash_id_user_id: {
				stash_id: unit.unit.id,
				user_id: BigInt(user.id)
			}
		},
		data: {
			items_contained: []
		}
	});
	await user.addItemsToBank({ items: loot, collectionLog: false, dontAddToTempCL: true });
	return `You took **${loot}** out of your '${unit.unit.desc}' ${unit.tier.tier} STASH unit.`;
}
