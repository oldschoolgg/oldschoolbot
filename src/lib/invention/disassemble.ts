import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { calcWhatPercent, percentChance, reduceNumByPercent, roll, Time, uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { table } from 'table';

import {
	mahojiClientSettingsFetch,
	mahojiClientSettingsUpdate,
	mahojiUsersSettingsFetch
} from '../../mahoji/mahojiSettings';
import { Emoji } from '../constants';
import Skillcapes from '../skilling/skillcapes';
import { SkillsEnum } from '../skilling/types';
import { ItemBank } from '../types';
import { ActivityTaskOptions } from '../types/minions';
import { calcPerHour, clamp, formatDuration, getSkillsOfMahojiUser, itemID, toKMB } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import getOSItem, { getItem } from '../util/getOSItem';
import { handleTripFinish } from '../util/handleTripFinish';
import { minionIsBusy } from '../util/minionIsBusy';
import { hasItemsEquippedOrInBank, minionName, userHasItemsEquippedAnywhere } from '../util/minionUtils';
import {
	allItemsThatCanBeDisassembledIDs,
	DisassembleFlag,
	DisassemblyItem,
	DisassemblySourceGroup,
	IMaterialBank,
	MaterialType
} from '.';
import { DisassemblyGroupMap, DisassemblySourceGroups } from './groups';
import {
	inventionBoosts,
	InventionID,
	inventionItemBoost,
	materialBoosts,
	transactMaterialsFromUser
} from './inventions';
import { MaterialBank } from './MaterialBank';
import MaterialLootTable from './MaterialLootTable';

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
	hunter: []
};

