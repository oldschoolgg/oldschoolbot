import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { BitField } from '../../../lib/constants';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { getPOHObject, itemsNotRefundable, PoHObjects } from '../../../lib/poh';
import { prisma } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { itemNameFromID, updateBankSetting } from '../../../lib/util';
import { stringMatches } from '../../../lib/util/cleanString';
import getOSItem from '../../../lib/util/getOSItem';
import PoHImage from '../../../tasks/pohImage';
import { handleMahojiConfirmation } from '../../mahojiSettings';

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

export async function getPOH(userID: string) {
	let poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: userID } });
	if (poh === null) poh = await prisma.playerOwnedHouse.create({ data: { user_id: userID } });
	return poh;
}
export async function makePOHImage(user: KlasaUser, showSpaces = false) {
	const poh = await getPOH(user.id);
	const buffer = await (globalClient.tasks.get('pohImage') as PoHImage).run(poh, showSpaces);
	return { attachments: [{ buffer, fileName: 'image.jpg' }] };
}

export async function pohWallkitCommand(user: KlasaUser, input: string) {
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

	const bitfield = user.settings.get(UserSettings.BitField);
	const userBank = user.bank();
	if (selectedKit.bitfield && !bitfield.includes(BitField.HasHosidiusWallkit)) {
		if (selectedKit.imageID === 2 && userBank.has('Hosidius blueprints')) {
			await user.removeItemsFromBank(new Bank().add('Hosidius blueprints'));
			await user.settings.update(UserSettings.BitField, selectedKit.bitfield);
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
	return makePOHImage(user);
}

export async function pohBuildCommand(interaction: SlashCommandInteraction, user: KlasaUser, name: string) {
	const poh = await getPOH(user.id);

	if (!name) {
		return makePOHImage(user, true);
	}

	const obj = PoHObjects.find(i => stringMatches(i.name, name));
	if (!obj) {
		return "That's not a valid thing to build in your PoH.";
	}

	const level = user.skillLevel(SkillsEnum.Construction);
	if (level < obj.level) {
		return `You need level ${obj.level} Construction to build a ${obj.name} in your house.`;
	}
	if (obj.id === 29_149 || obj.id === 31_858) {
		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Arceuus, 100);
		if (!hasFavour) {
			return `Build Dark Altar/Occult altar requires ${requiredPoints}% Arceuus Favour.`;
		}
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
		const userBank = user.bank().add('Coins', user.settings.get(UserSettings.GP));
		if (!userBank.has(obj.itemCost.bank)) {
			return `You don't have enough items to build a ${obj.name}, you need ${obj.itemCost}.`;
		}
		let str = `${user}, please confirm that you want to build a ${obj.name} using ${obj.itemCost}.`;
		if (inPlace !== null) {
			str += ` You will lose the ${getPOHObject(inPlace).name} that you currently have there.`;
		}
		await handleMahojiConfirmation(interaction, str);
		await user.removeItemsFromBank(obj.itemCost.bank);
		updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, obj.itemCost);
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

export async function pohMountItemCommand(user: KlasaUser, name: string) {
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

	const userBank = user.bank();
	const costBank = new Bank().add(item.id);
	if (poh.mounted_item !== 1112) costBank.add('Magic stone', 2);
	if (!userBank.has(costBank)) {
		const missingBank = costBank.remove(userBank);
		return `You don't have all the required materials: ${costBank}\n\nYou're missing ${missingBank}`;
	}

	await user.removeItemsFromBank(costBank);
	if (currItem) {
		await user.addItemsToBank({ items: { [currItem]: 1 } });
	}

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

export async function pohDestroyCommand(user: KlasaUser, name: string) {
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
		await user.addItemsToBank({ items: { [inPlace!]: 1 }, collectionLog: false });
		return {
			...(await makePOHImage(user)),
			content: `You removed a ${obj.name} from your house, and were refunded 1x ${itemNameFromID(inPlace!)}.`
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
