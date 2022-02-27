import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { allItemsThatCanBeDisassembledIDs, DisassemblySourceGroups } from '../../lib/invention';
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
			const group = DisassemblySourceGroups.find(g => g.items.some(i => i.item.name === item.name));
			if (!group) return 'This item cannot be disassembled.';
			const bank = user.bank();
			const timePer = Time.Second * 0.33;
			const maxCanDo = Math.floor(user.maxTripLength() / timePer);
			const quantity = clamp(options.disassemble.quantity ?? bank.amount(item.id), 1, maxCanDo);
			const duration = quantity * timePer;
			const result = await handleDisassembly({ user, quantity, item, group });
			return `You disassembled ${quantity}x ${item.name}, and received ${result.xp} XP and these materials: \`${
				result.materials
			}\`. It took ${formatDuration(duration)}, giving ${toKMB(calcPerHour(result.xp, duration))}XP/hr`;
		}
		return 'Wut da hell';
	}
};
