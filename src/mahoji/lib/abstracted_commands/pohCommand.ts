import { stringMatches } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { type PlayerOwnedHouse, Prisma } from '@/prisma/main.js';
import { pohImageGenerator } from '@/lib/canvas/pohImage.js';
import { BitField } from '@/lib/constants.js';
import { GroupedPohObjects, getPOHObject, itemsNotRefundable, PoHObjects } from '@/lib/poh/index.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

export const pohWallkits = [
	{
		bitfield: null,
		name: 'Default',
		imageID: 1
	},
	{
		bitfield: BitField.HasHosidiusWallkit,
		name: 'Hosidius',
		imageID: 2
	}
];

export async function getPOH(userId: string): Promise<PlayerOwnedHouse> {
	try {
		const result = await prisma.playerOwnedHouse.upsert({
			where: {
				user_id: userId
			},
			create: {
				user_id: userId
			},
			update: {}
		});
		return result;
	} catch (err) {
		// Ignore unique constraint errors, they already have a row
		if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') {
			throw err;
		}
	}

	// They definitely should have a row now
	const result = await prisma.playerOwnedHouse.findFirstOrThrow({
		where: {
			user_id: userId
		}
	});

	return result;
}
export async function makePOHImage(user: MUser, showSpaces = false): Promise<SendableFile> {
	const poh = await getPOH(user.id);
	const buffer = await pohImageGenerator.run(poh, showSpaces);
	return { buffer: buffer, name: 'image.jpg' };
}

export async function pohWallkitCommand(user: MUser, input: string): Promise<SendableMessage> {
	const poh = await getPOH(user.id);
	const currentWallkit = pohWallkits.find(i => i.imageID === poh.background_id)!;
	const selectedKit = pohWallkits.find(i => stringMatches(i.name, input));

	if (!input || !selectedKit) {
		return `Your current wallkit is the '${currentWallkit.name}' wallkit. The available wallkits are: ${pohWallkits
			.map(i => i.name)
			.join(', ')}.`;
	}

	if (currentWallkit.imageID === selectedKit.imageID) {
		return 'This is already your wallkit.';
	}

	const { bitfield } = user;
	const userBank = user.bank;
	if (selectedKit.bitfield && !bitfield.includes(BitField.HasHosidiusWallkit)) {
		if (selectedKit.imageID === 2 && userBank.has('Hosidius blueprints')) {
			await user.transactItems({
				itemsToRemove: new Bank().add('Hosidius blueprints'),
				otherUpdates: {
					bitfield: {
						push: selectedKit.bitfield
					}
				}
			});
		} else {
			return `You haven't unlocked the ${selectedKit.name} wallkit!`;
		}
	}
	await prisma.playerOwnedHouse.update({
		where: {
			user_id: user.id
		},
		data: {
			background_id: selectedKit.imageID
		}
	});
	return { files: [await makePOHImage(user)] };
}

export async function pohBuildCommand(interaction: MInteraction, user: MUser, name: string) {
	const poh = await getPOH(user.id);

	if (!name) {
		return { files: [await makePOHImage(user)] };
	}

	const obj = PoHObjects.find(i => stringMatches(i.name, name));
	if (!obj) {
		return "That's not a valid thing to build in your PoH.";
	}

	const level = user.skillsAsLevels.construction;
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
		return `Building a ${obj.name} requires you have a ${getPOHObject(obj.requiredInPlace).name
			} built there first.`;
	}

	if (obj.itemCost) {
		if (!user.bankWithGP.has(obj.itemCost)) {
			return `You don't have enough items to build a ${obj.name}, you need ${obj.itemCost}.`;
		}
		let str = `${user}, please confirm that you want to build a ${obj.name} using ${obj.itemCost}.`;
		if (inPlace !== null) {
			str += ` You will lose the ${getPOHObject(inPlace).name} that you currently have there.`;
		}
		await interaction.confirmation(str);
		await user.removeItemsFromBank(obj.itemCost);
		await ClientSettings.updateBankSetting('construction_cost_bank', obj.itemCost);
	}

	let refunded: Bank | null = null;
	if (inPlace !== null) {
		const inPlaceObj = getPOHObject(inPlace);
		if (inPlaceObj.refundItems && inPlaceObj.itemCost) {
			const itemsToRefund = new Bank(inPlaceObj.itemCost).remove(itemsNotRefundable);
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
		files: [await makePOHImage(user)],
		content: str
	};
}

export async function pohMountItemCommand(user: MUser, name: string) {
	const poh = await getPOH(user.id);
	if (!name) {
		return { files: [await makePOHImage(user)] };
	}

	if (poh.mounted_item === null) {
		return 'You need to build a mount for the item first.';
	}

	const item = Items.getOrThrow(name);
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
		files: [await makePOHImage(user)],
		content: `You mounted a ${item.name} in your house, using 2x Magic stone and 1x ${item.name
			} (given back when another item is mounted).${currItem ? ` Refunded 1x ${Items.itemNameFromId(currItem)}.` : ''}`
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
		await user.addItemsToBank({ items: new Bank().add(inPlace!, 1), collectionLog: false });
		return {
			files: [await makePOHImage(user)],
			content: `You removed a ${obj.name} from your house, and were refunded 1x ${Items.itemNameFromId(inPlace!)}.`
		};
	}
	if (inPlace !== obj.id) {
		return `You don't have a ${obj.name} built in your house.`;
	}

	let str = `You removed a ${obj.name} from your house.`;
	if (obj.refundItems && obj.itemCost) {
		const itemsToRefund = new Bank(obj.itemCost).remove(itemsNotRefundable);
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

	return { files: [await makePOHImage(user)], content: str };
}

export async function pohListItemsCommand(): Promise<SendableMessage> {
	const textStr = [];

	for (const [key, arr] of Object.entries(GroupedPohObjects)) {
		textStr.push(`${key}: ${arr.map(i => i.name).join(', ')}`);
	}

	const buffer = Buffer.from(textStr.join('\n'));

	return {
		content: 'Here are all the items you can build in your PoH.',
		files: [{ buffer, name: 'Buildables.txt' }]
	};
}
