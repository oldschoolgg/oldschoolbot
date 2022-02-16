import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { prisma } from '../settings/prisma';
import { DissassemblySourceGroup } from '.';
import { MaterialBank } from './MaterialBank';
import MaterialLootTable from './MaterialLootTable';

/**
 * The XP you get for disassembly is calculated based on the item and quantity.
 *
 * To prevent the issue of users training Invention entirely through just, for example, a 100m stack of Pure essence,
 * you receive less XP from certain *items* based on how many of those you have already disassembled.
 *
 */
async function calculateDisXP(user: KlasaUser, quantity: number, item: DissassemblySourceGroup['items'][number]) {
	const prismaUser = await prisma.user.findFirst({
		where: {
			id: user.id
		},
		select: {
			disassembled_items_bank: true,
			materials_owned: true,
			materials_total: true
		}
	});
	if (!prismaUser) throw new Error("This isn't possible. Trust me.");
	const disassembledItemsBank = new Bank(prismaUser.disassembled_items_bank as ItemBank);

	let baseXPPerItem = item.lvl / 100;
	const amountAlreadyDisassembled = disassembledItemsBank.amount(item.item.id);
	if (amountAlreadyDisassembled > 0) {
		// do something here
	}
	return {
		xp: quantity * baseXPPerItem
	};
}

interface DisassemblyResult {
	xp: number;
	materials: MaterialBank;
}

export async function handleDisassembly({
	user,
	quantity,
	item,
	group
}: {
	user: KlasaUser;
	quantity: number;
	item: Item;
	group: DissassemblySourceGroup;
}): Promise<DisassemblyResult> {
	const data = group.items.find(i => i.item === item);
	if (!data) throw new Error(`No data for ${item.name}`);

	const materialLoot = new MaterialBank();
	const table = new MaterialLootTable(group.parts);

	for (let i = 0; i < quantity; i++) {
		materialLoot.add(table.roll());
	}

	return {
		xp: (await calculateDisXP(user, quantity, data)).xp,
		materials: materialLoot
	};
}
