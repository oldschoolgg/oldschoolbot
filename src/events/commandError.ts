import { Command, Event, KlasaMessage, util } from 'klasa';
import { DiscordAPIError, HTTPError, MessageEmbed, TextChannel, User } from 'discord.js';

import { Channel, Emoji, rootFolder } from '../lib/constants';
import { inlineCodeblock } from '../lib/util';

export default class extends Event {
	public async run(msg: KlasaMessage, command: Command, _: string[], error: string | Error) {
		if (typeof error === 'string') {
			return msg.send(error);
		}
		msg.send(`An unexpected error occurred ${Emoji.Sad}`);

		await this._sendErrorChannel(msg, command, error);
	}

	private async _sendErrorChannel(message: KlasaMessage, command: Command, error: Error) {
		let output: string;

		if (error.name === 'AbortError') {
			try {
				return await message.send(
					`Oops! I had a network issue trying to respond to your command. Please try again.`
				);
			} catch (_) {}
		}

		this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);

		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			output = [
				`${inlineCodeblock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCodeblock('Path      ::')} ${error.path}`,
				`${inlineCodeblock('Code      ::')} ${error.code}`,
				`${inlineCodeblock('Arguments ::')} ${
					message.params.length ? `[\`${message.params.join('`, `')}\`]` : 'Not Supplied'
				}`,
				`${inlineCodeblock('Error     ::')} ${util.codeBlock('js', error.stack || error)}`
			].join('\n');
		} else {
			output = [
				`${inlineCodeblock('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCodeblock('Arguments ::')} ${
					message.params.length ? `[\`${message.params.join('`, `')}\`]` : 'Not Supplied'
				}`,
				`${inlineCodeblock('Error     ::')} ${util.codeBlock('js', error.stack || error)}`
			].join('\n');
		}

		// If in development, send the error to the developers DM.
		const channel = await (this.client.production
			? this.client.channels.get(Channel.ErrorLogs)
			: (this.client.owners.values().next().value as User).createDM());

		(channel as TextChannel).send(
			new MessageEmbed()
				.setDescription(output)
				.setColor(0xfc1020)
				.setAuthor(
					message.author.tag,
					message.author.displayAvatarURL({ size: 64 }),
					message.url
				)
				.setTimestamp()
		);
	}
}
