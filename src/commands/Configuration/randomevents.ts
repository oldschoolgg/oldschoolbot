import { CommandStore, KlasaMessage } from 'klasa';

import { BitField } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

const typeString = (
	pre: string
) => `You didn't specify if you want to enable/disable random events for this server, or for you personally.

- If you disable it for yourself, you won't receive random events, even if the server has them enabled.  Example: \`${pre}randomevents enable\`.`;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text', 'dm'],
			usage: '[enable|disable] ',
			usageDelim: ' ',
			categoryFlags: ['settings', 'minion'],
			examples: ['+randomevents enable', '+randomevents disable'],
			description: 'Allows you to disable receiving random events for yourself.'
		});
	}

	async run(msg: KlasaMessage, [command]: [string | undefined]) {
		if (!command || !['enable', 'disable'].includes(command)) {
			return msg.send(typeString(msg.cmdPrefix));
		}

		const nextBool = command === 'enable' ? false : true;
		const currentStatus = msg.author.settings
			.get(UserSettings.BitField)
			.includes(BitField.DisabledRandomEvents);

		if (currentStatus === nextBool) {
			return msg.send(
				`Random events are already ${!currentStatus ? 'enabled' : 'disabled'} for you.`
			);
		}

		await msg.author.settings.update(UserSettings.BitField, BitField.DisabledRandomEvents);

		return msg.send(`Random events are now ${!nextBool ? 'enabled' : 'disabled'} for you.`);
	}
}
