import { userMention } from '@discordjs/builders';
import { Prisma } from '@prisma/client';
import { clamp, reduceNumByPercent, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { ClueTier, ClueTiers } from '../clues/clueTiers';
import { ItemBank } from '../types';
import { formatDuration, stringMatches, toKMB } from '../util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../util/clientSettings';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';
import { minionIsBusy } from '../util/minionIsBusy';
import resolveItems from '../util/resolveItems';
import { IMaterialBank, MaterialType } from '.';
import { MaterialBank } from './MaterialBank';

const InventionFlags = ['equipped', 'bank'] as const;
type InventionFlag = (typeof InventionFlags)[number];

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
	AbyssalAmulet = 14,
	RoboFlappy = 15,
	ChinCannon = 16,
	WispBuster = 17,
	DivineHand = 18
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
			{ runes: ['Blood rune', 'Soul rune'], boost: 65 },
			{ runes: ['Blood rune (zeah)', 'Soul rune (zeah)'], boost: 95 },
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
		harvestBoostPercent: 100,
		herbiboarExtraYieldPercent: 50
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
	},
	chincannon: {
		coxPercentReduction: 60,
		tobPercentReduction: 60,
		toaPercentReduction: 60
	},
	wispBuster: {
		xpIncreasePercent: 30
	},
	divineHand: {
		memoryHarvestExtraYieldPercent: 30
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
		description: `Increases farming and herbiboar yield by ${inventionBoosts.arcaneHarvester.harvestBoostPercent}%.`,
		item: getOSItem('Arcane harvester'),
		materialTypeBank: new MaterialBank({
			organic: 5,
			magic: 5
		}),
		flags: ['bank'],
		itemCost: null,
		inventionLevelNeeded: 110,
		usageCostMultiplier: 0.75
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
	},
	{
		id: InventionID.RoboFlappy,
		name: 'RoboFlappy',
		description: 'A robotic terrorbird which provides extra loot from minigames.',
		item: getOSItem('RoboFlappy'),
		materialTypeBank: new MaterialBank({
			magic: 4,
			organic: 2,
			metallic: 4
		}),
		itemCost: null,
		flags: ['bank'],
		inventionLevelNeeded: 120,
		usageCostMultiplier: 0.5
	},
	{
		id: InventionID.ChinCannon,
		name: 'Chincannon',
		description: 'A cannon that shoots chinchompas with extra ferocity and speed.',
		item: getOSItem('Chincannon'),
		materialTypeBank: new MaterialBank({
			explosive: 10
		}),
		itemCost: null,
		flags: ['equipped'],
		inventionLevelNeeded: 100,
		usageCostMultiplier: 3
	},
	{
		id: InventionID.WispBuster,
		name: 'Wisp-buster',
		description: `A device increases the speed of memory harvesting, giving ${inventionBoosts.wispBuster.xpIncreasePercent}% more xp.`,
		item: getOSItem('Wisp-buster'),
		materialTypeBank: new MaterialBank({
			pious: 4,
			powerful: 1,
			magic: 4,
			heavy: 1
		}),
		itemCost: null,
		flags: ['equipped'],
		inventionLevelNeeded: 100,
		usageCostMultiplier: 1
	},
	{
		id: InventionID.DivineHand,
		name: 'Divine hand',
		description: `A device that enhances the harvesting of divination memories, increasing energy yield by ${inventionBoosts.divineHand.memoryHarvestExtraYieldPercent}% and harvesting clue scrolls.`,
		item: getOSItem('Divine hand'),
		materialTypeBank: new MaterialBank({
			pious: 2,
			magic: 7,
			strong: 1
		}),
		itemCost: null,
		flags: ['equipped'],
		inventionLevelNeeded: 100,
		usageCostMultiplier: 1
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
	user,
	add,
	remove,
	addToDisassembledItemsBank,
	addToResearchedMaterialsBank,
	addToGlobalInventionCostBank
}: {
	user: MUser;
	add?: MaterialBank;
	remove?: MaterialBank;
	addToDisassembledItemsBank?: Bank;
	addToResearchedMaterialsBank?: boolean;
	addToGlobalInventionCostBank?: boolean;
}) {
	const materialsOwnedBank = user.ownedMaterials();
	if (add) materialsOwnedBank.add(add);
	if (remove) materialsOwnedBank.remove(remove);

	const updateObject: Prisma.UserUpdateArgs['data'] = {
		materials_owned: materialsOwnedBank.bank
	};
	if (addToDisassembledItemsBank) {
		updateObject.disassembled_items_bank = addToDisassembledItemsBank
			.clone()
			.add(user.user.disassembled_items_bank as ItemBank).bank;
	}
	if (addToResearchedMaterialsBank && remove) {
		updateObject.researched_materials_bank = remove
			.clone()
			.add(user.user.researched_materials_bank as IMaterialBank).bank;
	}

	if (addToGlobalInventionCostBank && remove) {
		const current = await mahojiClientSettingsFetch({ invention_materials_cost: true });
		await mahojiClientSettingsUpdate({
			invention_materials_cost: new MaterialBank(current.invention_materials_cost as IMaterialBank).add(remove)
				.bank
		});
	}

	await user.update(updateObject);
}

