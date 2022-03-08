import { Duration } from '@sapphire/time-utilities';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { ironsCantUse, minionNotBusy } from '../../lib/minions/decorators';
import { prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration } from '../../lib/util';
import { logError } from '../../lib/util/logError';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '<duration:str> (items:...TradeableBank)',
			usageDelim: ' ',
			description: 'Allows you to do a giveaway of items.',
			examples: ['+giveaway 5m Twisted bow, 20 Shark'],
			categoryFlags: ['minion', 'utility'],
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

		await msg.confirm(
			'Are you sure you want to do a giveaway with those items? You cannot cancel the giveaway or retrieve the items back afterwards.'
		);

		const duration = new Duration(string);
		const ms = duration.offset;
		if (!ms || ms > Time.Day * 7 || ms < Time.Second * 5) {
			return msg.channel.send('Your giveaway cannot last longer than 7 days, or be faster than 5 seconds.');
		}

		await msg.guild.emojis.fetch();
		const reaction = msg.guild.emojis.cache.random();
		if (!reaction) {
			return msg.channel.send(
				"Couldn't retrieve emojis for this guild, ensure you have some emojis and try again."
			);
		}

		const message = await msg.channel.sendBankImage({
			content: `You created a giveaway that will finish in ${formatDuration(
				duration.offset
			)}, the winner will receive these items.
			
React to this messsage with ${reaction} to enter.`,
			bank,
			title: `${msg.author.username}'s Giveaway`
		});

		const dbData = {
			channel_id: msg.channel.id,
			start_date: new Date(),
			finish_date: duration.fromNow,
			completed: false,
			loot: bank.bank,
			user_id: msg.author.id,
			reaction_id: reaction.id,
			duration: duration.offset,
			message_id: message.id
		};

		try {
			await prisma.giveaway.create({
				data: dbData
			});
		} catch (err: any) {
			logError(err, {
				user_id: msg.author.id,
				giveaway_data: JSON.stringify(dbData)
			});
			return msg.channel.send('Error starting giveaway. Please report this error.');
		}

		// Wait until the create succeeds to remove items, otherwise they can be lost.
		await msg.author.removeItemsFromBank(bank);
		await message.react(reaction);
		return message;
	}
}
