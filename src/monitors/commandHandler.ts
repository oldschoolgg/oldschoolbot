import { KlasaMessage, Monitor, MonitorStore, Stopwatch } from 'klasa';

import { PermissionLevelsEnum } from '../lib/constants';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { floatPromise } from '../lib/util';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: !store.client.options.commandEditing
		});
	}

	public async run(message: KlasaMessage) {
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
		this.client.emit('commandRun', message, message.command, message.args);

		return this.runCommand(message);
	}

	public async sendPrefixReminder(message: KlasaMessage) {
		if (message.guild !== null) {
			const staffOnlyChannels = message.guild.settings.get(GuildSettings.StaffOnlyChannels);
			if (
				staffOnlyChannels.includes(message.channel.id) &&
				!(await message.hasAtLeastPermissionLevel(PermissionLevelsEnum.Moderator))
			) {
				return;
			}
		}
		const prefix = message.guildSettings.get(GuildSettings.Prefix);
		return message.sendLocale('PREFIX_REMINDER', [prefix.length ? prefix : undefined]);
	}

	public async runCommand(message: KlasaMessage) {
		const timer = new Stopwatch();
		if (this.client.options.typing) floatPromise(this, message.channel.startTyping());

		try {
			await this.client.inhibitors.run(message, message.command!);
			if (message.command!.oneAtTime) {
				this.client.oneCommandAtATimeCache.add(message.author.id);
			}
			try {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore 2341
				await message.prompter!.run();
				try {
					const subcommand = message.command!.subcommands
						? message.params.shift()
						: undefined;

					const commandRun = subcommand
						? // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
						  // @ts-ignore 7053
						  message.command![subcommand](message, message.params)
						: message.command!.run(message, message.params);
					timer.stop();
					const response = await commandRun;
					floatPromise(
						this,
						this.client.finalizers.run(message, message.command!, response, timer)
					);
					this.client.emit(
						'commandSuccess',
						message,
						message.command,
						message.params,
						response
					);
				} catch (error) {
					this.client.emit(
						'commandError',
						message,
						message.command,
						message.params,
						error
					);
				}
			} catch (argumentError) {
				this.client.emit(
					'argumentError',
					message,
					message.command,
					message.params,
					argumentError
				);
			} finally {
				if (message.command!.oneAtTime) {
					setTimeout(
						() => this.client.oneCommandAtATimeCache.delete(message.author.id),
						1500
					);
				}
			}
		} catch (response) {
			return this.client.emit('commandInhibited', message, message.command, response);
		}
		if (this.client.options.typing) message.channel.stopTyping();
	}
}
