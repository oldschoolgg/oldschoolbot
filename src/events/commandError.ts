import { KlasaMessage, Command, Event, util } from 'klasa';
import { DiscordAPIError, HTTPError, MessageEmbed, TextChannel } from 'discord.js';

import { rootFolder, Channel, Emoji } from '../lib/constants';
import { inlineCodeblock } from '../lib/util';

export default class extends Event {
	public async run(msg: KlasaMessage, command: Command, _: string[], error: string | Error) {
		if (command.oneAtTime && this.client.oneCommandAtATimeCache.has(msg.author.id)) {
			this.client.oneCommandAtATimeCache.delete(msg.author.id);
		}

		if (typeof error === 'string') {
			return msg.send(error);
		} else {
			msg.send(`An unexpected error occurred ${Emoji.Sad}`);
		}

		await this._sendErrorChannel(msg, command, error);
	}

	private async _sendErrorChannel(message: KlasaMessage, command: Command, error: Error) {
		this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
		let output: string;
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

		const channel = this.client.channels.get(Channel.ErrorLogs);

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
