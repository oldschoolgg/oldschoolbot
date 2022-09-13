import { time } from '@discordjs/builders';
import { reduceNumByPercent, Time } from 'e';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { table } from 'table';

import { production } from '../../config';
import { allItemsThatCanBeDisassembledIDs, IMaterialBank, MaterialType, materialTypes } from '../../lib/invention';
import {
	calcJunkChance,
	calculateDisXP,
	disassembleCommand,
	findDisassemblyGroup
} from '../../lib/invention/disassemble';
import { DisassemblySourceGroups } from '../../lib/invention/groups';
import { inventCommand, inventingCost, inventionBoosts, Inventions } from '../../lib/invention/inventions';
import { MaterialBank } from '../../lib/invention/MaterialBank';
import { researchCommand } from '../../lib/invention/research';
import { SkillsEnum } from '../../lib/skilling/types';
import { calcPerHour, stringMatches, toKMB, toTitleCase } from '../../lib/util';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiParseNumber, mahojiUsersSettingsFetch } from '../mahojiSettings';

const RELEASE_TIME_UNIX_TIME = 1_656_766_800;
const RELEASE_DATE = new Date(RELEASE_TIME_UNIX_TIME * 1000);

export const inventionCommand: OSBMahojiCommand = {
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
						const user = await mUserFetch(id);
						const inventionLevel = user.skillLevel(SkillsEnum.Invention);

						return user.bank
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
					type: ApplicationCommandOptionType.String,
					name: 'quantity',
					description: 'The quantity you want to disassemble.',
					required: false
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
							name: 'Material Groups',
							value: 'groups'
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
							name: 'Unlocked Blueprints/Inventions',
							value: 'unlocked_blueprints'
						},
						{
							name: 'XP Stats',
							value: 'xp'
						}
					]
				}
			]
		},
		{
			name: 'details',
			description: 'See details and information on an Invention.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'invention',
					description: 'The invention you want to check.',
					required: true,
					autocomplete: async value => {
						return Inventions.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						)
							.map(i => ({ name: i.name, value: i.name }))
							.sort((a, b) => a.name.localeCompare(b.name));
					}
				}
			]
		},
		{
			name: 'materials',
			description: 'See the materials you own.',
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: 'group',
			description: 'See details about a group.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'group',
					description: 'The group you want to check.',
					required: true,
					autocomplete: async value => {
						return DisassemblySourceGroups.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
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
		disassemble?: { name: string; quantity?: string };
		research?: { material: MaterialType; quantity?: number };
		invent?: { name: string; quantity?: number };
		group?: { group: string };
		materials?: {};
		tools?: {
			command: 'groups' | 'items_disassembled' | 'materials_researched' | 'unlocked_blueprints' | 'xp';
		};
		details?: { invention: string };
	}>) => {
		const user = await mUserFetch(userID);
		if (options.details) {
			const invention = Inventions.find(i => stringMatches(i.name, options.details!.invention!));
			if (!invention) return 'No invention found.';
			let str = `**${invention.name}** - *${invention.description}*
- Requires level ${invention.inventionLevelNeeded} Invention
- The materials used for this invention: ${invention.materialTypeBank
				.values()
				.map(i => `${i.type} (${i.quantity})`)
				.join(', ')}
- Required cost to make: ${inventingCost(invention)} and ${invention.itemCost ? `${invention.itemCost}` : 'No items'}
- ${invention.flags.includes('equipped') ? 'Must be equipped' : 'Works in bank'}`;
			if (invention.extraDescription) str += `\n${invention.extraDescription()}`;
			return str;
		}
		if (options.materials) {
			return `You own: ${user.materialsOwned()}`;
		}

		if (options.group) {
			const group = DisassemblySourceGroups.find(i => i.name === options.group?.group);
			if (!group) return "That's not a valid group.";
			let str = `${['Name', 'Weighting/Level'].join('\t')}\n`;
			let results: [string, number][] = [];
			for (const baseItem of group.items) {
				for (const item of Array.isArray(baseItem.item) ? baseItem.item : [baseItem.item]) {
					results.push([item.name, baseItem.lvl]);
				}
			}
			results.sort((a, b) => a[1] - b[1]);
			for (const [name, lvl] of results) {
				str += `${[name, lvl].join('\t')}\n`;
			}
			return {
				content: `Items in the ${group.name} Category give materials at this relative ratio: ${new MaterialBank(
					group.parts
				)
					.values()
					.map(i => `${i.type}[${i.quantity}]`)
					.join(' ')}`,
				attachments: [{ buffer: Buffer.from(str), fileName: `${group.name}.txt` }]
			};
		}

		if (options.tools) {
			await interaction.deferReply();
			switch (options.tools.command) {
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
				case 'unlocked_blueprints': {
					const unlocked = Inventions.filter(i => user.user.unlocked_blueprints.includes(i.id));
					const locked = Inventions.filter(i => !user.user.unlocked_blueprints.includes(i.id));
					return `You have the following blueprints unlocked: ${
						unlocked.length === 0
							? 'None! Do some research to unlock some.'
							: unlocked.map(i => i.name).join(', ')
					}.
These Inventions are still not unlocked: ${locked
						.map(i => `${i.name} (${Object.keys(i.materialTypeBank.bank).join(', ')})`)
						.join(', ')}`;
				}
				case 'xp': {
					let xpTable = [];
					xpTable.push([
						'Invention Level(1-120)',
						'Item Weighting(1-120)',
						'XP Per',
						'XP/Hr',
						'XP/Hr With Toolkit',
						'XP/Hr With Toolkit&Cape'
					]);

					const lvls = [1, 10, 30, 60, 80, 90, 99, 110, 120];
					const weightings = [1, 10, 30, 60, 80, 90, 99];
					for (const lvl of lvls) {
						for (const weighting of weightings) {
							if (weighting > lvl) continue;
							const { xp } = calculateDisXP({} as any, lvl, 1, weighting);
							let dur = Time.Second * 0.33;
							let toolkitDur = reduceNumByPercent(
								dur,
								inventionBoosts.dwarvenToolkit.disassembleBoostPercent
							);
							let capeAndToolkitDur = reduceNumByPercent(
								toolkitDur,
								inventionBoosts.inventionMasterCape.disassemblySpeedBoostPercent
							);

							xpTable.push([
								lvl,
								weighting,
								xp,
								toKMB(calcPerHour(xp, dur)),
								lvl >= inventionBoosts.dwarvenToolkit.requiredLevel
									? toKMB(calcPerHour(xp, toolkitDur))
									: 'N/A',
								lvl === 99 ? toKMB(calcPerHour(xp, capeAndToolkitDur)) : 'N/A'
							]);
						}
					}

					return {
						attachments: [{ buffer: Buffer.from(table(xpTable)), fileName: 'invention-xp.txt' }]
					};
				}
				case 'groups': {
					let str = '';
					for (const group of DisassemblySourceGroups) {
						str += `${group.name} (${new MaterialBank(group.parts)
							.values()
							.map(i => `${i.quantity}% ${i.type}`)
							.join(', ')})
       ${group.items
			.map(i => {
				return `${Array.isArray(i.item) ? i.item.map(i => i.name).join(', ') : i.item.name} - ${Math.floor(
					calcJunkChance(i.lvl, false)
				)}% Junk Chance - Level/Weighting ${i.lvl}`;
			})
			.join('\n       ')}`;
						str += '\n';
					}
					return { attachments: [{ buffer: Buffer.from(str), fileName: 'groups.txt' }] };
				}
			}
		}

		if (user.id !== '157797566833098752' && production && Date.now() < RELEASE_DATE.getTime()) {
			return `Invention will be released at ${time(RELEASE_DATE, 'F')}, ${time(RELEASE_DATE, 'R')}.
In the meantime...
- Read the wiki: <https://bso-wiki.oldschool.gg/skills/invention>
- Think about what items you'll disassemble... doing a varying trips with your biggest (or cheapest) stacks of items is recommended for fast, cheap training.
- Pick which invention you want to aim for first, and focus on getting the materials needed for it!
- ${
				user.skillLevel(SkillsEnum.Crafting) < 90
					? "You don't have 90 Crafting, so you won't be able to train Invention."
					: 'You have 90 Crafting! You can train Invention.'
			}`;
		}

		if (user.skillLevel(SkillsEnum.Crafting) < 90) {
			return "Your minion isn't skilled enough to train Invention, you need level 90 Crafting.";
		}

		if (options.disassemble) {
			return disassembleCommand({
				user,
				itemToDisassembleName: options.disassemble.name,
				quantityToDisassemble: mahojiParseNumber({ input: options.disassemble.quantity, min: 1 }) ?? undefined,
				channelID
			});
		}
		if (options.research) {
			return researchCommand({
				user,
				inputQuantity: options.research.quantity,
				material: options.research.material,
				channelID,
				interaction
			});
		}
		if (options.invent) {
			return inventCommand(user, options.invent.name);
		}

		return 'Invalid command.';
	}
};
