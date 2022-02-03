import { Permissions } from 'discord.js';
import { KlasaMessage, Monitor, MonitorStore, Stopwatch } from 'klasa';

import { getGuildSettings, syncNewUserUsername } from '../lib/settings/settings';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { BotCommand } from '../lib/structures/BotCommand';
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
		if (!message.commandText && message.prefix === this.client.mentionPrefix) {
			return this.sendPrefixReminder(message);
		}
		if (!message.commandText || !message.channel.postable || !message.command) return undefined;

		return this.runCommand(message);
	}

	public async sendPrefixReminder(message: KlasaMessage) {
		const settings = await getGuildSettings(message.guild!);

		if (message.guild !== null) {
			const staffOnlyChannels = settings.get(GuildSettings.StaffOnlyChannels);
			if (
				!message.member ||
				(staffOnlyChannels.includes(message.channel.id) &&
					!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
			) {
				return;
			}
		}

		const prefix = settings.get(GuildSettings.Prefix);
		return message.channel.send(
			`The prefix${
				Array.isArray(prefix)
					? `es for this guild are: ${prefix.map(pre => `\`${pre}\``).join(', ')}`
					: ` in this guild is set to: \`${prefix}\``
			}`
		);
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

		const inhibitedReason = await preCommand({
			abstractCommand,
			userID,
			channelID,
			guildID
		});

		if (inhibitedReason) {
			return msg.channel.send(inhibitedReason);
		}

		let error: Error | string | null = null;

		try {
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
			await postCommand({
				abstractCommand,
				userID,
				guildID,
				channelID,
				error,
				args: msg.args,
				msg,
				isContinue: false
			});
		}

		return response;
	}
}