export async function inventCommand(user: MUser, inventionName: string): CommandResponse {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	const invention = Inventions.find(i => stringMatches(i.name, inventionName));
	if (!invention) return "That's not a valid invention.";
	if (!user.user.unlocked_blueprints.includes(invention.id)) {
		return `You don't have the blueprint for this Invention unlocked, your minion doesn't know how to make it! To unlock the blueprint, you can do research with one of these materials: ${invention.materialTypeBank
			.values()
			.map(i => i.type)
			.join(', ')}.`;
	}

	const cost = inventingCost(invention);

	if (invention.itemCost && !user.owns(invention.itemCost)) {
		return `You don't own the items needed to create this invention, you need: ${invention.itemCost}.`;
	}

	const ownedBank = user.materialsOwned();
	if (!ownedBank.has(cost)) {
		return `You don't have enough materials to invent this item, it costs: ${cost}.`;
	}

	await transactMaterialsFromUser({
		user,
		remove: cost,
		addToGlobalInventionCostBank: true
	});

	if (invention.itemCost) {
		await user.removeItemsFromBank(invention.itemCost);
	}
	const loot = new Bank().add(invention.item.id);
	await user.addItemsToBank({ items: loot, collectionLog: true });
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

export function canAffordInventionBoost(user: MUser, inventionID: InventionID, duration: number) {
	const invention = Inventions.find(i => i.id === inventionID)!;
	if (invention.usageCostMultiplier === null) {
		throw new Error('Tried to calculate cost of invention that has no cost.');
	}
	const materialsOwned = user.materialsOwned();
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
		invention,
		materialsOwned,
		materialCost,
		canAfford: materialsOwned.has(materialCost)
	};
}

export async function inventionItemBoost({
	user,
	inventionID,
	duration
}: {
	user: MUser;
	inventionID: InventionID;
	duration: number;
}): Promise<InventionItemBoostResult> {
	const { materialCost, canAfford, invention } = await canAffordInventionBoost(user, inventionID, duration);

	// If it has to be equipped, and isn't, or has to be in bank, and isn't, fail.
	if (
		user.user.disabled_inventions.includes(invention.id) ||
		(invention.flags.includes('equipped') && !user.hasEquipped(invention.item.id)) ||
		(invention.flags.includes('bank') && !user.hasEquippedOrInBank([invention.item.id]))
	) {
		return { success: false };
	}

	if (!canAfford) {
		return {
			success: false
		};
	}

	let messages: string[] = [`Removed ${materialCost}`];
	if (user.hasEquipped('Invention master cape')) {
		materialCost.mutReduceAllValuesByPercent(inventionBoosts.inventionMasterCape.materialCostReductionPercent);
		messages.push(
			`${inventionBoosts.inventionMasterCape.materialCostReductionPercent}% less materials for mastery`
		);
	}

	try {
		await transactMaterialsFromUser({
			user,
			remove: materialCost,
			addToGlobalInventionCostBank: true
		});
		return { success: true, materialCost, messages: messages.join(', ') };
	} catch (err) {
		logError(err, { user_id: user.id });
		return { success: false };
	}
}

export async function userHasFlappy({
	user,
	duration
}: {
	user: MUser;
	duration: number;
}): Promise<{ userMsg: string; shouldGiveBoost: boolean }> {
	if (user.usingPet('Flappy')) {
		return { userMsg: 'You are getting 2x loot/rewards from Flappy', shouldGiveBoost: true };
	}
	if (user.hasEquippedOrInBank(['RoboFlappy'])) {
		const boostResult = await inventionItemBoost({
			user,
			inventionID: InventionID.RoboFlappy,
			duration
		});
		if (boostResult.success) {
			return {
				shouldGiveBoost: true,
				userMsg: `You are getting 2x loot/rewards from RoboFlappy (${boostResult.messages})`
			};
		}
	}
	return {
		shouldGiveBoost: false,
		userMsg: ''
	};
}

export const inventionCL = [...Inventions.map(i => i.item.id), ...resolveItems('Cogsworth')];
