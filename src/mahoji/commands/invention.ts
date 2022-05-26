import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { econBank } from '../../lib/econbank';
import {
	allItemsThatCanBeDisassembledIDs,
	DisassemblySourceGroups,
	IMaterialBank,
	MaterialType,
	materialTypes
} from '../../lib/invention';
import { bankDisassembleAnalysis, disassembleCommand, findDisassemblyGroup } from '../../lib/invention/disassemble';
import { inventCommand, Inventions } from '../../lib/invention/inventions';
import { MaterialBank } from '../../lib/invention/MaterialBank';
import { researchCommand } from '../../lib/invention/research';
import { SkillsEnum } from '../../lib/skilling/types';
import { toTitleCase } from '../../lib/util';
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
		},
		{
			name: 'research',
			description: 'Use your materials to research possible inventions.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'material',
					type: ApplicationCommandOptionType.String,
					description: 'The type of materials you want to research with.',
					required: true,
					autocomplete: async (value: string, user: APIUser) => {
						const mahojiUser = await mahojiUsersSettingsFetch(user.id, { materials_owned: true });
						const bank = new MaterialBank(mahojiUser.materials_owned as IMaterialBank);
						return materialTypes
							.filter(i => (!value ? true : i.includes(value.toLowerCase())))
							.sort((a, b) => {
								if (bank.has(b)) return 1;
								if (bank.has(a)) return -1;
								return 0;
							})
							.map(i => ({
								name: `${toTitleCase(i)} ${
									bank.has(i) ? `(${bank.amount(i).toLocaleString()}x Owned)` : ''
								}`,
								value: i
							}));
					}
				},
				{
					name: 'quantity',
					type: ApplicationCommandOptionType.Integer,
					description: 'The amount of materials you want to use (Optional).',
					required: false,
					min_value: 1
				}
			]
		},
		{
			name: 'materials',
			description: 'Shows the materials you have.',
			type: ApplicationCommandOptionType.Subcommand
		}
	],
	run: async ({
		userID,
		options,
		channelID,
		interaction
	}: CommandRunOptions<{
		duplicates?: {};
		analyzebank?: {};
		missingitems?: {};
		disassemble?: { name: string; quantity?: number };
		research?: { material: MaterialType; quantity?: number };
		invent?: { name: string; quantity?: number };
		materials?: {};
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
		if (options.research) {
			return researchCommand({
				user: mahojiUser,
				inputQuantity: options.research.quantity,
				material: options.research.material,
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

		if (options.materials) {
			return new MaterialBank(mahojiUser.materials_owned as IMaterialBank).toString();
		}

		return 'Wut da hell';
	}
};
