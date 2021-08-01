import {
	DMChannel,
	MessageActionRowComponentResolvable,
	MessageButton,
	MessageButtonOptions,
	MessageOptions,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { chunk, Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';

export type customComponentButtonFunction =
	| ((msg: KlasaMessage) => Promise<KlasaMessage | KlasaMessage[] | null>)
	| ((msg: KlasaMessage) => void);

export type TComponentSelection = Record<string, customComponentButtonFunction>;

export type customMessageButtonOptions = MessageButtonOptions & { onClick?: customComponentButtonFunction };

interface IOptions {
	time: number;
}

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
		this.buttons.push(new MessageButton(b));
		if (b.onClick) this.functions[b.customID!] = b.onClick;
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
		if (data.components) {
			try {
				const selection = await message.awaitMessageComponentInteraction({
					time: this.options.time,
					filter: i => {
						if (i.user.id !== user!.id) {
							i.reply({
								ephemeral: true,
								content: `This \`${user!.username}'s\` message not your message.`
							});
							return false;
						}
						return true;
					}
				});
				if (this.functions && this.functions[selection.customID]) {
					message.author = user;
					this.functions[selection.customID](message);
				}
				await message.edit({ components: [] });
			} catch (e) {
				await message.edit({ components: [] });
			}
		}
		return message;
	}
}
