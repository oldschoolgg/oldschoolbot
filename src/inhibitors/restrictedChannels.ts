import { Command, Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage, command: Command) {
		if (!command.restrictedChannels || command.restrictedChannels.length === 0) return;

		if (!command.restrictedChannels.includes(msg.channel.id)) {
			throw `You cannot use this command outside of the bot's support server. Join the bot support server, then use one these channels: ${command.restrictedChannels
				.map(c => `<#${c}>`)
				.join(', ')}.`;
		}

		return false;
	}
}
