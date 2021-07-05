import { Command, KlasaMessage } from 'klasa';

export default class extends Command {
	async run(msg: KlasaMessage) {
		return msg.channel.send('https://www.oldschool.gg/oldschoolbot/faq');
	}
}
