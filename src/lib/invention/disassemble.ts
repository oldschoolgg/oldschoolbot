import { userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { calcWhatPercent, percentChance, reduceNumByPercent, roll, Time, uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { table } from 'table';

import {
	clientSettingsUpdate,
	getSkillsOfMahojiUser,
	mahojiClientSettingsFetch,
	mahojiUsersSettingsFetch
} from '../../mahoji/mahojiSettings';
import { SkillsEnum } from '../skilling/types';
import { ItemBank } from '../types';
import { ActivityTaskOptions } from '../types/minions';
import { calcPerHour, clamp, formatDuration, toKMB } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import getOSItem, { getItem } from '../util/getOSItem';
import { handleTripFinish } from '../util/handleTripFinish';
import { minionName, userHasItemsEquippedAnywhere } from '../util/minionUtils';
import {
	DisassembleFlag,
	DisassemblyItem,
	DisassemblySourceGroup,
	DisassemblySourceGroups,
	IMaterialBank,
	MaterialType
} from '.';
import {
	inventionBoosts,
	InventionID,
	inventionItemBoost,
	materialBoosts,
	transactMaterialsFromUser
} from './inventions';
import { MaterialBank } from './MaterialBank';
import MaterialLootTable from './MaterialLootTable';

/**
 * The XP you get for disassembly is calculated based on the item and quantity.
 *
 * To prevent the issue of users training Invention entirely through just, for example, a 100m stack of Pure essence,
 * you receive less XP from certain *items* based on how many of those you have already disassembled.
 *
 */
function calculateDisXP(quantity: number, item: DisassemblySourceGroup['items'][number]) {
	let baseXPPerItem = 10 + item.lvl * (item.lvl / 200);

	return {
		xp: Math.ceil(quantity * baseXPPerItem)
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
	['abyssal', 'abyssal']
];

function flagEffectsInDisassembly(item: DisassemblyItem, loot: MaterialBank) {
	const tertiaryChance = item.lvl;
	let success = roll(tertiaryChance);
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

	let messages: string[] = [];
	if (bank.has('Dwarven toolkit')) {
		const boostRes = await inventionItemBoost({
			userID: user.id,
			inventionID: InventionID.DwarvenToolkit,
			duration: (inputQuantity ?? bank.amount(item.id)) * timePer
		});
		if (boostRes.success) {
			timePer = reduceNumByPercent(timePer, inventionBoosts.dwarvenToolkit.disassembleBoostPercent);
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
	const maxCanDo = Math.floor(calcMaxTripLength(user) / timePer);

	// The actual quantity they'll disassemble.
	const realQuantity = clamp(inputQuantity ?? bank.amount(item.id), 1, maxCanDo);
	const duration = realQuantity * timePer;

	// An item with lvl 1 has a ~99% chance of becoming junk.
	// Cannot be lower than 5% junk chance
	const junkChance = Math.max(5, 100 - calcWhatPercent(data.lvl, 120));

	for (let i = 0; i < realQuantity; i++) {
		if (percentChance(junkChance)) {
			materialLoot.add('junk');
		} else {
			materialLoot.add(table.roll(), data.partQuantity);
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

	const { xp } = calculateDisXP(realQuantity, data);

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
		const { xp } = calculateDisXP(qty, group.data);
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
		attachments: [{ fileName: 'disassemble-analysis.txt', buffer: Buffer.from(normalTable) }]
	};
}

export interface DisassembleTaskOptions extends ActivityTaskOptions {
	item: number;
	quantity: number;
	materials: IMaterialBank;
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
		item: item.id,
		quantity: result.quantity,
		materials: result.materials.bank,
		xp: result.xp
	});

	return `${klasaUser}, ${klasaUser.minionName} is now disassembling ${result.quantity}x ${
		item.name
	}, the trip will take approximately ${formatDuration(result.duration)}
**Junk Chance:** ${result.junkChance.toFixed(2)}%
${result.messages.length > 0 ? `**Messages:** ${result.messages.join(', ')}` : ''}`;
}

export async function disassemblyTask(data: DisassembleTaskOptions) {
	const { userID, quantity } = data;
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);
	const item = getOSItem(data.item);

	const messages: string[] = [];
	const cost = new Bank().add(item.id, quantity);
	const materialLoot = new MaterialBank(data.materials);
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
	await clientSettingsUpdate({
		items_disassembled_cost: new Bank(items_disassembled_cost as ItemBank).add(cost).bank
	});

	const xpStr = await klasaUser.addXP({
		skillName: SkillsEnum.Invention,
		amount: data.xp,
		duration: data.duration,
		multiplier: false
	});

	let str = `${userMention(data.userID)}, ${minionName(
		mahojiUser
	)} finished disassembling ${cost}. You received these materials: ${materialLoot}.
${xpStr}`;

	const loot = new Bank();
	const minutes = Math.floor(data.duration / Time.Minute);
	const cogsworthChancePerHour = 250;
	const chancePerMinute = cogsworthChancePerHour * 60;
	for (let i = 0; i < minutes; i++) {
		if (roll(chancePerMinute)) {
			loot.add('Cogsworth');
		}
	}
	if (loot.has('Cogsworth')) {
		messages.push(
			`**While disassembling some items, your minion suddenly was inspired to create a mechanical pet out of some scraps! Received ${loot}.`
		);
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
					quantity
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
