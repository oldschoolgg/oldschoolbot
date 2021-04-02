import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import { minionNotBusy } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GiveawayTable } from '../../lib/typeorm/GiveawayTable.entity';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public runningUsers = new Set<string>();

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '<duration:duration> (items:...TradeableBank)',
			usageDelim: ' ',
			description: 'Shows your equipped gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	async run(msg: KlasaMessage, [_duration, [bank]]: [number, [Bank]]) {
		const existingGiveaways = await GiveawayTable.find({ userID: msg.author.id });

		if (existingGiveaways.length > 5) {
			return msg.channel.send(`You cannot have more than 5 giveaways active at a time.`);
		}

		const duration = _duration - Date.now();
		if (duration > Time.Day * 7 || duration < Time.Second * 5) {
			return msg.send(
				`Your giveaway cannot last longer than 7 days, or be faster than 5 seconds.`
			);
		}
		const finishDate = Date.now() + duration;

		if (!msg.author.bank().fits(bank)) {
			return msg.send(`You don't own those items.`);
		}

		const group = await msg.makeGroup({
			onCancel: () => `${msg.author.username} cancelled the giveaway.`,
			emojis: {
				cancel: '705972260950769669',
				start: '705973302719414329',
				join: '705971600956194907'
			},
			duration,
			messageContent: users =>
				`**${msg.author.username} has created a giveaway!**\n\n**Items:** ${bank}\n**Users Joined:** ${users.length}`,
			ironmenAllowed: false
		});

		const giveaway = new GiveawayTable();
		giveaway.channelID = msg.channel.id;
		giveaway.startDate = new Date();
		giveaway.finishDate = new Date(finishDate);
		giveaway.completed = false;
		giveaway.bank = bank.bank;
		giveaway.userID = msg.author.id;

		await giveaway.save();

		return msg.channel.sendBankImage({
			content: `You created a giveaway that will finish in ${formatDuration(
				duration
			)}, the winner will receive these items.`,
			bank: bank.bank
		});
	}
}
