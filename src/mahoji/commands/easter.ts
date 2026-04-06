import { Bank } from 'oldschooljs';

import { EITEMS, rollEasterTurnInLoot } from '@/lib/easter.js';

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
					min_value: 1
				}
			]
		}
	],
	run: async ({ options, user }) => {
		const quantity = options.turn_in?.quantity;
		if (!quantity) {
			return `You must choose how many ${new Bank().add(EITEMS.WabbitEggs, 1)} to turn in.`;
		}

		const cost = new Bank().add(EITEMS.WabbitEggs, quantity);
		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}

		const { loot, magneggs } = rollEasterTurnInLoot(quantity);
		await user.transactItems({
			itemsToRemove: cost,
			itemsToAdd: loot,
			collectionLog: true
		});

		const extraText = magneggs > 0 ? ` You also found ${new Bank().add(EITEMS.Magnegg, magneggs)}.` : '';
		return new MessageBuilder().setContent(`You turned in ${cost} and received ${loot}.${extraText}`).addBankImage({
			bank: loot,
			title: 'Easter Turn In',
			user
		});
	}
});
