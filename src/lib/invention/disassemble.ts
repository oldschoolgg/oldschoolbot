import type { CommandResponse } from '@oldschoolgg/toolkit';
import { Time, calcWhatPercent, clamp, percentChance, reduceNumByPercent, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import {
	type DisassembleFlag,
	type DisassemblyItem,
	type DisassemblySourceGroup,
	type MaterialType,
	allItemsThatCanBeDisassembledIDs
} from '.';
import Skillcapes from '../skilling/skillcapes';
import { SkillsEnum } from '../skilling/types';
import type { DisassembleTaskOptions } from '../types/minions';
import { calcPerHour, formatDuration, makeTable, toKMB } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import { getItem } from '../util/getOSItem';
import { minionIsBusy } from '../util/minionIsBusy';
import { MaterialBank } from './MaterialBank';
import MaterialLootTable from './MaterialLootTable';
import { DisassemblyGroupMap, DisassemblySourceGroups } from './groups';
import { InventionID, inventionBoosts, inventionItemBoost, materialBoosts } from './inventions';

const MASTER_CAPE_JUNK_REDUCTION = 5;

const masterCapeBoosts: Record<SkillsEnum, DisassemblySourceGroup[]> = {
	smithing: [DisassemblyGroupMap.Metals],
	mining: [DisassemblyGroupMap.Ores],

	woodcutting: [DisassemblyGroupMap.Logs],
	firemaking: [DisassemblyGroupMap.Ashes],

	herblore: [DisassemblyGroupMap.Potion],
	farming: [DisassemblyGroupMap.Organic],

	cooking: [DisassemblyGroupMap.Food],
	fishing: [DisassemblyGroupMap.RawFood],

	construction: [DisassemblyGroupMap.Planks],
	fletching: [DisassemblyGroupMap.Bows, DisassemblyGroupMap.UnstrungBows],
	crafting: [DisassemblyGroupMap.Jewellery],
	runecraft: [DisassemblyGroupMap.Talisman, DisassemblyGroupMap.Runes],

	// Combat
	ranged: [DisassemblyGroupMap.Projectiles],
	attack: [DisassemblyGroupMap.Sword, DisassemblyGroupMap.Longsword],
	strength: [DisassemblyGroupMap.BluntWeapons, DisassemblyGroupMap.Mace],
	defence: [DisassemblyGroupMap.Shield, DisassemblyGroupMap.Defender],
	magic: [DisassemblyGroupMap.Magic],
	prayer: [DisassemblyGroupMap.Bones],
	thieving: [],
	dungeoneering: [],
	agility: [],
	slayer: [],
	hitpoints: [],
	invention: [],
	hunter: [],
	divination: []
};

function doesHaveMasterCapeBoost(
	user: MUser,
	group: DisassemblySourceGroup
): { has: false } | { has: true; cape: string } {
	for (const [skill, groups] of Object.entries(masterCapeBoosts)) {
		const skillCape = Skillcapes.find(i => i.skill === skill);
		if (!skillCape) continue;
		if (!groups.includes(group)) continue;
		const has = user.hasEquippedOrInBank([skillCape.masterCape.name]);
		return has
			? {
					has: true,
					cape: skillCape.masterCape.name
				}
			: { has: false };
	}
	return { has: false };
}

export const dissasemblyWeighting = {
	min: 1,
	max: 99
};

const { floor } = Math;

export function calcJunkChance(lvl: number, hasMasterCape: boolean) {
	let base = 100 - calcWhatPercent(lvl, dissasemblyWeighting.max);
	if (hasMasterCape) base -= MASTER_CAPE_JUNK_REDUCTION;
	return clamp(base, 2, 100);
}
export function calculateDisXP(group: DisassemblySourceGroup, inventionLevel: number, quantity: number, lvl: number) {
	const baseXPPerItem = 2 + floor(lvl / 11) + floor(inventionLevel / 5) + (lvl - lvl / 1.2) * (lvl / 7.5);
	let xp = Math.ceil(quantity * baseXPPerItem);
	if (group.xpReductionDivisor) xp /= group.xpReductionDivisor;
	return {
		xp
	};
}

type DisassemblyResult =
	| {
			xp: number;
			materials: MaterialBank;
			junkChance: number;
			xpHr: string;
			quantity: number;
			duration: number;
			cost: Bank;
			messages: string[];
			error: null;
	  }
	| {
			error: string;
	  };

export function findDisassemblyGroup(item: Item) {
	for (const group of DisassemblySourceGroups) {
		const matchingItem = group.items.find(i =>
			Array.isArray(i.item) ? i.item.includes(item) : i.item.name === item.name
		);
		if (matchingItem) {
			return {
				group,
				data: matchingItem
			};
		}
	}
	return null;
}

const flagToMaterialMap: [DisassembleFlag, MaterialType][] = [
	['corporeal', 'corporeal'],
	['third_age', 'third-age'],
	['barrows', 'barrows'],
	['treasure_trails', 'treasured'],
	['mystery_box', 'mysterious'],
	['abyssal', 'abyssal'],
	['orikalkum', 'orikalkum'],
	['justiciar', 'justiciar']
];

function flagEffectsInDisassembly(item: DisassemblyItem, loot: MaterialBank) {
	const tertiaryChance = item.lvl;
	const success = percentChance(tertiaryChance);
	if (!success) return;
	for (const [flag, mat] of flagToMaterialMap) {
		if (item.flags?.has(flag)) {
			loot.add(mat);
		}
	}
}

export async function handleDisassembly({
	user,
	inputQuantity,
	item
}: {
	user: MUser;
	inputQuantity?: number;
	item: Item;
}): Promise<DisassemblyResult> {
	const _group = findDisassemblyGroup(item);
	if (!_group) throw new Error(`No data for ${item.name}`);
	const { data, group } = _group;
	const skills = user.skillsAsLevels;

	if (skills.invention < data.lvl) {
		return {
			error: `You need ${data.lvl} Invention to disassemble ${item.name}. Your Invention level is ${skills.invention}.`
		};
	}

	const materialLoot = new MaterialBank();
	const table = new MaterialLootTable(group.parts);

	const bank = user.bank.freeze();

	// The time it takes to disassemble 1 of this item.
	let timePer = Time.Second * 0.33;
	const maxTripLength = calcMaxTripLength(user, 'Disassembling');

	const messages: string[] = [];
	if (bank.has('Dwarven toolkit')) {
		const boostedActionTime = reduceNumByPercent(timePer, inventionBoosts.dwarvenToolkit.disassembleBoostPercent);
		const boostRes = await inventionItemBoost({
			user,
			inventionID: InventionID.DwarvenToolkit,
			duration: Math.min(
				maxTripLength,
				Math.min(bank.amount(item.id), inputQuantity ?? Math.floor(maxTripLength / boostedActionTime)) *
					boostedActionTime
			)
		});
		if (boostRes.success) {
			timePer = boostedActionTime;
			messages.push(
				`${inventionBoosts.dwarvenToolkit.disassembleBoostPercent}% faster disassembly from Dwarven toolkit (${boostRes.messages})`
			);
		}
	}
	if (user.hasEquippedOrInBank('Invention master cape')) {
		timePer = reduceNumByPercent(timePer, inventionBoosts.inventionMasterCape.disassemblySpeedBoostPercent);
		messages.push(
			`${inventionBoosts.inventionMasterCape.disassemblySpeedBoostPercent}% faster disassembly for mastery`
		);
	}

	if (user.owns('Inventors tools')) {
		const reduction = 30;
		timePer = reduceNumByPercent(timePer, reduction);
		messages.push(`${reduction}% faster disassembly for inventors tools`);
	}

	// The max amount of items they can disassemble this trip
	const maxCanDo = floor(maxTripLength / timePer);

	// The actual quantity they'll disassemble.
	const realQuantity = clamp(inputQuantity ?? bank.amount(item.id), 1, maxCanDo);
	const duration = realQuantity * timePer;

	const masterCapeBoost = doesHaveMasterCapeBoost(user, _group.group);
	if (masterCapeBoost?.has) {
		messages.push(`${MASTER_CAPE_JUNK_REDUCTION}% junk chance reduction for ${masterCapeBoost.cape}`);
	}
	const junkChance = calcJunkChance(data.lvl, masterCapeBoost ? masterCapeBoost.has : false);

	for (let i = 0; i < realQuantity; i++) {
		if (percentChance(junkChance)) {
			materialLoot.add('junk');
		} else {
			materialLoot.add(table.roll(), data.outputMultiplier ?? 1);
			// Modify the loot based off the flags the items have.
			if (data.flags) flagEffectsInDisassembly(data, materialLoot);
		}
	}

	for (const [mat, boosts] of materialBoosts.entries()) {
		if (!materialLoot.has(mat)) continue;
		if (boosts.outputMulitplier) {
			materialLoot.bank[mat]! *= boosts.outputMulitplier;
		}
	}

	const { xp } = calculateDisXP(group, skills.invention, realQuantity, data.lvl);

	const cost = new Bank().add(item.name, realQuantity);

	return {
		xp,
		materials: materialLoot,
		junkChance,
		xpHr: toKMB(calcPerHour(xp, duration)),
		quantity: realQuantity,
		duration,
		cost,
		error: null,
		messages
	};
}

async function materialAnalysis(user: MUser, bank: Bank) {
	let materialAnalysis = '';
	let totalXP = 0;
	let totalDur = 0;
	const totalCost = new Bank();
	const totalMats = new MaterialBank();

	const start = Date.now();
	for (const [item, qty] of bank.items()) {
		if (!allItemsThatCanBeDisassembledIDs.has(item.id)) continue;
		let thisXP = 0;
		let thisDur = 0;
		const thisCost = new Bank();
		const thisMats = new MaterialBank();

		while (bank.amount(item.id) > 0) {
			const res = await handleDisassembly({ user, inputQuantity: qty, item });
			if (res.error === null) {
				thisXP += res.xp;
				thisDur += res.duration;
				thisCost.add(res.cost);
				thisMats.add(res.materials);
				bank.remove(res.cost);
			} else {
				break;
			}
		}
		materialAnalysis += `${item.name}\t${toKMB(thisXP)}\t${formatDuration(thisDur)}\t${thisMats}\t${thisCost}\n`;
		totalXP += thisXP;
		totalDur += thisDur;
		totalCost.add(thisCost);
		totalMats.add(thisMats);
		if (Date.now() - start > Time.Second * 10) {
			materialAnalysis = `STOPPED EARLY BECAUSE YOU HAVE SO MANY ITEMS!\n${materialAnalysis}`;
			break;
		}
	}

	materialAnalysis += `\n\n\n
Total\t${toKMB(totalXP)}\t${formatDuration(totalDur)}\t${totalMats}\t${totalCost}`;
	return materialAnalysis;
}

export async function bankDisassembleAnalysis({ bank, user }: { bank: Bank; user: MUser }): CommandResponse {
	let totalXP = 0;
	const totalMaterials = new MaterialBank();
	const results: ({ item: Item } & DisassemblyResult)[] = [];
	const cantBeDisassembled = [];
	for (const [item, qty] of bank.items()) {
		const group = findDisassemblyGroup(item);
		if (!group) {
			cantBeDisassembled.push(item);
			continue;
		}
		const result = await handleDisassembly({
			user,
			inputQuantity: qty,
			item
		});
		if (result.error !== null) return result.error;
		const { xp } = calculateDisXP(group.group, user.skillsAsLevels.invention, qty, group.data.lvl);
		totalXP += xp;
		totalMaterials.add(result.materials);
		results.push({ ...result, item });
	}
	// @ts-ignore ignore
	results.sort((a, b) => b.xp - a.xp);
	const normalTable = makeTable(
		['Item', 'XP', 'Time'],
		results.map(r => (r.error === null ? [r.item.name, r.xp, formatDuration(r.duration)] : []))
	);

	return {
		content: `
**Total XP:** ${totalXP}
**Items in your bank that can't be disassembled:** ${cantBeDisassembled
			.map(i => i.name)
			.join(', ')
			.slice(0, 1500)}`,
		files: [
			{ name: 'disassemble-analysis.txt', attachment: Buffer.from(normalTable) },
			{ name: 'material-analysis.txt', attachment: Buffer.from(await materialAnalysis(user, bank)) }
		]
	};
}

export async function disassembleCommand({
	user,
	itemToDisassembleName,
	quantityToDisassemble,
	channelID
}: {
	user: MUser;
	itemToDisassembleName: string;
	quantityToDisassemble: number | undefined;
	channelID: string;
}): CommandResponse {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	const item = getItem(itemToDisassembleName);
	if (!item) return "That's not a valid item.";
	const group = findDisassemblyGroup(item);
	if (!group) return 'This item cannot be disassembled.';
	const result = await handleDisassembly({
		user,
		inputQuantity: quantityToDisassemble,
		item
	});
	if (result.error !== null) return result.error;

	if (!user.owns(result.cost)) {
		return `You don't own ${result.cost}.`;
	}
	await user.removeItemsFromBank(result.cost);

	await addSubTaskToActivityTask<DisassembleTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: result.duration,
		type: 'Disassembling',
		i: item.id,
		qty: result.quantity,
		mats: result.materials.bank,
		xp: result.xp
	});

	return `${user.minionName} is now disassembling ${result.quantity}x ${
		item.name
	}, the trip will take approximately ${formatDuration(result.duration)}
**Junk Chance:** ${result.junkChance.toFixed(2)}%
${result.messages.length > 0 ? `**Messages:** ${result.messages.join(', ')}` : ''}`;
}

export function calcWholeDisXP(user: MUser, item: Item, quantity: number) {
	const group = findDisassemblyGroup(item);
	const inventionLevel = user.skillLevel(SkillsEnum.Invention);
	if (group && inventionLevel >= group.data.lvl) {
		return calculateDisXP(group.group, inventionLevel, quantity, group.data.lvl).xp;
	}
	return null;
}

const duplicateItems = [];
const foundItems: number[] = [];
for (const group of DisassemblySourceGroups) {
	for (const itm of group.items) {
		const items: Item[] = Array.isArray(itm.item) ? itm.item : [itm.item];
		if (items.some(i => foundItems.includes(i.id))) {
			duplicateItems.push(items.map(i => ({ name: i.name, group: i.name })));
		} else {
			foundItems.push(...items.map(i => i.id));
		}
	}
}
if (duplicateItems.length > 0)
	console.warn(`Found duplicate items ${uniqueArr(duplicateItems.flat().map(i => i.name))}`);
