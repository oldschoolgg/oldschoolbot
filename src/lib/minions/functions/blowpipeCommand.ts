import type { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';

import getOSItem, { getItem } from '../../util/getOSItem';
import type { BlowpipeData } from '../types';

const defaultBlowpipe: BlowpipeData = {
	scales: 0,
	dartID: null,
	dartQuantity: 0
};

export const blowpipeDarts = [
	'Bronze dart',
	'Iron dart',
	'Steel dart',
	'Black dart',
	'Mithril dart',
	'Adamant dart',
	'Rune dart',
	'Amethyst dart',
	'Dragon dart'
].map(getOSItem);

export function validateBlowpipeData(data: BlowpipeData) {
	if (Object.keys(data).length !== 3) throw new Error('Failed BP validation');
	if (data.dartID === null && data.dartQuantity !== 0) throw new Error('Failed BP validation');
	if (data.dartID !== null && !blowpipeDarts.some(d => d.id === data.dartID)) {
		throw new Error('has a non-dart equipped');
	}
	if (data.dartQuantity < 0 || data.scales < 0) throw new Error('Less than 0 scales/darts');
}

export async function blowpipeCommand(
	user: MUser,
	removeDarts: boolean | undefined,
	uncharge: boolean | undefined,
	add: string | undefined,
	quantity: number | undefined
) {
	if (removeDarts) return removeDartsCommand(user);

	if (uncharge) return unchargeCommand(user);

	if (add) {
		return addCommand(user, add, quantity);
	}

	const rawBlowpipeData = { ...user.blowpipe };
	const hasBlowpipe = user.owns('Toxic blowpipe') || user.owns('Toxic blowpipe (empty)');
	if (!hasBlowpipe) return "You don't own a Toxic blowpipe.";

	try {
		validateBlowpipeData(rawBlowpipeData);
	} catch (err: any) {
		await user.update({
			blowpipe: { ...defaultBlowpipe }
		});

		return `Your blowpipe got corrupted somehow (${err.message}), this shouldn't happen! It's a bug. Your blowpipe was reset.`;
	}
	let str = `**Toxic Blowpipe** <:Toxic_blowpipe:887011870068838450>

Zulrah's scales: ${rawBlowpipeData.scales.toLocaleString()}x
`;

	const item = rawBlowpipeData.dartID ? getOSItem(rawBlowpipeData.dartID) : null;
	if (item) {
		str += `${item.name}'s: ${rawBlowpipeData.dartQuantity?.toLocaleString()}x`;
	}

	return str;
}

async function addCommand(user: MUser, itemName: string, quantity = 1) {
	if (user.minionIsBusy) {
		return "You can't add to your blowpipe, because your minion is out on a trip.";
	}
	if (!user.owns('Toxic blowpipe') && user.owns('Toxic blowpipe (empty)')) {
		await user.transactItems({
			itemsToAdd: new Bank().add('Toxic blowpipe'),
			itemsToRemove: new Bank().add('Toxic blowpipe (empty)')
		});
	}

	const hasBlowpipe = user.owns('Toxic blowpipe');

	if (!hasBlowpipe) {
		return "You don't own a Toxic blowpipe.";
	}

	const item = getItem(itemName);
	if (!item) return 'Invalid item.';

	const userBank = user.bank;

	const itemsToRemove = new Bank();
	if (!blowpipeDarts.includes(item) && item !== getOSItem("Zulrah's scales")) {
		return "You can only charge your blowpipe with darts and Zulrah's scales.";
	}
	itemsToRemove.add(item.id, Math.max(1, quantity || userBank.amount(item.id)));

	const dart = itemsToRemove.items().find(i => blowpipeDarts.includes(i[0]));

	const rawBlowpipeData = { ...user.blowpipe };
	validateBlowpipeData(rawBlowpipeData);
	if (dart && !itemsToRemove.amount(dart[0].id)) {
		throw new Error('wtf! not meant to happen');
	}

	if (rawBlowpipeData.dartID !== null && dart && rawBlowpipeData.dartID !== dart[0].id) {
		return `You already have ${
			getOSItem(rawBlowpipeData.dartID).name
		}'s in your Blowpipe, do \`/minion blowpipe remove_darts:true\` to remove them first.`;
	}

	const currentData: BlowpipeData = { ...rawBlowpipeData };
	validateBlowpipeData(currentData);
	currentData.scales += itemsToRemove.amount("Zulrah's scales");

	if (dart) {
		if (currentData.dartID !== null && dart[0].id !== currentData.dartID) {
			throw new Error('wtf');
		}
		currentData.dartID = dart[0].id;
		currentData.dartQuantity += itemsToRemove.amount(dart[0].id);
	}
	validateBlowpipeData(currentData);
	if (!userBank.has(itemsToRemove)) {
		return `You don't own ${itemsToRemove}.`;
	}
	await user.removeItemsFromBank(itemsToRemove);
	await user.update({
		blowpipe: currentData as any as Prisma.InputJsonObject
	});
	return `You added ${itemsToRemove} to your Toxic blowpipe.`;
}

async function removeDartsCommand(user: MUser) {
	if (user.minionIsBusy) {
		return "You can't remove darts from your blowpipe, because your minion is out on a trip.";
	}
	const hasBlowpipe = user.owns('Toxic blowpipe');
	if (!hasBlowpipe) {
		return "You don't own a Toxic blowpipe.";
	}

	const rawBlowpipeData = { ...user.blowpipe };
	validateBlowpipeData(rawBlowpipeData);
	if (!rawBlowpipeData.dartID || rawBlowpipeData.dartQuantity === 0) {
		return 'Your Toxic blowpipe has no darts in it.';
	}
	validateBlowpipeData(rawBlowpipeData);
	const returnedBank = new Bank().add(rawBlowpipeData.dartID, rawBlowpipeData.dartQuantity);
	rawBlowpipeData.dartID = null;
	rawBlowpipeData.dartQuantity = 0;
	await user.addItemsToBank({ items: returnedBank, collectionLog: false });
	await user.update({
		blowpipe: rawBlowpipeData as any as Prisma.InputJsonObject
	});
	validateBlowpipeData(rawBlowpipeData);
	return `You removed ${returnedBank} from your Toxic blowpipe.`;
}

async function unchargeCommand(user: MUser) {
	if (user.minionIsBusy) {
		return "You can't uncharge your blowpipe, because your minion is out on a trip.";
	}
	const hasBlowpipe = user.owns('Toxic blowpipe');
	if (!hasBlowpipe) {
		return "You don't own a Toxic blowpipe.";
	}

	const rawBlowpipeData = { ...user.blowpipe };
	const returnedBank = new Bank();
	if (rawBlowpipeData.scales) {
		returnedBank.add("Zulrah's scales", rawBlowpipeData.scales);
	}
	if (rawBlowpipeData.dartID) {
		returnedBank.add(rawBlowpipeData.dartID, rawBlowpipeData.dartQuantity);
	}

	if (returnedBank.length === 0) {
		return 'You have no darts or scales in your Blowpipe.';
	}

	await user.addItemsToBank({ items: returnedBank, collectionLog: false });
	await user.update({
		blowpipe: { scales: 0, dartID: null, dartQuantity: 0 }
	});

	return `You removed ${returnedBank} from your Toxic blowpipe.`;
}
