import { Duration } from '@sapphire/time-utilities';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { ironsCantUse, minionNotBusy } from '../../lib/minions/decorators';
import { prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, isSuperUntradeable } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '<duration:str> (items:...TradeableBank)',
			usageDelim: ' ',
			description: 'Allows you to do a giveaway of items.',
			examples: ['+giveaway 5m Twisted bow, 20 Shark'],
			categoryFlags: ['minion', 'utility'],
			oneAtTime: true,
			aliases: ['gstart', 'g'],
			requiredPermissionsForBot: ['ADD_REACTIONS']
		});
	}

	@minionNotBusy
	@ironsCantUse
	async run(msg: KlasaMessage, [string, [bank]]: [string, [Bank]]) {
		const existingGiveaways = await prisma.giveaway.findMany({
			where: {
				user_id: msg.author.id,
				completed: false
			}
		});

		if (existingGiveaways.length > 5) {
			return msg.channel.send('You cannot have more than 5 giveaways active at a time.');
		}

		if (!msg.guild) {
			return msg.channel.send('You cannot make a giveaway outside a server.');
		}

		if (!msg.author.bank().fits(bank)) {
			return msg.channel.send("You don't own those items.");
		}

		if (bank.items().some(i => isSuperUntradeable(i[0]))) {
			return msg.channel.send('You are trying to sell unsellable items.');
		}

		await msg.confirm(
			'Are you sure you want to do a giveaway with those items? You cannot cancel the giveaway or retrieve the items back afterwards.'
		);

		const duration = new Duration(string);
		const ms = duration.offset;
		if (!ms || ms > Time.Day * 7 || ms < Time.Second * 5) {
			return msg.channel.send('Your giveaway cannot last longer than 7 days, or be faster than 5 seconds.');
		}

		const reaction = msg.guild.emojis.cache.random();
		await msg.author.removeItemsFromBank(bank);

		const message = await msg.channel.sendBankImage({
			content: `You created a giveaway that will finish in ${formatDuration(
				duration.offset
			)}, the winner will receive these items.
			
React to this messsage with ${reaction} to enter.`,
			bank,
			title: `${msg.author.username}'s Giveaway`
		});

		await prisma.giveaway.create({
			data: {
				channel_id: msg.channel.id,
				start_date: new Date(),
				finish_date: duration.fromNow,
				completed: false,
				loot: bank.bank,
				user_id: msg.author.id,
				reaction_id: reaction.id,
				duration: duration.offset,
				message_id: message.id
			}
		});

		await message.react(reaction);
		return message;
	}
}
