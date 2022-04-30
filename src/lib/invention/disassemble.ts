import { User } from '@prisma/client';
import { calcWhatPercent, percentChance, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { table } from 'table';

import { getSkillsOfMahojiUser } from '../../mahoji/mahojiSettings';
import { ItemBank } from '../types';
import { calcPerHour, clamp, formatDuration, toKMB } from '../util';
import { calcMaxTripLength } from '../util/minionUtils';
import { DisassemblySourceGroup, DisassemblySourceGroups, IMaterialBank } from '.';
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
	// const prismaUser = await prisma.user.findFirst({
	// 	where: {
	// 		id: user.id
	// 	},
	// 	select: {
	// 		disassembled_items_bank: true,
	// 		materials_owned: true,
	// 		materials_total: true
	// 	}
	// });
	// if (!prismaUser) throw new Error("This isn't possible. Trust me.");
	// const disassembledItemsBank = new Bank(prismaUser.disassembled_items_bank as ItemBank);

	// const amountAlreadyDisassembled = disassembledItemsBank.amount(item.item.id);
	// if (amountAlreadyDisassembled > 0) {
	// 	// do something here
	// }

	let baseXPPerItem = item.lvl / 4.5;

	return {
		xp: Math.floor(quantity * baseXPPerItem)
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

export function handleDisassembly({
	user,
	inputQuantity,
	item
}: {
	user: User;
	inputQuantity?: number;
	item: Item;
}): DisassemblyResult {
	const _group = findDisassemblyGroup(item);
	if (!_group) throw new Error(`No data for ${item.name}`);
	const { data, group } = _group;
	const skills = getSkillsOfMahojiUser(user, true);
	console.log(skills.invention);

	if (skills.invention < data.lvl) {
		return {
			error: `You need ${data.lvl} Invention to disassemble ${item.name}. Your Invention level is ${skills.invention}.`
		};
	}

	const materialLoot = new MaterialBank();
	const table = new MaterialLootTable(group.parts);

	const junkChance = 100 - calcWhatPercent(data.lvl, 120);

	const specialBank: IMaterialBank = {};
	if (data.special) {
		for (let part of data.special.parts) {
			specialBank[part.type] = part.chance;
		}
	}
	const specialTable = new MaterialLootTable(specialBank);

	const bank = new Bank(user.bank as ItemBank);

	// The time it takes to disassemble 1 of this item.
	const timePer = Time.Second * 0.33;

	// The max amount of items they can disassemble this trip
	const maxCanDo = Math.floor(calcMaxTripLength(user) / timePer);

	// The actual quantity they'll disassemble.
	const realQuantity = clamp(inputQuantity ?? bank.amount(item.id), 1, maxCanDo);

	const duration = realQuantity * timePer;

	for (let i = 0; i < realQuantity; i++) {
		let junk = false;
		if (percentChance(junkChance)) {
			materialLoot.add('junk');
			junk = true;
		} else {
			materialLoot.add(table.roll(), data.partQuantity);
		}
		if (data.special) {
			if (data.special.always || !junk) {
				const specialResult = specialTable.roll();
				const specialItem = data.special.parts.find(item => item.type === specialResult);
				materialLoot.add(specialResult, specialItem!.amount);
			}
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
		error: null
	};
}

export async function bankDisassembleAnalysis({ bank, user }: { bank: Bank; user: User }): CommandResponse {
	let totalXP = 0;
	let totalMaterials = new MaterialBank();
	let totalTime = 0;
	const results: ({ item: Item } & DisassemblyResult)[] = [];
	for (const [item, qty] of bank.items()) {
		if (!findDisassemblyGroup(item)) continue;
		const result = handleDisassembly({
			user,
			inputQuantity: qty,
			item
		});
		if (result.error !== null) return result.error;
		totalXP += result.xp;
		totalMaterials.add(result.materials);
		totalTime += result.duration;
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
**Total Time:** ${formatDuration(totalTime)}`,
		attachments: [{ fileName: 'disassemble-analysis.txt', buffer: Buffer.from(normalTable) }]
	};
}
