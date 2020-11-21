import { MessageReaction } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Emoji } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			examples: ['+poll Should I stake my bank?'],
			description: 'Creates a reaction poll for people to vote on.',
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage) {
		msg.react('380915244760825857')
			.then((react: MessageReaction) => react.message.react('380915244652036097'))
			.catch(() => {
				return msg.send(
					`There was an error ${Emoji.Sad} Do I have permissions to react to messages?`
				);
			});

		return null;
	}
}
