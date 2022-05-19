import { Duration } from '@sapphire/time-utilities';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { ironsCantUse } from '../../lib/minions/decorators';
import { prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addToGPTaxBalance, formatDuration, getSupportGuild, isSuperUntradeable } from '../../lib/util';
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

		const supportServer = getSupportGuild();
		if (!supportServer) return msg.channel.send("Couldn't find support server!");

		// fetch() always calls the API when no id is specified, so only do it sparingly or if needed.
		if (supportServer.emojis.cache.size === 0) {
			await supportServer.fetch();
		}
		const reaction = supportServer.emojis.cache.random();
		if (!reaction || !reaction.id) {
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
			await msg.author.removeItemsFromBank(bank);
		} catch (err: any) {
			return msg.channel.send(err instanceof Error ? err.message : err);
		}
		if (bank.has('Coins')) {
			addToGPTaxBalance(msg.author.id, bank.amount('Coins'));
		}

		try {
			await prisma.giveaway.create({
				data: dbData
			});
		} catch (err: any) {
			logError(err, {
				user_id: msg.author.id,
				giveaway_data: JSON.stringify(dbData)
			});
			return msg.channel.send('Error starting giveaway. Please report this error so you can get refunded.');
		}

		try {
			await message.react(reaction);
		} catch (err: any) {
			if (err.code === 10_014) {
				// Unknown emoji: Remove deleted emoji from the cache so it's not tried next time.
				msg.guild.emojis.cache.delete(reaction.id);
				return msg.channel.send(
					'Error starting giveaway, selected emoji no longer exists. You will be refunded when the giveaway ends.'
				);
			}
			logError(err, { user_id: msg.author.id, emoji_id: reaction.id, guild_id: msg.guild.id });
			return msg.channel.send(
				'Unknown error. You will be refunded when the giveaway ends if the giveaway fails.'
			);
		}
		return message;
	}
}
