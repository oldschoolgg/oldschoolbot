
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
		if (msg.channel.id === '963954209768763433') {
			const mentions = msg.mentions.users.array();
			
			if (mentions.length !== 3) return msg.channel.send(`You didn't mention 3 people.`);
			const withoutTicket = mentions.find(u => !u.cl().has('Bingo ticket'))
			if (withoutTicket) return msg.channel.send(`${withoutTicket} hasn't bought a ticket.`)
			return msg.channel.send(`**Team Submission:**
${mentions.map(u => `${u.username}[${u.id}]`).join('\n')}`)
		}
		return msg.channel.send(str);
	}
}
