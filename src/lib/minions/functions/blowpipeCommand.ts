import type { IBlowpipeData } from '@oldschoolgg/schemas';
import { Bank, EItem, Items } from 'oldschooljs';

const defaultBlowpipe: IBlowpipeData = {
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
].map(name => Items.getOrThrow(name));

export function validateBlowpipeData(data: IBlowpipeData) {
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

	const rawBlowpipeData = user.getBlowpipe();
	const hasBlowpipe = user.owns('Toxic blowpipe') || user.owns('Toxic blowpipe (empty)');
	if (!hasBlowpipe) return "You don't own a Toxic blowpipe.";

	try {
		validateBlowpipeData(rawBlowpipeData);
	} catch (_err: unknown) {
		await user.updateBlowpipe({ ...defaultBlowpipe });

		return `Your blowpipe got corrupted somehow, this shouldn't happen! It's a bug. Your blowpipe was reset.`;
	}
	let str = `**Toxic Blowpipe** <:Toxic_blowpipe:887011870068838450>

Zulrah's scales: ${rawBlowpipeData.scales.toLocaleString()}x
`;

	const item = rawBlowpipeData.dartID ? Items.getItem(rawBlowpipeData.dartID) : null;
	if (item) {
		str += `${item.name}'s: ${rawBlowpipeData.dartQuantity?.toLocaleString()}x`;
	}

	return str;
}

async function addCommand(user: MUser, itemName: string, quantity = 1) {
	if (await user.minionIsBusy()) {
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

	const item = Items.getItem(itemName);
	if (!item) return 'Invalid item.';

	const userBank = user.bank;

	const itemsToRemove = new Bank();
	if (!blowpipeDarts.includes(item) && item.id !== EItem.ZULRAHS_SCALES) {
		return "You can only charge your blowpipe with darts and Zulrah's scales.";
	}
	itemsToRemove.add(item.id, Math.max(1, quantity || userBank.amount(item.id)));

	const dartBeingAdded = itemsToRemove.items().find(i => blowpipeDarts.includes(i[0]));

	const rawBlowpipeData = user.getBlowpipe();
	validateBlowpipeData(rawBlowpipeData);
	if (dartBeingAdded && !itemsToRemove.amount(dartBeingAdded[0].id)) {
		throw new Error('wtf! not meant to happen');
	}

	if (rawBlowpipeData.dartID !== null && dartBeingAdded && rawBlowpipeData.dartID !== dartBeingAdded[0].id) {
		return `You already have ${
			Items.getOrThrow(rawBlowpipeData.dartID).name
		}'s in your Blowpipe, do \`/minion blowpipe remove_darts:true\` to remove them first.`;
	}

	const currentData: IBlowpipeData = { ...rawBlowpipeData };
	validateBlowpipeData(currentData);
	currentData.scales += itemsToRemove.amount("Zulrah's scales");

	if (dartBeingAdded) {
		currentData.dartID = dartBeingAdded[0].id;
		currentData.dartQuantity += itemsToRemove.amount(dartBeingAdded[0].id);
	}
	validateBlowpipeData(currentData);
	if (!userBank.has(itemsToRemove)) {
		return `You don't own ${itemsToRemove}.`;
	}

	await user.updateBlowpipe(currentData);
	await user.transactItems({
		itemsToRemove
	});

	return `You added ${itemsToRemove} to your Toxic blowpipe.`;
}

async function removeDartsCommand(user: MUser) {
	if (await user.minionIsBusy()) {
		return "You can't remove darts from your blowpipe, because your minion is out on a trip.";
	}
	const hasBlowpipe = user.owns('Toxic blowpipe');
	if (!hasBlowpipe) {
		return "You don't own a Toxic blowpipe.";
	}

	let rawBlowpipeData = user.getBlowpipe();
	validateBlowpipeData(rawBlowpipeData);
	if (!rawBlowpipeData.dartID || rawBlowpipeData.dartQuantity === 0) {
		return 'Your Toxic blowpipe has no darts in it.';
	}
	validateBlowpipeData(rawBlowpipeData);
	const returnedBank = new Bank().add(rawBlowpipeData.dartID, rawBlowpipeData.dartQuantity);
	rawBlowpipeData = {
		dartID: null,
		dartQuantity: 0,
		scales: rawBlowpipeData.scales
	};

	await user.updateBlowpipe(rawBlowpipeData);
	await user.transactItems({
		itemsToAdd: returnedBank,
		collectionLog: false
	});
	validateBlowpipeData(rawBlowpipeData);
	return `You removed ${returnedBank} from your Toxic blowpipe.`;
}

async function unchargeCommand(user: MUser) {
	if (await user.minionIsBusy()) {
		return "You can't uncharge your blowpipe, because your minion is out on a trip.";
	}
	const hasBlowpipe = user.owns('Toxic blowpipe');
	if (!hasBlowpipe) {
		return "You don't own a Toxic blowpipe.";
	}

	const rawBlowpipeData = { ...user.getBlowpipe() };
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

	await user.updateBlowpipe({ scales: 0, dartID: null, dartQuantity: 0 });
	await user.transactItems({
		itemsToAdd: returnedBank,
		collectionLog: false
	});

	return `You removed ${returnedBank} from your Toxic blowpipe.`;
}
