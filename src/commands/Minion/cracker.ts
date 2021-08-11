import { GuildMember } from 'discord.js';
import { shuffleArr } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { cleanMentions, itemID } from '../../lib/util';

const HatTable = new LootTable()
	.add('Red partyhat', 1, 32)
	.add('Yellow partyhat', 1, 28)
	.add('White partyhat', 1, 23)
	.add('Green partyhat', 1, 20)
	.add('Blue partyhat', 1, 15)
	.add('Purple partyhat', 1, 10);

const JunkTable = new LootTable()
	.add('Chocolate bar', 1, 1 / 5.2)
	.add('Silver bar', 1, 1 / 7.6)
	.add('Spinach roll', 1, 1 / 8)
	.add('Chocolate cake', 1, 1 / 8.6)
	.add('Holy symbol', 1, 1 / 11.7)
	.add('Silk', 1, 1 / 12.2)
	.add('Gold ring', 1, 1 / 13.9)
	.add('Black dagger', 1, 1 / 24.3)
	.add('Law rune', 1, 1 / 25.3);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<member:member>',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Uses a christmas cracker on another player.',
			examples: ['+cracker @Magnaboy'],
			runIn: ['text']
		});
	}

	async run(msg: KlasaMessage, [buyerMember]: [GuildMember]) {
		if (buyerMember.user.isIronman) {
			return msg.channel.send('That person is an ironman, they stand alone.');
		}
		if (buyerMember.user.id === msg.author.id || buyerMember.user.bot) {
			return msg.channel.send('You cant use a cracker on yourself, or a bot.');
		}

		if (buyerMember.user.isBusy) {
			return msg.channel.send('That user is busy right now.');
		}

		await Promise.all([buyerMember.user.settings.sync(true), msg.author.settings.sync(true)]);
		const bank = new Bank(msg.author.settings.get(UserSettings.Bank));
		if (!bank.has('Christmas cracker')) {
			return msg.channel.send("You don't have any Christmas crackers.");
		}

		await msg.confirm(
			`${Emoji.ChristmasCracker} Are you sure you want to use your cracker on them? Either person could get the partyhat! Please confirm if you understand and wish to use it.`
		);

		await msg.author.removeItemFromBank(itemID('Christmas cracker'), 1);
		const winnerLoot = HatTable.roll();
		const loserLoot = JunkTable.roll();
		const [winner, loser] = shuffleArr([buyerMember.user, msg.author]);
		await winner.addItemsToBank(winnerLoot, true);
		await loser.addItemsToBank(loserLoot, true);

		return msg.channel.send(
			cleanMentions(
				msg.guild!,
				`${Emoji.ChristmasCracker} ${msg.author} pulled a Christmas cracker with ${buyerMember} and....\n\n ${winner} received a ${winnerLoot}, ${loser} received a ${loserLoot}.`,
				false
			)
		);
	}
}
