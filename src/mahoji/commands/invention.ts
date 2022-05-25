import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { econBank } from '../../lib/econbank';
import { allItemsThatCanBeDisassembledIDs, DisassemblySourceGroups } from '../../lib/invention';
import { bankDisassembleAnalysis, disassembleCommand, findDisassemblyGroup } from '../../lib/invention/disassemble';
import { inventCommand, Inventions } from '../../lib/invention/inventions';
import { SkillsEnum } from '../../lib/skilling/types';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const askCommand: OSBMahojiCommand = {
	name: 'invention',
	description: 'The invention skill.',
	options: [
		{
			name: 'disassemble',
			description: 'Disassemble items into materials.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionType.String,
					description: 'The item you want to disassemble.',
					required: true,
					autocomplete: async (value, { id }) => {
						const user = await globalClient.fetchUser(id);
						const inventionLevel = user.skillLevel(SkillsEnum.Invention);

						return user
							.bank()
							.items()
							.filter(
								i =>
									allItemsThatCanBeDisassembledIDs.has(i[0].id) &&
									(!value ? true : i[0].name.toLowerCase().includes(value.toLowerCase()))
							)
							.filter(i => {
								const data = findDisassemblyGroup(i[0]);
								if (!data) return false;
								return inventionLevel >= data.data.lvl;
							})
							.map(i => ({ name: `${i[0].name} (${i[1]}x Owned)`, value: i[0].name }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to disassemble.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			name: 'duplicates',
			description: 'Find duplicate items',
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: 'analyzebank',
			description: 'Shows some details on what can be disassembled in your bank.',
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: 'missingitems',
			description: 'Shows items that cant be disassembled',
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: 'invent',
			description: 'Use your materials to invent an item.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionType.String,
					description: 'The item you want to invent.',
					required: true,
					autocomplete: async value => {
						return Inventions.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({
							name: i.name,
							value: i.name
						}));
					}
				}
			]
		}
	],
	run: async ({
		userID,
		options,
		channelID,
		interaction
	}: CommandRunOptions<{
		disassemble?: { name: string; quantity?: number };
		invent?: { name: string; quantity?: number };
		duplicates?: {};
		analyzebank?: {};
		missingitems?: {};
	}>) => {
		const user = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		if (options.disassemble) {
			return disassembleCommand({
				klasaUser: user,
				mahojiUser,
				itemToDisassembleName: options.disassemble.name,
				quantityToDisassemble: options.disassemble.quantity,
				channelID
			});
		}
		if (options.invent) {
			return inventCommand(mahojiUser, channelID, options.invent.name);
		}
		if (options.duplicates) {
			const duplicateItems = [];
			const foundItems: number[] = [];
			for (let group of DisassemblySourceGroups) {
				for (let itm of group.items) {
					const items: Item[] = Array.isArray(itm.item) ? itm.item : [itm.item];
					if (items.some(i => foundItems.includes(i.id))) {
						duplicateItems.push(items.map(i => ({ name: i.name, group: i.name })));
					} else {
						foundItems.push(...items.map(i => i.id));
					}
				}
			}
			console.log(duplicateItems);
			return `Found ${duplicateItems.length} duplicate items in Groups.`;
		}

		if (options.analyzebank) {
			const result = bankDisassembleAnalysis({ bank: new Bank(mahojiUser.bank as ItemBank), user: mahojiUser });
			return result;
		}

		if (options.missingitems) {
			await interaction.deferReply();
			const itemsShouldBe = Items.filter(
				i => Boolean(i.tradeable) && Boolean(i.tradeable_on_ge) && !allItemsThatCanBeDisassembledIDs.has(i.id)
			)
				.sort((a, b) => b.price - a.price)
				.array();

			const normalTable = itemsShouldBe
				.filter(i => ['(p', 'Team-'].every(str => !i.name.includes(str)))
				.sort((a, b) => econBank.amount(b.id) - econBank.amount(a.id))
				.map(i => `${i.name}\t${econBank.amount(i.id)}`)
				.join('\n');
			return {
				attachments: [{ fileName: 'missing-items-disassemble.txt', buffer: Buffer.from(normalTable) }]
			};
		}

		return 'Wut da hell';
	}
};
