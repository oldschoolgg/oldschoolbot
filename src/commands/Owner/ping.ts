import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			guarded: true,
			permissionLevel: 10
		});
	}

	async run(message: KlasaMessage) {
		const msg = await message.sendLocale('COMMAND_PING');
		return message.sendLocale('COMMAND_PINGPONG', [
			(msg.editedTimestamp || msg.createdTimestamp) -
				(message.editedTimestamp || message.createdTimestamp),
			Math.round(this.client.ws.ping)
		]);
	}
}
