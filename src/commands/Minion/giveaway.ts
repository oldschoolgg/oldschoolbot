import { Duration } from '@sapphire/time-utilities';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import { ironsCantUse, minionNotBusy } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GiveawayTable } from '../../lib/typeorm/GiveawayTable.entity';
import { formatDuration } from '../../lib/util';

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
			aliases: ['gstart', 'g']
		});
	}

	@minionNotBusy
	@ironsCantUse
	async run(msg: KlasaMessage, [string, [bank]]: [string, [Bank]]) {
		const existingGiveaways = await GiveawayTable.find({
			userID: msg.author.id,
			completed: false
		});

		if (existingGiveaways.length > 5) {
			return msg.channel.send(`You cannot have more than 5 giveaways active at a time.`);
		}

		if (!msg.guild) {
			return msg.send(`You cannot make a giveaway outside a server.`);
		}

		if (!msg.author.bank().fits(bank)) {
			return msg.send(`You don't own those items.`);
		}

		if (bank.items().some(i => i[0].id >= 40_000 && i[0].id <= 45_000)) {
			return msg.send(`You are trying to sell unsellable items.`);
		}

		await msg.confirm(
			`Are you sure you want to do a giveaway with those items? You cannot cancel the giveaway or retrieve the items back afterwards.`
		);

		const duration = new Duration(string);
		const ms = duration.offset;
		if (!ms || ms > Time.Day * 7 || ms < Time.Second * 5) {
			return msg.send(
				`Your giveaway cannot last longer than 7 days, or be faster than 5 seconds.`
			);
		}

		const reaction = msg.guild.emojis.random();
		await msg.author.removeItemsFromBank(bank);

		const giveaway = new GiveawayTable();
		giveaway.channelID = msg.channel.id;
		giveaway.startDate = new Date();
		giveaway.finishDate = duration.fromNow;
		giveaway.completed = false;
		giveaway.bank = bank.bank;
		giveaway.userID = msg.author.id;
		giveaway.reactionID = reaction.id;
		giveaway.duration = duration.offset;

		const message = await msg.channel.sendBankImage({
			content: `You created a giveaway that will finish in ${formatDuration(
				duration.offset
			)}, the winner will receive these items.
			
React to this messsage with ${reaction} to enter.`,
			bank: bank.bank,
			title: `${msg.author.username}'s Giveaway`
		});

		giveaway.messageID = message.id;
		await giveaway.save();

		await message.react(reaction);
		return message;
	}
}