function doesHaveMasterCapeBoost(
	user: User,
	group: DisassemblySourceGroup
): { has: false } | { has: true; cape: string } {
	for (const [skill, groups] of Object.entries(masterCapeBoosts)) {
		const skillCape = Skillcapes.find(i => i.skill === skill);
		if (!skillCape) continue;
		if (!groups.includes(group)) continue;
		const has = hasItemsEquippedOrInBank(user, [skillCape.masterCape.name]);
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
	let baseXPPerItem = 2 + floor(lvl / 11) + floor(inventionLevel / 5) + (lvl - lvl / 1.2) * (lvl / 7.5);
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
	['orikalkum', 'orikalkum']
];

function flagEffectsInDisassembly(item: DisassemblyItem, loot: MaterialBank) {
	const tertiaryChance = item.lvl;
	let success = percentChance(tertiaryChance);
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
	user: User;
	inputQuantity?: number;
	item: Item;
}): Promise<DisassemblyResult> {
	const _group = findDisassemblyGroup(item);
	if (!_group) throw new Error(`No data for ${item.name}`);
	const { data, group } = _group;
	const skills = getSkillsOfMahojiUser(user, true);

	if (skills.invention < data.lvl) {
		return {
			error: `You need ${data.lvl} Invention to disassemble ${item.name}. Your Invention level is ${skills.invention}.`
		};
	}

	const materialLoot = new MaterialBank();
	const table = new MaterialLootTable(group.parts);

	const bank = new Bank(user.bank as ItemBank).freeze();

	// The time it takes to disassemble 1 of this item.
	let timePer = Time.Second * 0.33;
	const maxTripLength = calcMaxTripLength(user);

	let messages: string[] = [];
	if (bank.has('Dwarven toolkit')) {
		const boostedActionTime = reduceNumByPercent(timePer, inventionBoosts.dwarvenToolkit.disassembleBoostPercent);
		const boostRes = await inventionItemBoost({
			userID: user.id,
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
	if (userHasItemsEquippedAnywhere(user, 'Invention master cape')) {
		timePer = reduceNumByPercent(timePer, inventionBoosts.inventionMasterCape.disassemblySpeedBoostPercent);
		messages.push(
			`${inventionBoosts.inventionMasterCape.disassemblySpeedBoostPercent}% faster disassembly for mastery`
		);
	}

	// The max amount of items they can disassemble this trip
	const maxCanDo = floor(maxTripLength / timePer);

	// The actual quantity they'll disassemble.
	const realQuantity = clamp(inputQuantity ?? bank.amount(item.id), 1, maxCanDo);
	const duration = realQuantity * timePer;

	const masterCapeBoost = doesHaveMasterCapeBoost(user, _group.group);
	if (masterCapeBoost && masterCapeBoost.has) {
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

async function materialAnalysis(user: User, bank: Bank) {
	let materialAnalysis = '';
	let totalXP = 0;
	let totalDur = 0;
	let totalCost = new Bank();
	let totalMats = new MaterialBank();

	let start = Date.now();
	for (const [item, qty] of bank.items()) {
		if (!allItemsThatCanBeDisassembledIDs.has(item.id)) continue;
		let thisXP = 0;
		let thisDur = 0;
		let thisCost = new Bank();
		let thisMats = new MaterialBank();

		while (bank.amount(item.id) > 0) {
			let res = await handleDisassembly({ user, inputQuantity: qty, item });
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

export async function bankDisassembleAnalysis({ bank, user }: { bank: Bank; user: User }): CommandResponse {
	let totalXP = 0;
	let totalMaterials = new MaterialBank();
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
		const { xp } = calculateDisXP(group.group, getSkillsOfMahojiUser(user, true).invention, qty, group.data.lvl);
		totalXP += xp;
		totalMaterials.add(result.materials);
		results.push({ ...result, item });
	}
	// @ts-ignore ignore
	results.sort((a, b) => b.xp - a.xp);
	const normalTable = table([
		['Item', 'XP', 'Time'],
		...results.map(r => (r.error === null ? [r.item.name, r.xp, formatDuration(r.duration)] : []))
	]);

	return {
		content: `
**Total XP:** ${totalXP}
**Items in your bank that can't be disassembled:** ${cantBeDisassembled
			.map(i => i.name)
			.join(', ')
			.slice(0, 1500)}`,
		attachments: [
			{ fileName: 'disassemble-analysis.txt', buffer: Buffer.from(normalTable) },
			{ fileName: 'material-analysis.txt', buffer: Buffer.from(await materialAnalysis(user, bank)) }
		]
	};
}

export interface DisassembleTaskOptions extends ActivityTaskOptions {
	i: number;
	qty: number;
	mats: IMaterialBank;
	xp: number;
}

export async function disassembleCommand({
	mahojiUser,
	klasaUser,
	itemToDisassembleName,
	quantityToDisassemble,
	channelID
}: {
	mahojiUser: User;
	klasaUser: KlasaUser;
	itemToDisassembleName: string;
	quantityToDisassemble: number | undefined;
	channelID: bigint;
}): CommandResponse {
	if (minionIsBusy(mahojiUser.id)) return 'Your minion is busy.';
	const item = getItem(itemToDisassembleName);
	if (!item) return "That's not a valid item.";
	const group = findDisassemblyGroup(item);
	if (!group) return 'This item cannot be disassembled.';
	const result = await handleDisassembly({
		user: mahojiUser,
		inputQuantity: quantityToDisassemble,
		item
	});
	if (result.error !== null) return result.error;

	if (!klasaUser.owns(result.cost)) {
		return `You don't own ${result.cost}.`;
	}
	await klasaUser.removeItemsFromBank(result.cost);

	await addSubTaskToActivityTask<DisassembleTaskOptions>({
		userID: mahojiUser.id,
		channelID: channelID.toString(),
		duration: result.duration,
		type: 'Disassembling',
		i: item.id,
		qty: result.quantity,
		mats: result.materials.bank,
		xp: result.xp
	});

	return `${klasaUser}, ${klasaUser.minionName} is now disassembling ${result.quantity}x ${
		item.name
	}, the trip will take approximately ${formatDuration(result.duration)}
**Junk Chance:** ${result.junkChance.toFixed(2)}%
${result.messages.length > 0 ? `**Messages:** ${result.messages.join(', ')}` : ''}`;
}

async function handleInventionPrize(isIron: boolean): Promise<Bank | null> {
	const remaining = (await mahojiClientSettingsFetch({ invention_prizes_remaining: true }))
		.invention_prizes_remaining as ItemBank;
	const remainingBank = new Bank(remaining);
	const toGive = remainingBank.random()?.id;
	if (isIron && toGive !== itemID('Double loot token')) return null;
	if (!toGive) return null;
	const loot = new Bank().add(toGive);
	await mahojiClientSettingsUpdate({
		invention_prizes_remaining: remainingBank.remove(loot).bank
	});
	return loot;
}

export function calcWholeDisXP(user: KlasaUser, item: Item, quantity: number) {
	const group = findDisassemblyGroup(item);
	const inventionLevel = user.skillLevel(SkillsEnum.Invention);
	if (group && inventionLevel >= group.data.lvl) {
		return calculateDisXP(group.group, inventionLevel, quantity, group?.data.lvl).xp;
	}
	return null;
}

export async function disassemblyTask(data: DisassembleTaskOptions) {
	const { userID, qty } = data;
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);
	const item = getOSItem(data.i);

	const messages: string[] = [];
	const cost = new Bank().add(item.id, qty);
	const materialLoot = new MaterialBank(data.mats);
	if (userHasItemsEquippedAnywhere(mahojiUser, 'Invention master cape')) {
		materialLoot.mutIncreaseAllValuesByPercent(inventionBoosts.inventionMasterCape.extraMaterialsPercent);
		messages.push(`${inventionBoosts.inventionMasterCape.extraMaterialsPercent}% bonus materials for mastery`);
	}

	await transactMaterialsFromUser({
		userID: BigInt(data.userID),
		add: materialLoot,
		addToDisassembledItemsBank: cost
	});

	const { items_disassembled_cost } = await mahojiClientSettingsFetch({
		items_disassembled_cost: true
	});
	await mahojiClientSettingsUpdate({
		items_disassembled_cost: new Bank(items_disassembled_cost as ItemBank).add(cost).bank
	});

	const xpStr = await klasaUser.addXP({
		skillName: SkillsEnum.Invention,
		amount: data.xp,
		duration: data.duration,
		multiplier: false,
		masterCapeBoost: true
	});

	let str = `${userMention(data.userID)}, ${minionName(
		mahojiUser
	)} finished disassembling ${cost}. You received these materials: ${materialLoot}.
${xpStr}`;

	const loot = new Bank();
	const minutes = floor(data.duration / Time.Minute);
	const cogsworthChancePerHour = 100;
	const chancePerMinute = cogsworthChancePerHour * 60;
	const prizeLoot = new Bank();
	const prizeChance = Math.floor(chancePerMinute / 40);
	for (let i = 0; i < minutes; i++) {
		if (roll(chancePerMinute)) {
			loot.add('Cogsworth');
		}
		if (roll(prizeChance)) {
			const prize = await handleInventionPrize(klasaUser.isIronman);
			if (prize) prizeLoot.add(prize);
		}
	}
	if (loot.has('Cogsworth')) {
		messages.push(
			'**While disassembling some items, your minion suddenly was inspired to create a mechanical pet out of some scraps!**'
		);
	}

	if (prizeLoot.length > 0) {
		loot.add(prizeLoot);
		messages.push(`${Emoji.Gift} You received ${prizeLoot} as a bonus!`);
	}
	if (loot.length > 0) {
		await klasaUser.addItemsToBank({ items: loot, collectionLog: true });
	}
	if (messages.length > 0) {
		str += `\n**Messages:** ${messages.join(', ')}`;
	}

	handleTripFinish(
		klasaUser,
		data.channelID,
		str,
		[
			'invention',
			{
				disassemble: {
					name: item.name,
					quantity: qty
				}
			},
			true
		],
		undefined,
		data,
		null
	);
}

const duplicateItems = [];
const foundItems: number[] = [];
for (let group of DisassemblySourceGroups) {
	for (let itm of group.items) {
		const items: Item[] = Array.isArray(itm.item) ? itm.item : [itm.item];
		if (items.some(i => foundItems.includes(i.id))) {
			duplicateItems.push(items.map(i => ({ name: i.name, group: i.name })));
		} else {
			foundItems.push(...items.map(i => i.id));
		}
	}
}
if (duplicateItems.length) console.warn(`Found duplicate items ${uniqueArr(duplicateItems.flat().map(i => i.name))}`);
