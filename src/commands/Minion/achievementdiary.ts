import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { diaries, userhasDiaryTier } from '../../lib/diaries';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches, toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'Sends your minion to do barbarian assault, or buy rewards and gamble.',
			examples: ['+barbassault [start]'],
			subcommands: true,
			usage: '[claim] [diaryName:...str]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(`fdasssssssssssss`);
	}

	async claim(msg: KlasaMessage, [input = '']: [string | undefined]) {
		const diary = diaries.find(d => stringMatches(d.name, input));

		if (!diary) {
			return msg.channel.send(diaries.map(d => d.name));
		}

		const userBank = msg.author.bank();

		for (const tier of [diary.easy, diary.medium, diary.hard, diary.elite]) {
			const [canDo, reason] = await userhasDiaryTier(msg.author, tier);
			const name = `${toTitleCase(tier.name)} ${diary.name} Diary`;

			if (canDo) {
				if (userBank.has(tier.item.id)) continue;
				await msg.author.addItemsToBank(new Bank().add(tier.item.id), true);
				return msg.channel.send(
					`You successfully claimed a ${tier.item.name} from the ${name}.`
				);
			}

			return msg.channel.send(`You can't claim the ${name} because ${reason}.`);
		}
	}
}
