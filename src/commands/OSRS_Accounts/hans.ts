import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			description:
				'Shows the creation date/avg playtime of your account. See: https://i.imgur.com/PPviStZ.png',
			usage: '[playtime:int{1,10000}] [arrival:int{1,10000}]',
			usageDelim: ' ',
			examples: ['+hans 197 1016'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [playtime, arrival]: [number, number]) {
		if (!playtime || !arrival) {
			return msg.send('You can use this command like this: https://i.imgur.com/PPviStZ.png');
		}

		const days = arrival * Time.Day;
		const createdAt = Date.now() - days;

		const avg = ((playtime * 24) / arrival).toFixed(2);

		return msg.send(`
  Your account was made on: ${new Date(
		createdAt
  ).toUTCString()}, and you've played an average of ${avg} Hours per day.`);
	}
}
