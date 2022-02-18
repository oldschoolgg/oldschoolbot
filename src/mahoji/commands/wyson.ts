import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { client } from '../..';
import { NestBoxes } from '../../lib/data/openables';
import { stringMatches } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

interface MolePartItem {
	name: string;
	inputItem: number;
	aliases?: string[];
}

const MolePartItems: MolePartItem[] = [
	{
		name: 'Mole skin',
		inputItem: itemID('Mole skin')
	},
	{
		name: 'Mole claw',
		inputItem: itemID('Mole claw')
	}
];

export const wysonCommand: OSBMahojiCommand = {
	name: 'wyson',
	description: 'Allows you to exchange mole parts for Nest boxes.',
	attributes: {
		categoryFlags: ['minion'],
		description: 'Allows you to exchange mole parts for Nest boxes.'
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the part you wish to exchange',
			required: true,
			autocomplete: async (value: string) => {
				return MolePartItems.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({ name: i.name, value: i.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount of parts you want to exchange.',
			required: false,
			min_value: 1
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		name: string;
		quantity?: number;
	}>) => {
		const user = await client.fetchUser(userID.toString());
		let { name, quantity } = options;

		const moleItem = MolePartItems.find(item => stringMatches(name, item.name));

		if (!moleItem) {
			return `I don't exchange that item. I exchange the following: ${MolePartItems.map(item => {
				return item.name;
			}).join(', ')}.`;
		}

		if (!quantity) {
			quantity = 1;
		}

		if (user.bank().amount(moleItem.inputItem) < quantity) {
			return `You don't have enough ${moleItem.name} to exchange!`;
		}

		await user.removeItemsFromBank(new Bank().add(moleItem.inputItem, quantity));

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(NestBoxes.roll());
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		return `You exchanged ${quantity}x ${moleItem.name} and received: ${loot}.`;
	}
};
