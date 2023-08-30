import { bold } from 'discord.js';
import { calcWhatPercent } from 'e';
import { Bank } from 'oldschooljs';

export function calcDropRatesFromBank(bank: Bank, iterations: number, uniques: number[]) {
	let result = [];
	let uniquesReceived = 0;
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		if (uniques.includes(item.id)) {
			uniquesReceived += qty;
		}
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		let { name } = item;
		if (uniques.includes(item.id)) name = bold(name);
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
	let results = [];
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		results.push(`${qty}x ${item.name} (1 in ${rate})`);
	}
	return results;
}
