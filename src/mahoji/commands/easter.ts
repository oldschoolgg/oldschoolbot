import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import {
	getEasterTurnInMessage,
	type PassiveEasterLootResult,
	rollEasterTurnInLoot,
	rollPassiveEasterLoot
} from '@/lib/easter.js';

function getEasterTurnInQuantityChoices(
	owned: number,
	input: string | number | null = null
): { name: string; value: string }[] {
	if (owned < 1) return [{ name: 'No Wabbit eggs', value: '0' }];

	const theirInput = !Number.isNaN(input) ? Number(input) : 0;
	const quantities: number[] = [1, 3, 5, 10, 15, 25, 50, 69, owned];

	if (theirInput !== 0) {
		const possible = Math.min(theirInput, owned);
		if (!quantities.includes(possible)) quantities.push(possible);
	}

	const choices = [
		...Array.from(quantities)
			.filter(quantity => quantity > 0 && quantity < owned)
			.sort((a, b) => {
				let sortVal = b - a;
				if (b === theirInput) sortVal = 1;
				if (a === theirInput) sortVal = -1;
				return sortVal;
			})
			.map(quantity => ({
				name: `${quantity.toLocaleString()} (${owned.toLocaleString()}x Owned)`,
				value: quantity.toString()
			}))
	];
	if (theirInput === 0 || theirInput === owned) {
		choices.unshift({
			name: `All (${owned.toLocaleString()}x Owned)`,
			value: owned.toString()
		});
	} else {
		choices.splice(1, 0, {
			name: `All (${owned.toLocaleString()}x Owned)`,
			value: owned.toString()
		});
	}

	return choices.slice(0, 25);
}

export const easterCommand = defineCommand({
	name: 'easter',
	description: 'Turn in Wabbit eggs for Easter rewards.',
	attributes: {
		examples: ['/easter turn_in 5']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'turn_in',
			description: 'Turn in Wabbit eggs for Easter loot.',
			options: [
				{
					type: 'String',
					name: 'quantity',
					description: 'The number of Wabbit eggs to turn in.',
					required: true,
					autocomplete: async ({ user, value }: StringAutoComplete) => {
						Logging.logDebug(
							`Autocompleting Easter turn-in quantity for user ${user.username} with value ${value}`
						);
						const choices = getEasterTurnInQuantityChoices(user.bank.amount('Wabbit eggs'), value);
						Logging.logDebug(
							`Generated [{${choices.map(c => `'${c.name}': '${c.value}'`).join('}, {')}}] Easter turn-in quantity choices for user ${user.username}`
						);
						return choices;
					}
				}
			]
		}
	],
	run: async ({ options, user }) => {
		let quantity: string | undefined | number = options.turn_in?.quantity;
		if (!quantity) {
			return `You must choose how many Wabbit eggs to turn in.`;
		}

		quantity = parseInt(quantity, 10);
		if (Number.isNaN(quantity) || quantity <= 0) {
			return `Invalid quantity: ${quantity}. Please enter a positive number.`;
		}

		if (quantity === 969_696 && user.isAdmin()) {
			const discountTameLoot = new Bank();
			const discountMinionLoot = new Bank();
			const fullCostTameLoot = new Bank();
			const fullCostMinionLoot = new Bank();

			const banks = [discountTameLoot, discountMinionLoot, fullCostTameLoot, fullCostMinionLoot];
			const names = ['Tame Discount', 'Minion Discount', 'Tame Full', 'Minion Full'];
			const testDuration = Time.Minute * 60;

			for (let i = 0; i < 4; i++) {
				const bank = banks[i];
				for (let j = 0; j < 1000; j++) {
					let easterResult: PassiveEasterLootResult | null | undefined;
					switch (i) {
						case 0:
							easterResult = rollPassiveEasterLoot(true, testDuration, true, true);
							if (easterResult && easterResult.loot) bank.add(easterResult?.loot);
							break;
						case 1:
							easterResult = rollPassiveEasterLoot(true, testDuration);
							if (easterResult && easterResult.loot) bank.add(easterResult?.loot);
							break;
						case 2:
							easterResult = rollPassiveEasterLoot(user, testDuration, true, false);
							if (easterResult && easterResult.loot) bank.add(easterResult?.loot);
							break;
						case 3:
							easterResult = rollPassiveEasterLoot(false, testDuration);
							if (easterResult && easterResult.loot) bank.add(easterResult?.loot);
							break;

						default:
							break;
					}
				}
			}

			let resultMsg = '';
			for (let i = 0; i < 4; i++) {
				resultMsg += `\n\n${names[i]}: ${banks[i]}`;
			}
			return `The results are in... ${resultMsg}`;
		}

		const cost = new Bank().add('Wabbit eggs', quantity);
		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}

		const { loot, magneggs } = rollEasterTurnInLoot(user, quantity);
		await user.transactItems({
			itemsToRemove: cost,
			itemsToAdd: loot,
			collectionLog: true
		});

		return new MessageBuilder()
			.setContent(
				getEasterTurnInMessage({
					cost,
					loot,
					magneggs
				})
			)
			.addBankImage({
				bank: loot,
				title: 'Easter Turn In',
				user
			});
	}
});
