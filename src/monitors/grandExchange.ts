import { KlasaMessage, Monitor, MonitorStore } from 'klasa';

import { Channel, SupportServer } from '../lib/constants';

const filteredCustomEmojis = ['redAlarm', 'blueAlarm'];
const filteredEmojisRegex = filteredCustomEmojis.map(emoji => new RegExp(`<a?:${emoji}:\\d+>`));

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { enabled: true, ignoreOthers: false });
		this.enabled = this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			(msg.channel.id !== Channel.GrandExchange && msg.channel.id !== Channel.GrandExchange)
		) {
			return;
		}

		const reasons = [];
		let failed = false;
		if (
			[
				'seling',
				'sale',
				'sell',
				'buy',
				'wts',
				'wtb',
				'buying',
				'selling',
				'trading',
				'trade',
				'swap',
				'swapping'
			].every(str => !msg.content.toLowerCase().includes(str))
		) {
			reasons.push('does not contain the words **buying** or **selling**');
			failed = true;
		}
		if (msg.content.split(/\r\n|\r|\n/).length > 10) {
			reasons.push('is more than 10 lines long');
			failed = true;
		}
		if (msg.cleanContent.length > 450) {
			reasons.push(`is more than 450 characters long (message length: ${msg.content.length})`);
			failed = true;
		}
		if (filteredEmojisRegex.some(regex => msg.content.match(regex))) {
			reasons.push('contains one or more blacklisted emojis');
			failed = true;
		}
		if (failed) {
			await msg.delete();
			await msg.author.send(
				`Your message was automatically removed from the grand exchange channel, because it *${reasons.join(
					', '
				)}*.${
					msg.cleanContent.length > 450
						? '\n\n**Note:** Custom emojis use up a lot of characters because they are internally represented with their unique ID as well.'
						: ''
				}\n\nPlease take a second to read the rules here: https://discordapp.com/channels/342983479501389826/682996313209831435/706772870923288618`
			);
		}
	}
}
