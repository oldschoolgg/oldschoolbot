import { inlineCode } from '@discordjs/builders';
import * as Sentry from '@sentry/node';
import { DiscordAPIError, HTTPError, MessageEmbed, User } from 'discord.js';
import { Command, Event, KlasaMessage, util } from 'klasa';

import { Emoji, rootFolder, SILENT_ERROR } from '../lib/constants';
import { cleanMentions } from '../lib/util';

export default class extends Event {
	public async run(msg: KlasaMessage, command: Command, _: string[], error: string | Error) {
		if (error instanceof Error && error.message === SILENT_ERROR) {
			return;
		}
		if (typeof error === 'string') {
			return msg.channel.send(cleanMentions(msg.guild ?? null, error));
		}
		msg.channel.send(`An unexpected error occurred ${Emoji.Sad}`);

		await this._sendErrorChannel(msg, command, error);
	}

	private async _sendErrorChannel(message: KlasaMessage, command: Command, error: Error) {
		let output: string = '';

		if (error.name === 'AbortError') {
			try {
				return await message.channel.send(
					'Oops! I had a network issue trying to respond to your command. Please try again.'
				);
			} catch (_) {}
		}

		this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack ?? error.name}`);
		Sentry.captureException(error, {
			user: {
				id: message.author.id
			},
			tags: {
				command: command.name,
				args: message.args.join(', ')
			}
		});

		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			output = [
				`${inlineCode('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCode('Path      ::')} ${error.path}`,
				`${inlineCode('Code      ::')} ${error.code}`,
				`${inlineCode('Arguments ::')} ${
					message.params.length ? `[\`${message.params.join('`, `')}\`]` : 'Not Supplied'
				}`,
				`${inlineCode('Error     ::')} ${util.codeBlock('js', error.stack || error)}`
			].join('\n');
		} else {
			output = [
				`${inlineCode('Command   ::')} ${command.path.slice(rootFolder.length)}`,
				`${inlineCode('Arguments ::')} ${
					message.params.length ? `[\`${message.params.join('`, `')}\`]` : 'Not Supplied'
				}`,
				`${inlineCode('Error     ::')} ${util.codeBlock('js', error.stack || error)}`
			].join('\n');
		}

		if (!this.client.production) {
			// If in development, send the error to the developers DM.
			const channel = await (this.client.owners.values().next().value as User).createDM();

			channel.send({
				embeds: [
					new MessageEmbed()
						.setDescription(output)
						.setColor(0xfc_10_20)
						.setAuthor(
							message.author.tag,
							message.author.displayAvatarURL({
								size: 64
							}),
							message.url
						)
						.setTimestamp()
				]
			});
		}
	}
}
