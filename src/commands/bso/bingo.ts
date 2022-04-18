import { time } from '@discordjs/builders';
import { noOp, Time } from 'e';
import { KlasaMessage } from 'klasa';

import { bingoIsActive, determineBingoProgress } from '../../lib/bingo';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export const bingoStart = 1_650_286_800_000;
const end = bingoStart + Time.Day * 7 * 2;

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
		if (msg.channel.id === '963954209768763433') {
			msg.delete().catch(noOp);
			const mentions = msg.mentions.users.array();

			if (mentions.length !== 3) return msg.channel.send("You didn't mention 3 people.");
			const withoutTicket = mentions.find(u => !u.cl().has('Bingo ticket'));
			if (withoutTicket) return msg.channel.send(`${withoutTicket} hasn't bought a ticket.`);
			return msg.channel.send(`**Team Submission by ${msg.author}:**
${mentions.map(u => `${u.username}[${u.id}]`).join('\n')}`);
		}

		if (!bingoIsActive()) {
			return msg.channel.send(`Bingo start: ${time(bingoStart / 1000)}`);
		}
		const { tilesCompleted, bingoTableStr } = determineBingoProgress(msg.author.settings.get(UserSettings.TempCL));

		const str = `**#1 - BSO Bingo**
**Start:** ${time(bingoStart / 1000)}
**Finish:** ${time(end / 1000)}

You have completed tiles: ${tilesCompleted}
${bingoTableStr}`;
		return msg.channel.send(str);
	}
}
