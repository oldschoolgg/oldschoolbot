import { userMention } from '@discordjs/builders';
import { Prisma, User } from '@prisma/client';
import { percentChance, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import {
	clientSettingsUpdate,
	getSkillsOfMahojiUser,
	handleMahojiConfirmation,
	mahojiClientSettingsFetch,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch
} from '../../mahoji/mahojiSettings';
import { ItemBank } from '../types';
import { assert, clamp, stringMatches } from '../util';
import getOSItem from '../util/getOSItem';
import { minionIsBusy } from '../util/minionIsBusy';
import { minionName } from '../util/minionUtils';
import { IMaterialBank } from '.';
import { MaterialBank } from './MaterialBank';

const InventionFlags = ['equipped', 'bank'] as const;
type InventionFlag = typeof InventionFlags[number];

export enum InventionID {
	SuperiorBonecrusher = 1,
	SuperiorDwarfMultiCannon = 2,
	SuperiorInfernoAdze = 3
}

export type Invention = Readonly<{
	id: InventionID;
	name: string;
	description: string;
	item: Item;
	brokenVersion: Item;
	materialTypeBank: MaterialBank;
	flags: readonly InventionFlag[];
	itemCost: Bank;
	inventionLevelNeeded: number;
	/**
	 * Fine tune the amount of materials used in usage of the invention,
	 * e.g. 1 = base amount, 0.5 = half.
	 * null = has NO usage cost at all.
	 */
	usageCostMultiplier: number | null;
}>;

export const Inventions: readonly Invention[] = [
	{
		id: InventionID.SuperiorBonecrusher,
		name: 'Superior bonecrusher',
		description: 'Provides a 25% increase in XP over the Gorajan bonecrusher.',
		item: getOSItem('Superior bonecrusher'),
		brokenVersion: getOSItem('Superior bonecrusher (broken)'),
		materialTypeBank: new MaterialBank({
			pious: 75,
			sharp: 10,
			magic: 15
		}),
		flags: ['bank'],
		itemCost: new Bank().add('Gorajan bonecrusher').freeze(),
		inventionLevelNeeded: 70,
		usageCostMultiplier: 1
	},
	{
		id: InventionID.SuperiorDwarfMultiCannon,
		name: 'Superior dwarf multicannon',
		description: 'A 25% stronger version of the Dwarven multicannon.',
		item: getOSItem('Superior dwarf multicannon'),
		brokenVersion: getOSItem('Superior dwarf multicannon (broken)'),
		materialTypeBank: new MaterialBank({
			strong: 75,
			heavy: 10,
			metallic: 15
		}),
		flags: ['bank'],
		itemCost: new Bank()
			.add('Cannon base')
			.add('Cannon stand')
			.add('Cannon barrels')
			.add('Cannon furnace')
			.add('Dwarven bar')
			.freeze(),
		inventionLevelNeeded: 70,
		usageCostMultiplier: 1
	},
	{
		id: InventionID.SuperiorInfernoAdze,
		name: 'Superior inferno adze',
		description: 'Chops, and firemakes logs. Mines, and smelts ores.',
		item: getOSItem('Superior inferno adze'),
		brokenVersion: getOSItem('Superior inferno adze (broken)'),
		materialTypeBank: new MaterialBank({
			sharp: 25,
			base: 25,
			metallic: 25,
			magic: 25
		}),
		flags: ['equipped'],
		itemCost: new Bank().add('Inferno adze').add('Infernal core').add('Dragon pickaxe').freeze(),
		inventionLevelNeeded: 70,
		usageCostMultiplier: 0
	}
] as const;

function calculateSuccessChance(invLevel: number, cl: Bank, invention: Invention) {
	let successRatePercent = 1;

	// Higher success for higher invention levels
	successRatePercent += invLevel * 0.1;

	// 2x success if they have made one before
	if (cl.has(invention.item.id)) successRatePercent *= 2;

	assert(successRatePercent >= 0 && successRatePercent <= 100);
	return successRatePercent;
}

function calculateMaterialCostOfInventionAttempt(invention: Invention) {
	let baseMultiplierPerType = 7;
	let cost = new MaterialBank();
	for (const { type, quantity } of invention.materialTypeBank.values()) {
		cost.add(type, quantity * baseMultiplierPerType);
	}
	return cost;
}

function inventingDetails(user: User, invention: Invention) {
	const stats = getSkillsOfMahojiUser(user, true);
	const cl = new Bank(user.collectionLogBank as ItemBank);
	const successChance = calculateSuccessChance(stats.invention, cl, invention);

	const cost = calculateMaterialCostOfInventionAttempt(invention);

	return {
		successChance,
		cost
	};
}

export async function transactMaterialsFromUser({
	userID,
	add,
	remove,
	addToDisassembledItemsBank,
	addToResearchedMaterialsBank,
	addToInventionCostBank
}: {
	userID: bigint;
	add?: MaterialBank;
	remove?: MaterialBank;
	addToDisassembledItemsBank?: Bank;
	addToResearchedMaterialsBank?: boolean;
	addToInventionCostBank?: boolean;
}) {
	const user = await mahojiUsersSettingsFetch(userID, {
		materials_owned: true,
		disassembled_items_bank: true,
		researched_materials_bank: true
	});

	const materialsOwnedBank = new MaterialBank(user.materials_owned as IMaterialBank);
	if (add) materialsOwnedBank.add(add);
	if (remove) materialsOwnedBank.remove(remove);

	const updateObject: Prisma.UserUpdateArgs['data'] = {
		materials_owned: materialsOwnedBank.bank
	};
	if (addToDisassembledItemsBank) {
		updateObject.disassembled_items_bank = addToDisassembledItemsBank
			.clone()
			.add(user.disassembled_items_bank as ItemBank).bank;
	}
	if (addToResearchedMaterialsBank && remove) {
		updateObject.researched_materials_bank = remove
			.clone()
			.add(user.researched_materials_bank as IMaterialBank).bank;
	}

	if (addToInventionCostBank && remove) {
		const current = await mahojiClientSettingsFetch({ invention_materials_cost: true });
		await clientSettingsUpdate({
			invention_materials_cost: new MaterialBank(current as IMaterialBank).add(remove).bank
		});
	}

	await mahojiUserSettingsUpdate(userID, updateObject);
}

export async function inventCommand(
	interaction: SlashCommandInteraction,
	user: User,
	klasaUser: KlasaUser,
	inventionName: string
): CommandResponse {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	const invention = Inventions.find(i => stringMatches(i.name, inventionName));
	if (!invention) return "That's not a valid invention.";
	const details = inventingDetails(user, invention);
	if (!user.unlocked_blueprints.includes(invention.id)) {
		return `You don't have the blueprint for this Invention unlocked, your minion doesn't know how to make it! To unlock the blueprint, you can do research with one of these materials: ${invention.materialTypeBank
			.values()
			.map(i => i.type)
			.join(', ')}.`;
	}

	const ownedBank = new MaterialBank(user.materials_owned as IMaterialBank);

	const attemptsCanDo = ownedBank.fits(details.cost);
	if (attemptsCanDo === 0) {
		return `You don't have enough materials to do even one attempt at inventing this item. You need atleast: ${details.cost}.`;
	}

	if (!klasaUser.owns(invention.itemCost)) {
		return `You don't own the items needed to create this invention, you need: ${invention.itemCost}. You only have to use these items if you succesfully invent it.`;
	}

	let attemptsToDo = Math.min(attemptsCanDo, 10);

	await handleMahojiConfirmation(
		interaction,
		`${minionName(
			user
		)} will do up to ${attemptsToDo} attempts at making this item, or less if you succeed earlier. Each attempt will cost materials. They have a ${
			details.successChance
		}% chance of success. Are you sure you want to spend the materials to do this?`
	);

	let didSucceed = false;
	let attemptsDone = 0;
	for (let i = 0; i < attemptsToDo; i++) {
		attemptsDone++;
		if (percentChance(details.successChance)) {
			didSucceed = true;
			break;
		}
	}

	const cost = details.cost.clone().multiply(attemptsDone);
	await transactMaterialsFromUser({
		userID: BigInt(user.id),
		remove: cost
	});

	if (didSucceed) {
		await klasaUser.removeItemsFromBank(invention.itemCost);
		const loot = new Bank().add(invention.item.id);
		await klasaUser.addItemsToBank({ items: loot, collectionLog: true });
		return `${userMention(user.id)}, after ${attemptsDone} attempts at a ${
			details.successChance
		}% chance of success, your minion succesfully invented a ${
			invention.name
		}! You received ${loot}. Items removed: ${invention.itemCost}. Materials used: ${cost}.`;
	}
	return `${userMention(user.id)}, after ${attemptsDone} attempts at a ${
		details.successChance
	}% chance of success, your minion failed to invent a ${invention.name}. Materials used: ${cost}.`;
}

type InventionItemBoostResult =
	| {
			success: true;
			materialCost: MaterialBank;
	  }
	| {
			success: false;
	  };

export async function canAffordInventionBoost(userID: bigint, inventionID: InventionID, duration: number) {
	const mUser = await mahojiUsersSettingsFetch(userID, { materials_owned: true });
	const invention = Inventions.find(i => i.id === inventionID)!;
	if (invention.usageCostMultiplier === null) {
		throw new Error('Tried to calculate cost of invention that has no cost.');
	}
	const materialsOwned = new MaterialBank(mUser.materials_owned as IMaterialBank);
	const materialCost = new MaterialBank();
	let multiplier = Math.ceil(duration / (Time.Minute * 3));
	multiplier = clamp(Math.floor(multiplier * invention.usageCostMultiplier), 1, 1000);
	materialCost.add(invention.materialTypeBank.clone().multiply(multiplier));
	return {
		mUser,
		invention,
		materialsOwned,
		materialCost,
		canAfford: materialsOwned.has(materialCost)
	};
}

export async function inventionItemBoost({
	userID,
	inventionID,
	duration
}: {
	userID: string | bigint;
	inventionID: InventionID;
	duration: number;
}): Promise<InventionItemBoostResult> {
	const { materialCost, canAfford } = await canAffordInventionBoost(BigInt(userID), inventionID, duration);

	if (!canAfford) {
		return {
			success: false
		};
	}
	try {
		await transactMaterialsFromUser({
			userID: BigInt(userID),
			remove: materialCost,
			addToInventionCostBank: true
		});
		return { success: true, materialCost };
	} catch {
		return { success: false };
	}
}
