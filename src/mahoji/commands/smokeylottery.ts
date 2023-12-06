import { clamp } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';

import { production, SupportServer } from '../../config';
import { smokeyLotteryMaxTickets, smokeyLotterySchema } from '../../lib/christmasEvent';
import { Roles } from '../../lib/constants';
import { OSBMahojiCommand } from '../lib/util';

export const smokeyLotteryCommand: OSBMahojiCommand = {
	name: 'smokeylottery',
	description: 'Management only command.',
	guildID: SupportServer,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set_pethunt_tickets',
			description: 'Set the amount of pethunt tickets someone has',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'the user',
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'total_tickets',
					description: 'the total pet hunt tickets they have',
					required: true,
					min_value: 0,
					max_value: smokeyLotteryMaxTickets.petHuntTickets
				}
			]
		}
	],
	run: async ({
		options,
		guildID,
		user
	}: CommandRunOptions<{
		set_pethunt_tickets: {
			user: MahojiUserOption;
			total_tickets: number;
		};
	}>) => {
		if (!guildID) return null;
		const guild = globalClient.guilds.cache.get(SupportServer);
		const member = guild?.members.cache.get(user.id);
		if (!member) return null;
		if (production && !member.roles.cache.has(Roles.EventOrganizer)) {
			return { content: 'You do not have permission to use this command.', ephemeral: true };
		}

		const target = options.set_pethunt_tickets.user.user.id;
		const amount = clamp(options.set_pethunt_tickets.total_tickets, 0, smokeyLotteryMaxTickets.petHuntTickets);
		if (!target || !amount) return null;
		const targetUser = await mUserFetch(target);
		const currentTickets = targetUser.smokeyLotteryData();
		const newData = {
			...currentTickets,
			petHuntTickets: amount
		};
		smokeyLotterySchema.parse(newData);
		await targetUser.update({
			smokey_lottery_tickets: newData
		});

		return `<:smokeyticket:1176941131083300884> ${targetUser.mention} was given ${
			newData.petHuntTickets - currentTickets.petHuntTickets
		} Smokey Lottery tickets!`;
	}
};
