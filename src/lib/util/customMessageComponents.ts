import {
	DMChannel,
	Message,
	MessageActionRowComponentResolvable,
	MessageButton,
	MessageButtonOptions,
	MessageCollector,
	MessageComponentInteractionCollector,
	MessageOptions,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { chunk, objectEntries, objectValues, Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser } from 'klasa';

import { SILENT_ERROR } from '../constants';

export type customComponentButtonFunction =
	| ((msg: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>)
	| ((msg: KlasaMessage) => void);

export type TComponentSelection = Record<string, { function?: customComponentButtonFunction; char?: string }>;

export type customMessageButtonOptions = MessageButtonOptions & {
	onClick?: customComponentButtonFunction;
	messageCharacter?: string;
	removeAfterClick?: boolean;
};

interface IOptions {
	time: number;
	chunkSize: number;
	timeLimitMessage?: string;
	timeLimitThrows?: boolean;
	deleteOnSuccess?: boolean;
}

const userCache = new Map<
	string,
	{ message: KlasaMessage; collectors: { txt: MessageCollector; btn: MessageComponentInteractionCollector } }
>();

export class customMessageComponents {
	public rawButtons: customMessageButtonOptions[] = [];
	public buttons: MessageActionRowComponentResolvable[] = [];
	public functions: TComponentSelection = {};
	public options: IOptions = {
		time: Time.Second * 15,
		chunkSize: 5
	};

	private collectors: {
		btn: MessageComponentInteractionCollector | undefined;
		txt: MessageCollector | undefined;
	} = { btn: undefined, txt: undefined };

	private _client: KlasaClient | undefined = undefined;

	public setClient(value: KlasaClient | undefined = undefined) {
		this._client = value;
		return this;
	}

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
		this.rawButtons.push(b);
		this.buttons.push(new MessageButton(b));
		return this;
	}

	public getButtons() {
		return this.buttons.length > 0 ? [...chunk(this.buttons, this.options.chunkSize)] : undefined;
	}

	public getFunctions() {
		return Object.keys(this.functions).length > 0 ? this.functions : undefined;
	}

	public async clearMessage(message: KlasaMessage, type?: string) {
		if (type !== 'error') {
			await message.edit({
				content:
					type === 'timelimit' && this.options.timeLimitMessage
						? this.options.timeLimitMessage
						: message.content.replace(/\*\* \*\* \*\* \*\*\n(.+?)\*\* \*\* \*\* \*\*/, ''),
				components: []
			});
		} else {
			await message.edit({ components: [] });
		}

		this.stopCollectors(type);
		userCache.delete(message.author.id);

		if ((type === 'timelimit' && this.options.timeLimitThrows) || type === 'error') {
			throw new Error(SILENT_ERROR);
		} else if (type === 'sucess' && this.options.deleteOnSuccess) {
			await message.delete();
		}
	}

	private getCharText(): string {
		let returnStr = '';
		const allowsTypedChars = objectValues(this.functions)
			.filter(f => f.char)
			.map(f => f.char!.toLowerCase());

		if (allowsTypedChars.length > 0) {
			returnStr += '\n** ** ** **\n';
		}
		const textShortcuts = [];
		for (const d of this.rawButtons as customMessageButtonOptions[]) {
			if (this.functions[d.customID!] && d.messageCharacter) {
				textShortcuts.push(
					`${(d as customMessageButtonOptions).label!.replace(/\[/g, '`').replace(/]/g, '`')}`
				);
			}
		}
		if (textShortcuts.length > 0) returnStr += `${textShortcuts.join(', ')}** ** ** **`;
		return returnStr;
	}

	private stopCollectors(reason?: string) {
		for (const col of objectValues(this.collectors)) {
			if (col) if (!col.ended) col.stop(reason ?? 'unknown reason');
		}
	}

	private async verifyInteraction(message: KlasaMessage, user: KlasaUser, identifier: string) {
		// Ignore if minion is busy
		if (user.minionIsBusy || (this._client && this._client.oneCommandAtATimeCache.has(user.id))) {
			await this.clearMessage(message, 'busy_or_one_at_time');
			return message.channel.send("You are busy and can't do this at this time.");
		}
		// If the client is set, set the user as oneAtTime
		if (this._client !== undefined) this._client.oneCommandAtATimeCache.add(user.id);
		// Run the interaction
		const interactionFunction = this.functions[identifier];
		if (interactionFunction && interactionFunction.function) {
			message.author = user;
			await interactionFunction.function!(message);
		} else {
			await this.clearMessage(message, 'interaction_not_found');
		}
		// Check if the interaction is a final interaction or one that just execute and remove the btn from the message
		let thisSelection = this.rawButtons.find(b => b.customID === identifier);
		if (thisSelection && (thisSelection as customMessageButtonOptions).removeAfterClick === true) {
			// Remove the buttons from this message
			[this.rawButtons, this.buttons].map(b => {
				b.splice(
					b.findIndex(f => f.customID === thisSelection!.customID),
					1
				);
			});
			// Remove the attached button function
			delete this.functions[identifier];
			// Update the message
			await message.edit({ components: this.getButtons() });
			setTimeout(() => this._client!.oneCommandAtATimeCache.delete(user!.id), 300);
		} else {
			await this.clearMessage(message, 'success');
		}
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

		data.content = (data.content ?? '') + this.getCharText();

		const message = await channel.send(data);
		if (data.components) {
			// Clear old btns if they exist
			if (userCache.has(user.id)) {
				const cache = userCache.get(user.id)!;
				cache.collectors.txt.stop('old_message_text_reply');
				cache.collectors.btn.stop('old_message_text_reply');
				userCache.delete(user.id);
			}
			// Collect typed messages (c for confirm, etc)
			this.collectors.txt = new MessageCollector(message.channel as TextChannel, {
				filter: (_msg: Message) => {
					const allowsTypedChars = objectValues(this.functions)
						.filter(f => f.char)
						.map(f => f.char!.toLowerCase());
					return (
						_msg.author.id === user!.id &&
						allowsTypedChars.length > 0 &&
						allowsTypedChars.includes(_msg.content.toLowerCase())
					);
				},
				time: this.options.time
			}).on('collect', async (msg: KlasaMessage) => {
				if (userCache.get(user!.id) && userCache.get(user!.id)!.message.id !== message.id) {
					await this.clearMessage(message, 'old_message_text_reply');
				} else {
					const functionExists = objectEntries(this.functions).find(f => {
						return f[1].char?.toLowerCase() === msg.content.toLowerCase();
					});
					if (functionExists && functionExists.length > 0 && functionExists[0]) {
						await this.verifyInteraction(message, user!, functionExists[0]);
					} else {
						await this.clearMessage(message, 'invalid_request');
					}
				}
			});

			// Collect component interactions (clicking on btns or selecting an option on a dropdown)
			this.collectors.btn = message
				.createMessageComponentInteractionCollector({
					filter: i => {
						i.deferUpdate();
						if (i.user.id !== user!.id) {
							i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
							return false;
						}
						return true;
					},
					time: this.options.time
				})
				.on('collect', async interaction => {
					if (userCache.get(user!.id) && userCache.get(user!.id)!.message.id !== message.id) {
						await this.clearMessage(message, 'old_message_text_reply');
					} else {
						await this.verifyInteraction(message, user!, interaction.customID);
					}
				})
				// Only 1 collector needs to handle the ending
				.on('end', async () => {
					if (userCache.get(user!.id) && userCache.get(user!.id)!.message.id === message.id) {
						userCache.delete(user!.id);
					}
					if (this._client !== undefined) {
						setTimeout(() => this._client!.oneCommandAtATimeCache.delete(user!.id), 300);
					}
					// await this.clearMessage(message);
				});

			userCache.set(user.id, {
				message,
				collectors: {
					txt: this.collectors.txt,
					btn: this.collectors.btn
				}
			});
		}
		return message;
	}
}
