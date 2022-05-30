import { shuffleArr } from 'e';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { allItemsThatCanBeDisassembledIDs, IMaterialBank, MaterialType, materialTypes } from '../../lib/invention';
import { bankDisassembleAnalysis, disassembleCommand, findDisassemblyGroup } from '../../lib/invention/disassemble';
import { inventCommand, Inventions } from '../../lib/invention/inventions';
import { MaterialBank } from '../../lib/invention/MaterialBank';
import { researchCommand } from '../../lib/invention/research';
import { SkillsEnum } from '../../lib/skilling/types';
import { toTitleCase } from '../../lib/util';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiClientSettingsFetch, mahojiUsersSettingsFetch } from '../mahojiSettings';

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
			name: 'tools',
			description: 'Various other tools and commands.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'command',
					description: 'The command/tool you want to run.',
					required: true,
					choices: [
						{
							name: 'Materials Owned',
							value: 'materials_owned'
						},
						{
							name: 'Analyze Bank',
							value: 'analyze_bank'
						},
						{
							name: 'Missing Item',
							value: 'missing_items'
						},
						{
							name: 'Items Disassembled',
							value: 'items_disassembled'
						},
						{
							name: 'Materials Researched',
							value: 'materials_researched'
						},
						{
							name: 'Global Disassembled',
							value: 'global_disassembled'
						},
						{
							name: 'Unlocked Blueprints/Inventions',
							value: 'unlocked_blueprints'
						},
						{
							name: 'Global Invention Material Cost',
							value: 'invention_mat_cost'
						}
					]
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
		research?: { material: MaterialType; quantity?: number };
		invent?: { name: string; quantity?: number };
		tools?: {
			command:
				| 'materials_owned'
				| 'analyze_bank'
				| 'missing_items'
				| 'items_disassembled'
				| 'materials_researched'
				| 'global_disassembled'
				| 'unlocked_blueprints'
				| 'invention_mat_cost';
		};
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
				channelID,
				interaction
			});
		}
		if (options.invent) {
			return inventCommand(interaction, mahojiUser, user, options.invent.name);
		}

		if (options.tools) {
			await interaction.deferReply();
			switch (options.tools.command) {
				case 'materials_owned': {
					return new MaterialBank(mahojiUser.materials_owned as IMaterialBank).toString();
				}
				case 'analyze_bank': {
					const result = bankDisassembleAnalysis({
						bank: new Bank(mahojiUser.bank as ItemBank),
						user: mahojiUser
					});
					return result;
				}
				case 'missing_items': {
					const itemsShouldBe = Items.filter(
						i =>
							Boolean(i.tradeable) &&
							Boolean(i.tradeable_on_ge) &&
							!allItemsThatCanBeDisassembledIDs.has(i.id)
					)
						.sort((a, b) => b.price - a.price)
						.array();

					const normalTable = shuffleArr(itemsShouldBe)
						.filter(i => ['(p', 'Team-'].every(str => !i.name.includes(str)))
						.map(i => `${i.name}`)
						.join('\n');
					return {
						attachments: [{ fileName: 'missing-items-disassemble.txt', buffer: Buffer.from(normalTable) }]
					};
				}
				case 'items_disassembled': {
					const a = await mahojiUsersSettingsFetch(user.id, {
						disassembled_items_bank: true
					});

					return {
						content: "These are all the items you've ever disassembled.",
						attachments: [
							(
								await makeBankImage({
									bank: new Bank(a.disassembled_items_bank as ItemBank),
									user,
									title: 'Items Disassembled'
								})
							).file
						]
					};
				}
				case 'materials_researched': {
					const a = await mahojiUsersSettingsFetch(user.id, {
						researched_materials_bank: true
					});

					return {
						content: `These are all the materials you've used to researched: ${new MaterialBank(
							a.researched_materials_bank as IMaterialBank
						)}.`
					};
				}
				case 'global_disassembled': {
					const a = await mahojiClientSettingsFetch({
						items_disassembled_cost: true
					});

					return {
						content: 'These are all the items globally, anyone has ever disassembled.',
						attachments: [
							(
								await makeBankImage({
									bank: new Bank(a.items_disassembled_cost as ItemBank),
									user,
									title: 'Items Disassembled'
								})
							).file
						]
					};
				}
				case 'unlocked_blueprints': {
					const unlocked = Inventions.filter(i => mahojiUser.unlocked_blueprints.includes(i.id));
					const locked = Inventions.filter(i => !mahojiUser.unlocked_blueprints.includes(i.id));
					return `You have the following blueprints unlocked: ${unlocked.map(i => i.name).join(', ')}.
These Inventions are still not unlocked: ${locked
						.map(i => `${i.name} (${Object.keys(i.materialTypeBank.bank).join(', ')})`)
						.join(', ')}`;
				}
				case 'invention_mat_cost': {
					const invCost = await mahojiClientSettingsFetch({ invention_materials_cost: true });
					return `The Global Amount of Materials spent on inventing/using inventions: ${new MaterialBank(
						invCost.invention_materials_cost as IMaterialBank
					)}`;
				}
			}
		}

		return 'Wut da hell';
	}
};
