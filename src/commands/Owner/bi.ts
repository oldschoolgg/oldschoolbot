import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<bank:str>',
			permissionLevel: 10
		});
	}

	async run(msg: KlasaMessage, [str]: [string]) {
		const bank = JSON.parse(str.replace(/'/g, '"'));
		return msg.channel.sendBankImage({ bank });
	}
}
