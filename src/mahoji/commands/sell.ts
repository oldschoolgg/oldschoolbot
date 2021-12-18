import { ApplicationCommandOptionType, CommandRunOptions, ICommand } from 'mahoji';
import { Bank } from 'oldschooljs';

import { prisma } from '../../lib/settings/prisma';
import { sorts } from '../../lib/sorts';
import getOSItem from '../../lib/util/getOSItem';

async function getBank(userID: string) {
	const result = await prisma.user.findFirst({
		where: {
			id: userID
		},
		select: {
			bank: true
		}
	});
	const bank = new Bank(result ? (result.bank as any) : undefined);
	return bank;
}

export const command: ICommand = {
	name: 'sell',
	description: 'Sell an item from your bank',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'item',
			description: 'The item you want to sell',
			autocomplete: async (value, member) => {
				return (await getBank(member.user.id))
					.items()
					.filter(([i]) => i.name.toLowerCase().includes(value))
					.sort(sorts.value)
					.slice(0, 10)
					.map(([item, qty]) => ({
						name: `${qty}x ${item.name}`,
						value: item.id.toString()
					}));
			},
			required: true
		}
	],
	run: async ({ member, options }: CommandRunOptions<{ item: string }>) => {
		const item = getOSItem(options.item);
		const bank = await getBank(member.user.id);
		return `You sold ${bank.amount(item.id)}x ${item.name}.`;
	}
};
