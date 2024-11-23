import { Time, calcWhatPercent, increaseNumByPercent } from 'e';
import type { ItemBank } from '../meta/types';
import Bank from '../structures/Bank';
import Items from '../structures/Items';
import itemID from './itemID';

/**
 * Transforms a string-based bank to an ID-based bank
 * @param nameBank A string-based bank to convert
 */
export function resolveNameBank<T>(nameBank: Record<string, T>): Record<string, T> {
	const newBank: Record<string, T> = {};

	for (const [name, val] of Object.entries(nameBank)) {
		newBank[itemID(name)] = val;
	}

	return newBank;
}

/**
 * Resolves a bank which uses item names or item IDs.
 * @param bank A bank to resolve
 */
export function resolveBank(bank: Record<string, number>): ItemBank {
	const newBank: ItemBank = {};

	for (const [nameOrID, val] of Object.entries(bank)) {
		const int = Number(nameOrID);
		const id = Number.isNaN(int) ? itemID(nameOrID) : int;
		newBank[id] = val;
	}

	return newBank;
}

/**
 * Adds an item to a bank
 * @param bank A NumberKeyed bank to add items in
 * @param itemID The item ID to add
 * @param amountToAdd Quantity of items to be added. Defaults to 1
 */
export function addItemToBank(bank: ItemBank, itemID: number, amountToAdd = 1): ItemBank {
	const newBank = { ...bank };

	if (newBank[itemID]) newBank[itemID] += amountToAdd;
	else newBank[itemID] = amountToAdd;

	return newBank;
}

export function fasterResolveBank(bank: ItemBank) {
	const firstKey = Object.keys(bank)[0];
	if (!Number.isNaN(Number(firstKey))) {
		return bank;
	}

	return resolveBank(bank);
}

export function increaseBankQuantitesByPercent(bank: Bank, percent: number, whitelist: number[] | null = null) {
	for (const [item, qty] of bank.items()) {
		if (whitelist !== null && !whitelist.includes(item.id)) continue;
		const increased = Math.floor(increaseNumByPercent(qty, percent));
		bank.set(item.id, increased);
	}
}

export function convertBankToPerHourStats(bank: Bank, time: number) {
	const result = [];
	for (const [item, qty] of bank.items()) {
		result.push(`${(qty / (time / Time.Hour)).toFixed(1)}/hr ${item.name}`);
	}
	return result;
}

export function calcDropRatesFromBank(bank: Bank, iterations: number, uniques: number[]) {
	const result = [];
	let uniquesReceived = 0;
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		if (uniques.includes(item.id)) {
			uniquesReceived += qty;
		}
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		let { name } = item;
		if (uniques.includes(item.id)) name = `**${name}**`;
		result.push(`${qty}x ${name} (1 in ${rate})`);
	}
	result.push(
		`\n**${uniquesReceived}x Uniques (1 in ${Math.round(iterations / uniquesReceived)} which is ${calcWhatPercent(
			uniquesReceived,
			iterations
		)}%)**`
	);
	return result.join(', ');
}

export function calcDropRatesFromBankWithoutUniques(bank: Bank, iterations: number) {
	const results: string[] = [];
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		results.push(`${item.name} (1 in ${rate})`);
	}
	return results;
}

export function addBanks(banks: ItemBank[]): Bank {
	const bank = new Bank();
	for (const _bank of banks) {
		bank.add(_bank);
	}
	return bank;
}

export function averageBank(bank: Bank, kc: number) {
	const newBank = new Bank();
	for (const [item, qty] of bank.items()) {
		newBank.add(item.id, Math.floor(qty / kc));
	}
	return newBank;
}

export function generateRandomBank(size = 100, amountPerItem = 10000) {
	const bank = new Bank();
	for (let i = 0; i < size; i++) {
		bank.add(Items.random().id, amountPerItem);
	}
	return bank;
}
