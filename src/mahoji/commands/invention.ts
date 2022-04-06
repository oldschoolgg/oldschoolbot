import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Items } from 'oldschooljs';

import { client } from '../..';
import { allItemsThatCanBeDisassembledIDs, DisassemblySourceGroups, MaterialType } from '../../lib/invention';
import { handleDisassembly } from '../../lib/invention/disassemble';
import { calcPerHour, clamp, formatDuration, toKMB } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { OSBMahojiCommand } from '../lib/util';

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
						return user
							.bank()
							.items()
							.filter(
								i =>
									allItemsThatCanBeDisassembledIDs.has(i[0].id) &&
									(!value ? true : i[0].name.toLowerCase().includes(value.toLowerCase()))
							)
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
		}
	],
	run: async ({
		userID,
		options
	}: CommandRunOptions<{
		disassemble?: { name: string; quantity?: number };
		missing?: {};
		duplicates?: {};
		chances?: {};
	}>) => {
		const user = await client.fetchUser(userID);
		if (options.disassemble) {
			const item = getOSItem(options.disassemble.name);
			const group = DisassemblySourceGroups.find(g => g.items.some(i => i.item.name === item.name));
			if (!group) return 'This item cannot be disassembled.';
			const bank = user.bank();
			const timePer = Time.Second * 0.33;
			const maxCanDo = Math.floor(user.maxTripLength() / timePer);
			const quantity = clamp(options.disassemble.quantity ?? bank.amount(item.id), 1, maxCanDo);
			const duration = quantity * timePer;
			const result = await handleDisassembly({ user, quantity, item, group });
			await user.removeItemsFromBank(new Bank().add(item.name, quantity));
			return `You disassembled ${quantity}x ${item.name}, and received ${result.xp} XP and these materials: \`${
				result.materials
			}\`. It took ${formatDuration(duration)}, giving ${toKMB(calcPerHour(result.xp, duration))}XP/hr`;
		}
		if (options.missing) {
			const missingItems = [];
			for (let item of Items) {
				if (!item[1].tradeable || !item[1].tradeable_on_ge) continue;
				const { name } = item[1];
				const group = DisassemblySourceGroups.find(g => g.items.some(i => i.item.name === name));
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
					foundItems.includes(itm.item.id)
						? duplicateItems.push({ name: itm.item.name, group: group.name })
						: foundItems.push(itm.item.id);
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
		return 'Wut da hell';
	}
};
