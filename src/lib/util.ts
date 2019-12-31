import { Image } from 'canvas';
import { Bank } from './types';
import { util } from 'klasa';

export function generateHexColorForCashStack(coins: number) {
	if (coins > 9999999) {
		return '#00FF80';
	}

	if (coins > 99999) {
		return '#FFFFFF';
	}

	return '#FFFF00';
}

export function formatItemStackQuantity(quantity: number) {
	if (quantity > 9999999) {
		return `${Math.floor(quantity / 1000000)}M`;
	} else if (quantity > 99999) {
		return `${Math.floor(quantity / 1000)}K`;
	} else {
		return quantity.toString();
	}
}

export function canvasImageFromBuffer(imageBuffer: Buffer): Promise<Image> {
	return new Promise((resolve, reject) => {
		const canvasImage = new Image();

		canvasImage.onload = () => resolve(canvasImage);
		canvasImage.onerror = () => reject(new Error('Failed to load image.'));
		canvasImage.src = imageBuffer;
	});
}

export function removeItemFromBank(bank: Bank, itemID: number, amountToRemove: number = 1) {
	let newBank = { ...bank };
	const currentValue = bank[itemID];

	// If they don't have this item in the bank, just return it..
	if (!currentValue) return bank;

	// If they will have 0 or less of this item afterwards, delete it entirely.
	if (currentValue <= amountToRemove) {
		delete newBank[itemID];
	}

	newBank[itemID] = currentValue - amountToRemove;

	return newBank;
}

export function addItemToBank(bank: Bank, itemID: number, amountToAdd: number = 1) {
	let newBank = { ...bank };

	if (!newBank[itemID]) newBank[itemID] = amountToAdd;
	else newBank[itemID] += amountToAdd;

	return newBank;
}

export function addBankToBank(fromBank: Bank, toBank: Bank) {
	let newBank = { ...toBank };

	for (const [itemID, quantity] of Object.entries(fromBank)) {
		newBank = addItemToBank(newBank, parseInt(itemID), quantity);
	}

	return newBank;
}

export function addArrayOfItemsToBank(bank: Bank, items: number[]) {
	let newBank = { ...bank };

	for (const item of items) {
		newBank = addItemToBank(newBank, item);
	}

	return newBank;
}

// TODO should this use a generic?
export function randomItemFromArray(array: unknown[]) {
	return array[Math.floor(Math.random() * array.length)];
}

export function chunkObject(obj: { [key: string]: any }, limit: number) {
	const chunkedObjects = [];
	for (const chunk of util.chunk(Object.entries(obj), limit)) {
		chunkedObjects.push(Object.fromEntries(chunk));
	}
	return chunkedObjects;
}

export function toTitleCase(str: string) {
	let splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}
