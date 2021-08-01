import {
	DMChannel,
	MessageActionRowComponentResolvable,
	MessageButton,
	MessageButtonOptions,
	MessageComponentInteraction,
	MessageOptions,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { chunk, objectEntries, objectValues, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';

export type customComponentButtonFunction =
	| ((msg: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>)
	| ((msg: KlasaMessage) => void);

export type TComponentSelection = Record<string, { function?: customComponentButtonFunction; char?: string }>;

export type customMessageButtonOptions = MessageButtonOptions & {
	onClick?: customComponentButtonFunction;
	messageCharacter?: string;
};

interface IOptions {
	time: number;
}

const userCache: Record<string, string> = {};

export class customMessageComponents {
	public buttons: MessageActionRowComponentResolvable[] = [];
	public functions: TComponentSelection = {};
	public options: IOptions = {
		time: Time.Second * 15
	};

	public setOptions(newOptions: Partial<IOptions>) {
		this.options = { ...this.options, ...newOptions };
		return this;
	}

	public addButton(b: customMessageButtonOptions | customMessageButtonOptions[]) {
		if (Array.isArray(b)) {
			b.map(_b => this.addButton(_b));
			return this;
		}
		if (b.onClick) {
			if (this.functions[b.customID!]) {
				this.functions[b.customID!].function = b.onClick;
			} else {
				this.functions[b.customID!] = { function: b.onClick };
			}
		}
		if (b.messageCharacter) {
			b.label = `[${b.messageCharacter.toUpperCase()}] ${b.label}`;
			if (this.functions[b.customID!]) {
				this.functions[b.customID!].char = b.messageCharacter;
			} else {
				this.functions[b.customID!] = { char: b.messageCharacter };
			}
		}
		this.buttons.push(new MessageButton(b));
		return this;
	}

	public getButtons() {
		return this.buttons.length > 0 ? [...chunk(this.buttons, 5)] : undefined;
	}

	public getFunctions() {
		return Object.keys(this.functions).length > 0 ? this.functions : undefined;
	}

	/**
	 * Send a message to the channel specified, with all the buttons created that only the user specified can react to.
	 * @param options
	 */
	public async sendMessage(options: {
		msg?: KlasaMessage;
		data: string | MessageOptions;
		user?: KlasaUser;
		channel?: TextChannel | DMChannel | NewsChannel | ThreadChannel;
	}) {
		let { data, channel, user, msg } = options;
		if (!user && msg) user = msg.author;
		if (!channel && msg) channel = msg.channel;
		if (!channel || !user) return;
		if (typeof data === 'string') data = { content: data };
		if (this.getButtons()) data.components = this.getButtons();
		const message = await channel.send(data);
		userCache[user.id] = message.id;
		if (data.components) {
			try {
				const allowsTypedChars = objectValues(this.functions)
					.filter(f => f.char)
					.map(f => f.char!.toLowerCase());
				const selection = await Promise.race([
					message.channel.awaitMessages({
						time: this.options.time,
						max: 1,
						errors: ['time'],
						filter: _msg => {
							return (
								allowsTypedChars.length > 0 &&
								_msg.author.id === user!.id &&
								allowsTypedChars.includes(_msg.content.toLowerCase())
							);
						}
					}),
					message.awaitMessageComponentInteraction({
						filter: i => {
							if (i.user.id !== user!.id) {
								i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
								return false;
							}
							return true;
						},
						time: this.options.time
					})
				]);
				let response = '';
				// noinspection SuspiciousTypeOfGuard
				if (selection instanceof MessageComponentInteraction) {
					response = selection.customID;
				} else {
					// Ignore text responses from old messages
					if (userCache[user.id] !== message.id) {
						await message.edit({ components: [] });
						return message;
					}
					response = selection.entries().next().value[1].content.toLowerCase();
					const functionExists = objectEntries(this.functions).find(f => {
						return f[1].char?.toLowerCase() === response.toLowerCase();
					});
					if (functionExists) {
						// eslint-disable-next-line prefer-destructuring
						response = functionExists[0];
					}
				}
				if (this.functions && this.functions[response] && this.functions[response].function) {
					message.author = user;
					this.functions[response].function!(message);
				}
				await message.edit({ components: [] });
			} catch (e) {
				await message.edit({ components: [] });
			} finally {
				if (userCache[user.id] === message.id) delete userCache[user.id];
			}
		}
		return message;
	}
}
