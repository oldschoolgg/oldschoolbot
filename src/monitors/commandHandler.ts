import { KlasaMessage, Monitor, MonitorStore, Stopwatch } from 'klasa';

import { syncNewUserUsername } from '../lib/settings/settings';
import { BotCommand } from '../lib/structures/BotCommand';
import { logError } from '../lib/util/logError';
import { postCommand } from '../mahoji/lib/postCommand';
import { preCommand } from '../mahoji/lib/preCommand';
import { convertKlasaCommandToAbstractCommand } from '../mahoji/lib/util';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: true,
			ignoreBots: false
		});
	}

	public async run(message: KlasaMessage) {
		if (message.guild && message.guild.me === null) {
			await message.guild.members.fetch(this.client.user!.id);
		}
		if (!message.commandText || !message.channel.postable || !message.command) return undefined;

		return this.runCommand(message);
	}

	public async runCommand(msg: KlasaMessage) {
		syncNewUserUsername(msg);

		const command = msg.command! as BotCommand;
		const { params } = msg;

		const timer = new Stopwatch();

		let response: KlasaMessage | null = null;

		const userID = msg.author.id;
		const channelID = msg.channel.id;
		const guildID = msg.guild?.id ?? null;
		const abstractCommand = convertKlasaCommandToAbstractCommand(command);

		let error: Error | string | null = null;
		let inhibited = false;
		try {
			const inhibitedReason = await preCommand({
				abstractCommand,
				userID,
				channelID,
				guildID,
				bypassInhibitors: false
			});

			if (inhibitedReason) {
				inhibited = true;
				if (inhibitedReason.silent) return;
				return msg.channel.send(
					typeof inhibitedReason.reason === 'string'
						? inhibitedReason.reason
						: inhibitedReason.reason.content!
				);
			}

			// @ts-ignore 2341
			await msg.prompter!.run();
			const subcommand = command.subcommands ? params.shift() : undefined;

			const commandRun = subcommand
				? // @ts-ignore 7053
				  command[subcommand](msg, params)
				: command.run(msg, params);
			timer.stop();
			response = await commandRun;
		} catch (err) {
			error = err as Error | string;
		} finally {
			try {
				await postCommand({
					abstractCommand,
					userID,
					guildID,
					channelID,
					error,
					args: msg.args,
					isContinue: false,
					inhibited
				});
			} catch (err) {
				logError(err);
			}
		}

		return response;
	}
}
