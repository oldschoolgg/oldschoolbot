import type {
	BaseMessageOptions,
	ButtonInteraction,
	DMChannel,
	Message,
	MessageComponentInteraction,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time, isFunction, noOp } from 'e';
import murmurhash from 'murmurhash';

import { BLACKLISTED_USERS } from './blacklists';
import { awaitMessageComponentInteraction, makeComponents } from './util';
import { silentButtonAck } from './util/handleMahojiConfirmation';
import { minionIsBusy } from './util/minionIsBusy';

type DynamicButtonFn = (opts: { message: Message; interaction: MessageComponentInteraction }) => unknown;

export class DynamicButtons {
	buttons: {
		name: string;
		id: string;
		fn?: DynamicButtonFn;
		emoji: string | undefined;
		cantBeBusy: boolean;
		style?: ButtonStyle;
	}[] = [];

	channel: TextChannel;
	timer: number | undefined;
	usersWhoCanInteract: string[];
	message: Message | null = null;
	contentAfterFinish: string | null = null;
	deleteAfterConfirm: boolean | undefined;

	constructor({
		channel,
		timer,
		usersWhoCanInteract,
		contentAfterFinish,
		deleteAfterConfirm
	}: {
		channel: TextChannel | DMChannel | NewsChannel | ThreadChannel;
		timer?: number;
		usersWhoCanInteract: string[];
		contentAfterFinish?: string | null;
		deleteAfterConfirm?: boolean;
	}) {
		this.channel = channel as TextChannel;
		this.timer = timer;
		this.usersWhoCanInteract = usersWhoCanInteract;
		this.contentAfterFinish = contentAfterFinish ?? null;
		this.deleteAfterConfirm = deleteAfterConfirm;
	}

	async render({
		isBusy,
		messageOptions,
		extraButtons = []
	}: {
		isBusy: boolean;
		messageOptions: BaseMessageOptions;
		extraButtons?: ButtonBuilder[];
	}) {
		const buttons = this.buttons
			.filter(b => {
				if (isBusy && b.cantBeBusy) return false;
				return true;
			})
			.map(
				b =>
					new ButtonBuilder({
						label: b.name,
						customId: b.id,
						style: (b.style ?? ButtonStyle.Secondary) as ButtonStyle.Secondary,
						emoji: b.emoji
					})
			)
			.concat(extraButtons);

		this.message = await this.channel.send({
			...messageOptions,
			components: makeComponents(buttons)
		});
		const collectedInteraction: ButtonInteraction = (await awaitMessageComponentInteraction({
			message: this.message,
			filter: async i => {
				if (!i.isButton()) return false;
				await silentButtonAck(i);
				if (BLACKLISTED_USERS.has(i.user.id)) return false;
				if (this.usersWhoCanInteract.includes(i.user.id)) {
					return true;
				}
				i.reply({ ephemeral: true, content: 'This is not your message.' });
				return false;
			},
			time: this.timer ?? Time.Second * 20
		}).catch(noOp)) as ButtonInteraction;
		if (this.deleteAfterConfirm === true) {
			await this.message.delete().catch(noOp);
		} else {
			await this.message.edit({ components: [], content: this.contentAfterFinish ?? undefined });
		}

		if (collectedInteraction) {
			for (const button of this.buttons) {
				if (collectedInteraction.customId === button.id) {
					if (minionIsBusy(collectedInteraction.user.id) && button.cantBeBusy) {
						await collectedInteraction.reply({
							content: "Your action couldn't be performed, because your minion is busy.",
							ephemeral: true
						});
						return null;
					}
					if ('fn' in button && isFunction(button.fn)) {
						await button.fn({ message: this.message!, interaction: collectedInteraction });
					}
					return button;
				}
			}
		}

		return null;
	}

	add({
		name,
		fn,
		emoji,
		cantBeBusy,
		style
	}: {
		name: string;
		fn?: DynamicButtonFn;
		emoji?: string;
		cantBeBusy?: boolean;
		style?: ButtonStyle;
	}) {
		const id = murmurhash(name).toString();
		this.buttons.push({
			name,
			id: `DYN_${id}`,
			fn,
			emoji,
			cantBeBusy: cantBeBusy ?? false,
			style
		});
	}
}
