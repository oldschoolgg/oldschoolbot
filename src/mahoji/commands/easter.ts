import { Bank } from 'oldschooljs';

import { getEasterTurnInMessage, rollEasterTurnInLoot } from '@/lib/easter.js';

function getEasterTurnInQuantityChoices(owned: number, input: number) {
	if (owned < 1) return [];

	const search = Number.isFinite(input) && input > 0 ? input : null;
	const quantities = new Set<number>([1, 3, 5, 10, 15, 25, 50, 69, owned]);

	if (search !== null) {
		quantities.add(Math.min(search, owned));
	}

	return [
		{
			name: `All (${owned.toLocaleString()}x Owned)`,
			value: owned
		},
		...Array.from(quantities)
			.filter(quantity => quantity > 0 && quantity < owned)
			.sort((a, b) => a - b)
			.map(quantity => ({
				name: `${quantity.toLocaleString()} (${owned.toLocaleString()}x Owned)`,
				value: quantity
			}))
	].slice(0, 25);
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
					type: 'Integer',
					name: 'quantity',
					description: 'The number of Wabbit eggs to turn in.',
					required: true,
					min_value: 1,
					autocomplete: async ({ user, value }: NumberAutoComplete) => {
						return getEasterTurnInQuantityChoices(user.bank.amount('Wabbit eggs'), value);
					}
				}
			]
		}
	],
	run: async ({ options, user }) => {
		const quantity = options.turn_in?.quantity;
		if (!quantity) {
			return `You must choose how many Wabbit eggs to turn in.`;
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
