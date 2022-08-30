import { userMention } from '@discordjs/builders';
import { Prisma, User } from '@prisma/client';
import { reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import {
	mahojiClientSettingsFetch,
	mahojiClientSettingsUpdate,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch
} from '../../mahoji/mahojiSettings';
import { ClueTier, ClueTiers } from '../clues/clueTiers';
import { ItemBank } from '../types';
import { clamp, formatDuration, stringMatches, toKMB } from '../util';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';
import { minionIsBusy } from '../util/minionIsBusy';
import { hasItemsEquippedOrInBank, userHasItemsEquippedAnywhere } from '../util/minionUtils';
import { IMaterialBank, MaterialType } from '.';
import { MaterialBank } from './MaterialBank';

const InventionFlags = ['equipped', 'bank'] as const;
type InventionFlag = typeof InventionFlags[number];

export enum InventionID {
	SuperiorBonecrusher = 1,
	SuperiorDwarfMultiCannon = 2,
	SuperiorInfernoAdze = 3,
	SilverHawkBoots = 4,
	MechaMortar = 5,
	QuickTrap = 6,
	ArcaneHarvester = 7,
	ClueUpgrader = 8,
	PortableTanner = 9,
	DrygoreSaw = 10,
	DwarvenToolkit = 11,
	MechaRod = 12,
	MasterHammerAndChisel = 13,
	AbyssalAmulet = 14
}

export type Invention = Readonly<{
	id: InventionID;
	name: string;
	description: string;
	item: Item;
	materialTypeBank: MaterialBank;
	flags: readonly InventionFlag[];
	itemCost: Bank | null;
	inventionLevelNeeded: number;
	/**
	 * Fine tune the amount of materials used in usage of the invention,
	 * e.g. 1 = base amount, 0.5 = half.
	 * null = has NO usage cost at all.
	 */
	usageCostMultiplier: number | null;
	extraDescription?: () => string;
}>;

export const inventionBoosts = {
	abyssalAmulet: {
		boosts: [
			{ runes: ['Fire rune', 'Water rune', 'Air rune', 'Earth rune', 'Body rune', 'Mind rune'], boost: 65 },
			{ runes: ['Mist rune', 'Mud rune', 'Dust rune'], boost: 35 },
			{ runes: ['Lava rune', 'Steam rune', 'Smoke rune'], boost: 20 },
			{ runes: ['Death rune', 'Astral rune', 'Wrath rune', 'Law rune', 'Nature rune'], boost: 50 },
			{ runes: ['Chaos rune', 'Cosmic rune'], boost: 60 },
			{ runes: ['Blood rune', 'Soul rune'], boost: 95 },
			{ runes: ['Elder rune'], boost: 65 }
		]
	},
	silverHawks: {
		passiveXPCalc: (duration: number, agilityLevel: number) => {
			const minuteSegments = Math.floor(duration / Time.Minute);
			return agilityLevel * 5 * minuteSegments;
		},
		agilityBoostMultiplier: 1.9
	},
	superiorBonecrusher: {
		xpBoostPercent: 25
	},
	superiorCannon: {
		speedBoostPercentSingles: 37,
		speedBoostPercentMulti: 65
	},
	mechaMortar: {
		herbloreSpeedBoostPercent: 45
	},
	quickTrap: {
		boxTrapBoostPercent: 25
	},
	arcaneHarvester: {
		harvestBoostPercent: 20
	},
	drygoreSaw: {
		buildBoostPercent: 40
	},
	dwarvenToolkit: {
		disassembleBoostPercent: 35,
		requiredLevel: 80
	},
	mechaRod: {
		speedBoostPercent: 45
	},
	masterHammerAndChisel: {
		speedBoostPercent: 45
	},
	inventionMasterCape: {
		materialCostReductionPercent: 5,
		extraMaterialsPercent: 5,
		disassemblySpeedBoostPercent: 5
	},
	clueUpgrader: {
		chance: (clue: ClueTier) => {
			let index = ClueTiers.indexOf(clue);
			let chanceOfUpgradePercent = 45 - (index + 1) * 5;
			return chanceOfUpgradePercent;
		},
		pickPocketChance: (clue: ClueTier) => {
			return Math.ceil(inventionBoosts.clueUpgrader.chance(clue) / 5);
		},
		durationCalc: (clue: ClueTier) => {
			let index = ClueTiers.indexOf(clue);
			return (index + 1) * (Time.Minute * 3);
		}
	}
} as const;

export const Inventions: readonly Invention[] = [
	{
		id: InventionID.SuperiorBonecrusher,
		name: 'Superior bonecrusher',
		description: `Provides a ${inventionBoosts.superiorBonecrusher.xpBoostPercent}% increase in XP over the Gorajan bonecrusher.`,
		item: getOSItem('Superior bonecrusher'),
		materialTypeBank: new MaterialBank({
			pious: 5,
			sharp: 1,
			magic: 4
		}),
		flags: ['bank'],
		itemCost: new Bank().add('Gorajan bonecrusher').freeze(),
		inventionLevelNeeded: 70,
		usageCostMultiplier: 0.5
	},
	{
		id: InventionID.SuperiorDwarfMultiCannon,
		name: 'Superior dwarf multicannon',
		description: `A ${inventionBoosts.superiorCannon.speedBoostPercentSingles}-${inventionBoosts.superiorCannon.speedBoostPercentMulti}% stronger version of the Dwarven multicannon.`,
		item: getOSItem('Superior dwarf multicannon'),
		materialTypeBank: new MaterialBank({
			strong: 4,
			heavy: 2,
			metallic: 4
		}),
		flags: ['bank'],
		itemCost: new Bank()
			.add('Cannon base')
			.add('Cannon stand')
			.add('Cannon barrels')
			.add('Cannon furnace')
			.add('Dwarven bar')
			.freeze(),
		inventionLevelNeeded: 80,
		usageCostMultiplier: 0.1
	},
	{
		id: InventionID.SuperiorInfernoAdze,
		name: 'Superior inferno adze',
		description: 'Chops, and firemakes logs. Mines, and smelts ores.',
		item: getOSItem('Superior inferno adze'),
		materialTypeBank: new MaterialBank({
			sharp: 3,
			base: 3,
			metallic: 1,
			magic: 3
		}),
		flags: ['equipped'],
		itemCost: new Bank().add('Inferno adze').add('Infernal core').add('Dragon pickaxe').freeze(),
		inventionLevelNeeded: 80,
		usageCostMultiplier: 0
	},
	{
		id: InventionID.SilverHawkBoots,
		name: 'Silverhawk boots',
		description: `Makes agility ${
			inventionBoosts.silverHawks.agilityBoostMultiplier
		}x faster, and gives up to ${toKMB(
			inventionBoosts.silverHawks.passiveXPCalc(Time.Hour, 120)
		)}/hr passive agility XP.`,
		item: getOSItem('Silverhawk boots'),
		materialTypeBank: new MaterialBank({
			swift: 5,
			protective: 1,
			dextrous: 4
		}),
		flags: ['equipped'],
		itemCost: new Bank().add('Graceful boots').freeze(),
		inventionLevelNeeded: 90,
		usageCostMultiplier: 0.1
	},
	{
		id: InventionID.MechaMortar,
		name: 'Mecha mortar',
		description: `Makes Herblore training ${inventionBoosts.mechaMortar.herbloreSpeedBoostPercent}% faster.`,
		item: getOSItem('Mecha mortar'),
		materialTypeBank: new MaterialBank({
			organic: 8,
			metallic: 2
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 95,
		usageCostMultiplier: 0.8
	},
	{
		id: InventionID.QuickTrap,
		name: 'Quick trap',
		description: `Makes box-trap hunting ${inventionBoosts.quickTrap.boxTrapBoostPercent}% faster.`,
		item: getOSItem('Quick trap'),
		materialTypeBank: new MaterialBank({
			precious: 1,
			magic: 6,
			organic: 3
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 90,
		usageCostMultiplier: 0.5
	},
	{
		id: InventionID.ArcaneHarvester,
		name: 'Arcane harvester',
		description: `Increases farming yield by ${inventionBoosts.arcaneHarvester.harvestBoostPercent}%.`,
		item: getOSItem('Arcane harvester'),
		materialTypeBank: new MaterialBank({
			organic: 5,
			magic: 5
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 110,
		usageCostMultiplier: 0.8
	},
	{
		id: InventionID.PortableTanner,
		name: 'Portable tanner',
		description: 'Tans hides received from PvM.',
		item: getOSItem('Portable tanner'),
		materialTypeBank: new MaterialBank({
			metallic: 2,
			plated: 3,
			organic: 5
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 95,
		usageCostMultiplier: 0.5
	},
	{
		id: InventionID.DrygoreSaw,
		name: 'Drygore saw',
		description: `${inventionBoosts.drygoreSaw.buildBoostPercent}% faster construction building.`,
		item: getOSItem('Drygore saw'),
		materialTypeBank: new MaterialBank({
			drygore: 7,
			sharp: 3
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 105,
		usageCostMultiplier: 0.6
	},
	{
		id: InventionID.ClueUpgrader,
		name: 'Clue upgrader',
		description: 'Has a chance to upgrade Beginner-Elite clues to the next tier when received as loot in PvM.',
		item: getOSItem('Clue upgrader'),
		materialTypeBank: new MaterialBank({
			treasured: 8,
			metallic: 2
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 110,
		usageCostMultiplier: 0.3,
		extraDescription: () => {
			let str = '';
			for (const clue of ClueTiers.slice(0, 5)) {
				let index = ClueTiers.indexOf(clue);
				let next = ClueTiers[index + 1];
				str += `**${clue.name}:** ${inventionBoosts.clueUpgrader.chance(clue)}% chance to upgrade into ${
					next.name
				}, costs ${formatDuration(inventionBoosts.clueUpgrader.durationCalc(clue))}\n`;
			}
			return str;
		}
	},
	{
		id: InventionID.DwarvenToolkit,
		name: 'Dwarven toolkit',
		description: `Makes disassembly ${inventionBoosts.dwarvenToolkit.disassembleBoostPercent}% faster`,
		item: getOSItem('Dwarven toolkit'),
		materialTypeBank: new MaterialBank({
			dwarven: 8,
			metallic: 2
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: inventionBoosts.dwarvenToolkit.requiredLevel,
		usageCostMultiplier: 0.05
	},
	{
		id: InventionID.MechaRod,
		name: 'Mecha Rod',
		description: `Makes fishing ${inventionBoosts.mechaRod.speedBoostPercent}% faster.`,
		item: getOSItem('Mecha rod'),
		materialTypeBank: new MaterialBank({
			flexible: 4,
			organic: 4,
			strong: 2
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 85,
		usageCostMultiplier: 0.7
	},
	{
		id: InventionID.MasterHammerAndChisel,
		name: 'Master Hammer and Chisel',
		description: `Makes Crafting ${inventionBoosts.masterHammerAndChisel.speedBoostPercent}% faster.`,
		item: getOSItem('Master hammer and chisel'),
		materialTypeBank: new MaterialBank({
			simple: 3,
			sharp: 2,
			metallic: 2,
			swift: 3
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 90,
		usageCostMultiplier: 0.9
	},
	{
		id: InventionID.AbyssalAmulet,
		name: 'Abyssal amulet',
		description: 'Provides a significant boost to Runecrafting runes.',
		item: getOSItem('Abyssal amulet'),
		materialTypeBank: new MaterialBank({
			magic: 4,
			treasured: 3,
			metallic: 3
		}),
		flags: ['bank'],
		itemCost: new Bank().add('Abyssal gem').freeze(),
		inventionLevelNeeded: 120,
		usageCostMultiplier: 0.5,
		extraDescription: () => {
			let str = '';
			for (const boost of inventionBoosts.abyssalAmulet.boosts) {
				str += `**${boost.boost}%** faster Runecrafting for the following runes: ${boost.runes.join(', ')}\n`;
			}
			return str;
		}
	}
] as const;

export const materialBoosts: Map<MaterialType, { outputMulitplier?: number; reduceCostToPercent?: number }> = new Map([
	[
		'drygore',
		{
			outputMulitplier: 800,
			reduceCostToPercent: 15
		}
	],
	[
		'dwarven',
		{
			outputMulitplier: 800,
			reduceCostToPercent: 15
		}
	],
	[
		'treasured',
		{
			outputMulitplier: 100
		}
	],
	[
		'mysterious',
		{
			outputMulitplier: 1000
		}
	],
	[
		'gilded',
		{
			outputMulitplier: 400
		}
	]
]);

export function inventingCost(invention: Invention) {
	let baseMultiplierPerType = 7;
	let cost = new MaterialBank();
	for (const { type, quantity } of invention.materialTypeBank.values()) {
		cost.add(type, quantity * 10 * baseMultiplierPerType);
	}
	return cost;
}

export async function transactMaterialsFromUser({
	userID,
	add,
	remove,
	addToDisassembledItemsBank,
	addToResearchedMaterialsBank,
	addToGlobalInventionCostBank
}: {
	userID: bigint;
	add?: MaterialBank;
	remove?: MaterialBank;
	addToDisassembledItemsBank?: Bank;
	addToResearchedMaterialsBank?: boolean;
	addToGlobalInventionCostBank?: boolean;
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

	if (addToGlobalInventionCostBank && remove) {
		const current = await mahojiClientSettingsFetch({ invention_materials_cost: true });
		await mahojiClientSettingsUpdate({
			invention_materials_cost: new MaterialBank(current.invention_materials_cost as IMaterialBank).add(remove)
				.bank
		});
	}

	await mahojiUserSettingsUpdate(userID, updateObject);
}

export async function inventCommand(user: User, klasaUser: KlasaUser, inventionName: string): CommandResponse {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	const invention = Inventions.find(i => stringMatches(i.name, inventionName));
	if (!invention) return "That's not a valid invention.";
	if (!user.unlocked_blueprints.includes(invention.id)) {
		return `You don't have the blueprint for this Invention unlocked, your minion doesn't know how to make it! To unlock the blueprint, you can do research with one of these materials: ${invention.materialTypeBank
			.values()
			.map(i => i.type)
			.join(', ')}.`;
	}

	const ownedBank = new MaterialBank(user.materials_owned as IMaterialBank);
	const cost = inventingCost(invention);

	if (invention.itemCost && !klasaUser.owns(invention.itemCost)) {
		return `You don't own the items needed to create this invention, you need: ${invention.itemCost}.`;
	}
	if (!ownedBank.has(cost)) {
		return `You don't have enough materials to invent this item, it costs: ${cost}.`;
	}

	await transactMaterialsFromUser({
		userID: BigInt(user.id),
		remove: cost,
		addToGlobalInventionCostBank: true
	});

	if (invention.itemCost) {
		await klasaUser.removeItemsFromBank(invention.itemCost);
	}
	const loot = new Bank().add(invention.item.id);
	await klasaUser.addItemsToBank({ items: loot, collectionLog: true });
	return `${userMention(user.id)}, your minion created a ${invention.name}! (${
		invention.description
	}) Items removed: ${invention.itemCost ?? 'None'}. Materials used: ${cost}.`;
}

type InventionItemBoostResult =
	| {
			success: true;
			materialCost: MaterialBank;
			messages: string;
	  }
	| {
			success: false;
	  };

export async function canAffordInventionBoost(
	userID: bigint | string | User,
	inventionID: InventionID,
	duration: number
) {
	const mUser =
		typeof userID == 'bigint' || typeof userID === 'string' ? await mahojiUsersSettingsFetch(userID) : userID;
	const invention = Inventions.find(i => i.id === inventionID)!;
	if (invention.usageCostMultiplier === null) {
		throw new Error('Tried to calculate cost of invention that has no cost.');
	}
	const materialsOwned = new MaterialBank(mUser.materials_owned as IMaterialBank);
	const materialCost = new MaterialBank();
	let multiplier = Math.ceil(duration / (Time.Minute * 3));
	multiplier = clamp(Math.floor(multiplier * invention.usageCostMultiplier), 1, 1000);
	materialCost.add(invention.materialTypeBank.clone().multiply(multiplier));
	for (const [mat, boosts] of materialBoosts) {
		if (!materialCost.has(mat)) continue;
		if (boosts.reduceCostToPercent) {
			materialCost.bank[mat] = Math.ceil(
				reduceNumByPercent(materialCost.amount(mat), 100 - boosts.reduceCostToPercent)
			);
		}
	}
	materialCost.validate();

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
	userID: string | bigint | User;
	inventionID: InventionID;
	duration: number;
}): Promise<InventionItemBoostResult> {
	const { materialCost, canAfford, mUser, invention } = await canAffordInventionBoost(userID, inventionID, duration);

	// If it has to be equipped, and isn't, or has to be in bank, and isn't, fail.
	if (
		mUser.disabled_inventions.includes(invention.id) ||
		(invention.flags.includes('equipped') && !userHasItemsEquippedAnywhere(mUser, invention.item.id)) ||
		(invention.flags.includes('bank') && !hasItemsEquippedOrInBank(mUser, [invention.item.id]))
	) {
		return { success: false };
	}

	if (!canAfford) {
		return {
			success: false
		};
	}

	let messages: string[] = [`Removed ${materialCost}`];
	if (userHasItemsEquippedAnywhere(mUser, 'Invention master cape')) {
		materialCost.mutReduceAllValuesByPercent(inventionBoosts.inventionMasterCape.materialCostReductionPercent);
		messages.push(
			`${inventionBoosts.inventionMasterCape.materialCostReductionPercent}% less materials for mastery`
		);
	}

	try {
		await transactMaterialsFromUser({
			userID: BigInt(mUser.id),
			remove: materialCost,
			addToGlobalInventionCostBank: true
		});
		return { success: true, materialCost, messages: messages.join(', ') };
	} catch (err) {
		logError(err, { user_id: mUser.id });
		return { success: false };
	}
}
