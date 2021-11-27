import { command_usage_status } from '@prisma/client';
import { KlasaMessage, Monitor, MonitorStore, Stopwatch } from 'klasa';

import { PermissionLevelsEnum, shouldTrackCommand } from '../lib/constants';
import { prisma } from '../lib/settings/prisma';
import { getGuildSettings } from '../lib/settings/settings';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { floatPromise } from '../lib/util';

const whitelistedBots = [
	'798308589373489172', // BIRDIE#1963
	'902745429685469264' // Randy#0008
];

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: !store.client.options.commandEditing,
			ignoreBots: false
		});
	}

	public async run(message: KlasaMessage) {
		if (message.author.bot && !whitelistedBots.includes(message.author.id)) {
			return;
		}
		if (message.guild && message.guild.me === null) {
			await message.guild.members.fetch(this.client.user!.id);
		}
		if (!message.channel.postable) return undefined;
		if (!message.commandText && message.prefix === this.client.mentionPrefix) {
			return this.sendPrefixReminder(message);
		}
		if (!message.commandText) return undefined;
		if (!message.command) {
			return this.client.emit(
				'commandUnknown',
				message,
				message.commandText,
				message.prefix,
				message.prefixLength
			);
		}
		if (!message.command.enabled) {
			return message.channel.send('That command is currently disabled, please try again later.');
		}
		this.client.emit('commandRun', message, message.command, message.args);

		return this.runCommand(message);
	}

	public async sendPrefixReminder(message: KlasaMessage) {
		const settings = await getGuildSettings(message.guild!);

		if (message.guild !== null) {
			const staffOnlyChannels = settings.get(GuildSettings.StaffOnlyChannels);
			if (
				staffOnlyChannels.includes(message.channel.id) &&
				!(await message.hasAtLeastPermissionLevel(PermissionLevelsEnum.Moderator))
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

	public async runCommand(message: KlasaMessage) {
		const command = message.command!;
		const { params } = message;
		let unChangedParams = [...params];

		const timer = new Stopwatch();

		let commandUsage: {
			date: Date;
			user_id: string;
			command_name: string;
			status: command_usage_status;
			args: null | any;
			channel_id: string;
		} | null = {
			date: message.createdAt,
			user_id: message.author.id,
			command_name: command.name,
			status: command_usage_status.Unknown,
			args: message.args,
			channel_id: message.channel.id
		};

		let response: KlasaMessage | null = null;

		try {
			await this.client.inhibitors.run(message, command);
			if (command.oneAtTime) {
				this.client.oneCommandAtATimeCache.add(message.author.id);
			}
			try {
				// @ts-ignore 2341
				await message.prompter!.run();
				try {
					const subcommand = command.subcommands ? params.shift() : undefined;

					const commandRun = subcommand
						? // @ts-ignore 7053
						  command[subcommand](message, params)
						: command.run(message, params);
					timer.stop();
					response = await commandRun;
					floatPromise(this, this.client.finalizers.run(message, command, response!, timer));
					this.client.emit('commandSuccess', message, command, params, response);
					commandUsage.status = command_usage_status.Success;
				} catch (error) {
					this.client.emit('commandError', message, command, params, error);
					commandUsage.status = command_usage_status.Error;
				}
			} catch (argumentError) {
				this.client.emit('argumentError', message, command, params, argumentError);
				commandUsage = null;
			} finally {
				if (command.oneAtTime) {
					setTimeout(() => this.client.oneCommandAtATimeCache.delete(message.author.id), 1500);
				}
			}
		} catch (res) {
			if (commandUsage) {
				commandUsage.status = command_usage_status.Inhibited;
			}
			this.client.emit('commandInhibited', message, command, res);
		}

		if (commandUsage && shouldTrackCommand(command, unChangedParams)) {
			await prisma.commandUsage.create({ data: commandUsage });
		}

		return response;
	}
}
