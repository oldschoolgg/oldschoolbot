import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { client } from '../..';
import { econBank } from '../../lib/econbank';
import { allItemsThatCanBeDisassembledIDs, DisassemblySourceGroups, MaterialType } from '../../lib/invention';
import { bankDisassembleAnalysis, findDisassemblyGroup, handleDisassembly } from '../../lib/invention/disassemble';
import { SkillsEnum } from '../../lib/skilling/types';
import { formatDuration } from '../../lib/util';
import { getItem } from '../../lib/util/getOSItem';
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
						const user = await client.fetchUser(id);
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
			name: 'missing',
			description: 'Find missing items',
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: 'duplicates',
			description: 'Find duplicate items',
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: 'chances',
			description: 'Find missing part chances',
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
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{
		disassemble?: { name: string; quantity?: number };
		missing?: {};
		duplicates?: {};
		chances?: {};
		analyzebank?: {};
		missingitems?: {};
	}>) => {
		const user = await client.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		if (options.disassemble) {
			const item = getItem(options.disassemble.name);
			if (!item) return "That's not a valid item.";
			const group = findDisassemblyGroup(item);
			if (!group) return 'This item cannot be disassembled.';
			const result = handleDisassembly({
				user: mahojiUser,
				inputQuantity: options.disassemble.quantity,
				item
			});
			if (result.error !== null) return result.error;
			await user.removeItemsFromBank(result.cost);
			const xpStr = await user.addXP({
				skillName: SkillsEnum.Invention,
				amount: result.xp,
				duration: result.duration,
				multiplier: false
			});
			console.log(xpStr);
			return `${xpStr}
**Disassembled:** ${result.quantity}x ${item.name}
**Junk Chance:** ${result.junkChance.toFixed(2)}%
**Materials Received:** ${result.materials}
**XP:** ${result.xp}
**XP/Hr:** ${result.xpHr}
**Duration:** ${formatDuration(result.duration)}`;
		}
		if (options.missing) {
			const missingItems = [];
			for (let item of Items) {
				if (!item[1].tradeable || !item[1].tradeable_on_ge) continue;
				const { name } = item[1];
				const group = findDisassemblyGroup(item[1]);
				if (!group) missingItems.push(name);
			}
			console.log(missingItems);
			return `Found ${missingItems.length} missing items in Groups.`;
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
		if (options.chances) {
			const missingChances = [];
			let totalGroups = 0;
			for (let group of DisassemblySourceGroups) {
				totalGroups += 1;
				let part: MaterialType = 'armadyl';
				for (part in group.parts) {
					if (group.parts[part] === 0) {
						missingChances.push(group.name);
						break;
					}
				}
			}
			console.log(missingChances.sort());
			return `Found ${missingChances.length} Groups missing chance out of ${totalGroups} Groups. (${Math.round(
				(1 - missingChances.length / totalGroups) * 100
			)}% complete)`;
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
