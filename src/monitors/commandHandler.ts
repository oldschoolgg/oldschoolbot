import { Monitor, KlasaClient, MonitorStore, Stopwatch } from 'klasa';
import { KlasaMessage } from 'klasa';
import { util } from 'klasa';

export default class extends Monitor {
	prefixes: Map<any, any>;
	prefixMention: RegExp;
	mentionOnly: RegExp;
	prefixFlags: string;

	public constructor(
		client: KlasaClient,
		store: MonitorStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, { ignoreOthers: false });
		this.ignoreEdits = !this.client.options.commandEditing;
		this.prefixes = new Map();
		this.prefixMention = new RegExp(`^<@!?303730326692429825>`);
		this.mentionOnly = new RegExp(`^<@!?303730326692429825>$`);
		this.prefixFlags = this.client.options.prefixCaseInsensitive ? 'i' : '';
	}

	async run(message: KlasaMessage) {
		if (message.guild && !message.guild.me && this.client.user) {
			await message.guild.members.fetch(this.client.user);
		}

		if (!message.channel.postable) return undefined;
		if (this.mentionOnly.test(message.content))
			return message.sendLocale('PREFIX_REMINDER', [
				message.guild && message.guild.settings.get('prefix').length
					? message.guild.settings.get('prefix')
					: undefined
			]);

		const { commandText, prefix, prefixLength } = this.parseCommand(message);
		if (!commandText) return undefined;

		const command =
			typeof commandText === 'string' ? this.client.commands.get(commandText) : null;

		if (!command) {
			return this.client.emit('commandUnknown', message, commandText, prefix, prefixLength);
		}

		return this.runCommand(
			// @ts-ignore 2341
			message._registerCommand({
				command,
				prefix,
				prefixLength
			})
		);
	}

	parseCommand(message: KlasaMessage) {
		const result =
			this.customPrefix(message) ||
			this.mentionPrefix(message) ||
			this.naturalPrefix(message) ||
			this.prefixLess(message);
		return result
			? {
					commandText: message.content
						.slice(result.length)
						.trim()
						.split(' ')[0]
						.toLowerCase(),
					prefix: result.regex,
					prefixLength: result.length
			  }
			: { commandText: false };
	}

	customPrefix(msg: KlasaMessage) {
		const prefix = msg.guild!.settings.get('prefix');
		if (!prefix) return null;
		for (const prf of Array.isArray(prefix) ? prefix : [prefix]) {
			const testingPrefix = this.prefixes.get(prf) || this.generateNewPrefix(prf);
			if (testingPrefix.regex.test(msg.content)) return testingPrefix;
		}
		return null;
	}

	mentionPrefix({ content }: KlasaMessage) {
		const prefixMention = this.prefixMention.exec(content);
		return prefixMention
			? { length: prefixMention[0].length, regex: this.prefixMention }
			: null;
	}

	naturalPrefix(msg: KlasaMessage) {
		if (!this.client.options.regexPrefix) return null;
		const results = this.client.options.regexPrefix.exec(msg.content);
		return results
			? { length: results[0].length, regex: this.client.options.regexPrefix }
			: null;
	}

	prefixLess({ channel: { type } }: KlasaMessage) {
		return this.client.options.noPrefixDM && type === 'dm' ? { length: 0, regex: null } : null;
	}

	generateNewPrefix(prefix: string) {
		const prefixObject = {
			length: prefix.length,
			regex: new RegExp(`^${util.regExpEsc(prefix)}`, this.prefixFlags)
		};
		this.prefixes.set(prefix, prefixObject);
		return prefixObject;
	}

	async runCommand(message: KlasaMessage) {
		const timer = new Stopwatch();
		if (this.client.options.typing) message.channel.startTyping();

		try {
			await this.client.inhibitors.run(message, message.command!);
			if (message.command!.oneAtTime)
				this.client.oneCommandAtATimeCache.add(message.author.id);

			try {
				// @ts-ignore 2341
				await message.prompter!.run();
				const subcommand = message.command!.subcommands
					? message.params.shift()
					: undefined;

				// @ts-ignore 7053
				// prettier-ignore
				const commandRun = subcommand ? message.command![subcommand](message, message.params) : message.command!.run(message, message.params);
				timer.stop();
				const response = await commandRun;
				this.client.finalizers.run(message, message.command!, response, timer);
				this.client.emit(
					'commandSuccess',
					message,
					message.command,
					message.params,
					response
				);
			} catch (error) {
				this.client.emit('commandError', message, message.command, message.params, error);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, message.command, response);
		}
		if (this.client.options.typing) message.channel.stopTyping();
		if (message.command!.oneAtTime) {
			setTimeout(() => this.client.oneCommandAtATimeCache.delete(message.author.id), 1000);
		}
	}

	async init() {
		this.prefixMention = new RegExp(`^<@!?${this.client!.user!.id}>`);
		this.mentionOnly = new RegExp(`^<@!?${this.client!.user!.id}>$`);
	}
}
