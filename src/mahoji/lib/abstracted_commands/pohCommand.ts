import { stringMatches } from '@oldschoolgg/toolkit';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { GroupedPohObjects, PoHObjects, getPOHObject, itemsNotRefundable } from '../../../lib/poh';
import { pohImageGenerator } from '../../../lib/pohImage';

import { SkillsEnum } from '../../../lib/skilling/types';
import { formatSkillRequirements, itemNameFromID } from '../../../lib/util';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';

export const pohWallkits = [
	{
		bitfield: null,
		name: 'Default',
		imageID: 1
	}
];

export async function getPOH(userID: string) {
	let poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: userID } });
	if (poh === null) poh = await prisma.playerOwnedHouse.create({ data: { user_id: userID } });
	return poh;
}
export async function makePOHImage(user: MUser, showSpaces = false) {
	const poh = await getPOH(user.id);
	const buffer = await pohImageGenerator.run(poh, showSpaces);
	return { files: [{ attachment: buffer, name: 'image.jpg' }] };
}

export async function pohBuildCommand(interaction: ChatInputCommandInteraction, user: MUser, name: string) {
	const poh = await getPOH(user.id);

	if (!name) {
		return makePOHImage(user, true);
	}

	const obj = PoHObjects.find(i => stringMatches(i.name, name));
	if (!obj) {
		return "That's not a valid thing to build in your PoH.";
	}

	const level = user.skillLevel(SkillsEnum.Construction);
	if (typeof obj.level === 'number') {
		if (level < obj.level) {
			return `You need level ${obj.level} Construction to build a ${obj.name} in your house.`;
		}
	} else if (!user.hasSkillReqs(obj.level)) {
		return `You need level ${formatSkillRequirements(obj.level)} to build a ${obj.name} in your house.`;
	}

	const inPlace = poh[obj.slot];
	if (obj.slot === 'mounted_item' && inPlace !== null) {
		return 'You already have a item mount built.';
	}

	if (obj.requiredInPlace && inPlace !== obj.requiredInPlace) {
		return `Building a ${obj.name} requires you have a ${
			getPOHObject(obj.requiredInPlace).name
		} built there first.`;
	}

	if (obj.itemCost) {
		if (!user.bankWithGP.has(obj.itemCost.bank)) {
			return `You don't have enough items to build a ${obj.name}, you need ${obj.itemCost}.`;
		}
		let str = `${user}, please confirm that you want to build a ${obj.name} using ${obj.itemCost}.`;
		if (inPlace !== null) {
			str += ` You will lose the ${getPOHObject(inPlace).name} that you currently have there.`;
		}
		await handleMahojiConfirmation(interaction, str);
		await user.removeItemsFromBank(obj.itemCost);
	}

	let refunded: Bank | null = null;
	if (inPlace !== null) {
		const inPlaceObj = getPOHObject(inPlace);
		if (inPlaceObj.refundItems && inPlaceObj.itemCost) {
			const itemsToRefund = new Bank(inPlaceObj.itemCost.bank).remove(itemsNotRefundable);
			if (itemsToRefund.length > 0) {
				refunded = itemsToRefund;
				await user.addItemsToBank({ items: itemsToRefund, collectionLog: false });
			}
		}
	}

	await prisma.playerOwnedHouse.update({
		where: {
			user_id: user.id
		},
		data: {
			[obj.slot]: obj.id
		}
	});

	let str = `You built a ${obj.name} in your house, using ${obj.itemCost}.`;
	if (refunded !== null && inPlace) {
		str += ` You were refunded: ${refunded}, from the ${getPOHObject(inPlace).name} you already had built here.`;
	}

	return {
		...(await makePOHImage(user)),
		content: str
	};
}

export async function pohMountItemCommand(user: MUser, name: string) {
	const poh = await getPOH(user.id);
	if (!name) {
		return makePOHImage(user);
	}

	if (poh.mounted_item === null) {
		return 'You need to build a mount for the item first.';
	}

	const item = getOSItem(name);
	if (['Magic stone', 'Coins'].includes(item.name)) {
		return "You can't mount this item.";
	}

	const currItem = poh.mounted_item === 1112 ? null : poh.mounted_item;

	const userBank = user.bank;
	const costBank = new Bank().add(item.id);
	if (poh.mounted_item !== 1112) costBank.add('Magic stone', 2);
	if (!userBank.has(costBank)) {
		const missingBank = costBank.remove(userBank);
		return `You don't have all the required materials: ${costBank}\n\nYou're missing ${missingBank}`;
	}

	const refundBank = currItem ? new Bank().add(currItem) : undefined;
	await user.transactItems({ itemsToRemove: costBank, itemsToAdd: refundBank });

	await prisma.playerOwnedHouse.update({
		where: {
			user_id: user.id
		},
		data: {
			mounted_item: item.id
		}
	});

	return {
		...(await makePOHImage(user)),
		content: `You mounted a ${item.name} in your house, using 2x Magic stone and 1x ${
			item.name
		} (given back when another item is mounted).${currItem ? ` Refunded 1x ${itemNameFromID(currItem)}.` : ''}`
	};
}

export async function pohDestroyCommand(user: MUser, name: string) {
	const obj = PoHObjects.find(i => stringMatches(i.name, name));
	if (!obj) {
		return "That's not a valid thing to build in your PoH.";
	}

	const poh = await getPOH(user.id);

	const inPlace = poh[obj.slot];
	if (obj.slot === 'mounted_item' && ![1111, 1112, null].includes(inPlace)) {
		await prisma.playerOwnedHouse.update({
			where: {
				user_id: user.id
			},
			data: {
				[obj.slot]: null
			}
		});
		const loot = new Bank().add(inPlace!);
		await user.addItemsToBank({ items: loot, collectionLog: false });
		return {
			...(await makePOHImage(user)),
			content: `You removed a ${obj.name} from your house, and were refunded ${loot}.`
		};
	}
	if (inPlace !== obj.id) {
		return `You don't have a ${obj.name} built in your house.`;
	}

	let str = `You removed a ${obj.name} from your house.`;
	if (obj.refundItems && obj.itemCost) {
		const itemsToRefund = new Bank(obj.itemCost.bank).remove(itemsNotRefundable);
		if (itemsToRefund.length > 0) {
			str += `\n\nYou were refunded: ${itemsToRefund}.`;
			await user.addItemsToBank({ items: itemsToRefund, collectionLog: false });
		}
	}

	await prisma.playerOwnedHouse.update({
		where: {
			user_id: user.id
		},
		data: {
			[obj.slot]: null
		}
	});

	return { ...(await makePOHImage(user)), content: str };
}

export async function pohListItemsCommand() {
	const textStr = [];

	for (const [key, arr] of Object.entries(GroupedPohObjects)) {
		textStr.push(`${key}: ${arr.map(i => i.name).join(', ')}`);
	}

	const attachment = Buffer.from(textStr.join('\n'));

	return {
		content: 'Here are all the items you can build in your PoH.',

		files: [{ attachment, name: 'Buildables.txt' }]
	};
}
