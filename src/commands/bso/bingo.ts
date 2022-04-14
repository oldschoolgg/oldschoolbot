
import { time } from '@discordjs/builders';
import { Time } from 'e';
import { KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

const start = 1650286800000;
const end = start + (Time.Day * 7) * 2

export default class extends BotCommand {
	async run(msg: KlasaMessage) {
        const str = `**#1 - BSO Bingo**
**Start:** ${time(start / 1000)}
**Finish:** ${time(end / 1000)}`
		return msg.channel.send(str);
	}
}
