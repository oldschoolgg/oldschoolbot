import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { allItemsThatCanBeDisassembledIDs, DissassemblySourceGroups } from '../../lib/invention';
import { handleDisassembly } from '../../lib/invention/disassemble';
import { clamp } from '../../lib/util';
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
					autocomplete: async (value, member) => {
						const user = await client.fetchUser(member.user.id);
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
		}
	],
	run: async ({ member, options }: CommandRunOptions<{ disassemble?: { name: string; quantity?: number } }>) => {
		const user = await client.fetchUser(member.user.id);
		if (options.disassemble) {
			const item = getOSItem(options.disassemble.name);
			const group = DissassemblySourceGroups.find(g => g.items.some(i => i.item.name === item.name));
			if (!group) return 'This item cannot be disassembled.';
			const bank = user.bank();
			const quantity = clamp(options.disassemble.quantity ?? bank.amount(item.id), 1, 1_000_000_000);
			const result = await handleDisassembly({ user, quantity, item, group });
			return `You disassembled ${quantity}x ${item.name}, and received ${result.xp} XP and ${result.materials}.`;
		}
		return 'Wut da hell';
	}
};
