import { EmbedBuilder } from '@discordjs/builders';
import { increaseNumByPercent, randArrItem, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { halloweenShop } from '../../lib/halloween/halloween';
import { prisma } from '../../lib/settings/prisma';
import { mortimerStartMessages } from '../../lib/simulation/maledictMortimer';
import { MortimerOptions } from '../../lib/types/minions';
import { murMurSort } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { dateFm } from '../../lib/util/smallUtils';
import { OSBMahojiCommand } from '../lib/util';

export const halloweenCommand: OSBMahojiCommand = {
	name: 'halloween',
	description: 'The Halloween 2023 event.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your halloween progress.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'shop',
			description: 'View the shop, or buy an item with your halloween currency.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'buy_item',
					description: 'The item to buy.',
					required: false,
					autocomplete: async value => {
						return halloweenShop
							.filter(buyable =>
								!value ? true : buyable.item?.name.toLowerCase().includes(value.toLowerCase())
							)
							.map(i => ({ name: i.item!.name, value: i.item!.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'fight_mortimer',
			description: 'Send your minion to fight Maledict Mortimer.',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'trick',
			description: 'Trick a user into thinking they got a rare drop from Maledict Mortimer.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user to trick.',
					required: true
				}
			]
		}
	],
	run: async ({
		interaction,
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		trick?: { user: MahojiUserOption };
		view?: {};
		fight_mortimer: {};
		shop?: { buy_item?: string };
	}>) => {
		const user = await mUserFetch(userID);

		if (options.view) {
			return `You have found a total of: ${user.cl.amount('Splooky fwizzle')}x Splooky fwizzle.
You currently have: ${user.bank.amount('Splooky fwizzle')}x Splooky fwizzle.

You have bought ${halloweenShop.filter(i => user.cl.has(i.item!.id)).length}/${
				halloweenShop.length
			} of the Halloween store items.

**Spookiness**: ${murMurSort([13, 53, 12, 100, 1, 23, 35, 5, 23, 44, 34, 23, 14], user.id)[0]}%
**Evilness**: ${murMurSort([1, 5, 23, 55, 14, 22, 12, 52, 99, 34, 23], user.id)[0]}%
`;
		}

		if (options.shop) {
			if (!options.shop.buy_item) {
				return `<:Pumpkin:764130154662199347> **Halloween Shop** 👻

${halloweenShop
	.map(buyable => `**${buyable.item!.name}**: ${buyable.description} Costs ${buyable.cost}x Splooky fwizzle`)
	.join('\n')}`;
			}
			const buyable = halloweenShop.find(
				i => i.item!.name.toLowerCase() === options.shop!.buy_item!.toLowerCase()
			);
			if (!buyable) {
				return 'Invalid item.';
			}
			let { cost } = buyable;

			// Increase cost by 25% for each owned
			for (let i = 0; i < user.cl.amount(buyable.item!.id); i++) {
				let increasePercent = 25;
				if (buyable.item!.name === 'Spooky aura') increasePercent = 450;
				cost = Math.floor(increaseNumByPercent(cost, increasePercent));
			}

			const itemCost = new Bank().add('Splooky fwizzle', cost);

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to buy ${buyable.item!.name} for ${itemCost}?`
			);

			if (!user.owns(itemCost)) {
				return `You need ${itemCost} to buy ${buyable.item!.name}.`;
			}

			await user.transactItems({
				itemsToAdd: new Bank().add(buyable.item!.id),
				itemsToRemove: itemCost,
				collectionLog: true
			});

			return `Bought ${buyable.item!.name} for ${itemCost}.`;
		}

		if (options.fight_mortimer) {
			if (minionIsBusy(user.id)) return `${user.minionName} is busy.`;

			const currentDate = new Date();
			const lastPlayedDate = new Date(Number(user.user.last_mortimer_kill_date));

			if (
				currentDate.getDate() === lastPlayedDate.getDate() &&
				currentDate.getMonth() === lastPlayedDate.getMonth() &&
				currentDate.getFullYear() === lastPlayedDate.getFullYear()
			) {
				const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
				return `You can fight Maledict Mortimer again... ${dateFm(nextDate)}.`;
			}
			const duration = Time.Minute * 10;
			await addSubTaskToActivityTask<MortimerOptions>({
				userID: user.id,
				channelID,
				duration,
				type: 'Mortimer'
			});
			await user.update({
				last_mortimer_kill_date: new Date()
			});

			return {
				embeds: [
					new EmbedBuilder()
						.setImage(
							'https://cdn.discordapp.com/attachments/357422607982919680/1159790935236943893/Maledict_Mortimer.png'
						)
						.setAuthor({ name: 'Maledict Mortimer' })
						.setDescription(`${randArrItem(mortimerStartMessages)}`)
				]
			};
		}

		if (options.trick) {
			const userToTrick = await mUserFetch(options.trick.user.user.id);
			if (user.id === userToTrick.id) {
				return 'You cannot trick yourself.';
			}

			const cost = new Bank().add("Fool's ace");
			if (!user.owns(cost)) {
				return `You need ${cost} to trick someone.`;
			}

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to trick ${userToTrick.rawUsername}? ${cost} will be removed from your bank.`
			);

			await user.removeItemsFromBank(cost);
			await prisma.mortimerTricks.create({
				data: {
					trickster_id: user.id,
					target_id: userToTrick.id
				}
			});

			return "You used your Fool's ace, on the targets next trip, they will receive a fake drop.";
		}

		return 'Invalid command.';
	}
};
