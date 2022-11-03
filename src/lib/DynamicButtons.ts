import {
	BaseMessageOptions,
	ButtonBuilder,
	ButtonStyle,
	DMChannel,
	Message,
	MessageComponentInteraction,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { noOp, Time } from 'e';
import murmurhash from 'murmurhash';

import { BLACKLISTED_USERS } from './blacklists';
import { awaitMessageComponentInteraction, makeComponents } from './util';
import { minionIsBusy } from './util/minionIsBusy';

type DynamicButtonFn = (opts: { message: Message; interaction: MessageComponentInteraction }) => unknown;

export class DynamicButtons {
	buttons: {
		name: string;
		id: string;
		fn: DynamicButtonFn;
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
		const collectedInteraction = await awaitMessageComponentInteraction({
			message: this.message,
			filter: i => {
				if (BLACKLISTED_USERS.has(i.user.id)) return false;
				if (this.usersWhoCanInteract.includes(i.user.id)) {
					return true;
				}
				i.reply({ ephemeral: true, content: 'This is not your message.' });
				return false;
			},
			time: this.timer ?? Time.Second * 20
		}).catch(noOp);
		if (this.deleteAfterConfirm === true) {
			await this.message.delete().catch(noOp);
		} else {
			await this.message.edit({ components: [], content: this.contentAfterFinish ?? undefined });
		}

		if (collectedInteraction) {
			for (const button of this.buttons) {
				if (collectedInteraction.customId === button.id) {
					collectedInteraction.deferUpdate();
					if (minionIsBusy(collectedInteraction.user.id) && button.cantBeBusy) {
						return collectedInteraction.reply({
							content: "Your action couldn't be performed, because your minion is busy.",
							ephemeral: true
						});
					}
					await button.fn({ message: this.message!, interaction: collectedInteraction });
					return collectedInteraction;
				}
			}
		}

		return collectedInteraction;
	}

	add({
		name,
		fn,
		emoji,
		cantBeBusy,
		style
	}: {
		name: string;
		fn: DynamicButtonFn;
		emoji?: string;
		cantBeBusy?: boolean;
		style?: ButtonStyle;
	}) {
		const id = murmurhash(name).toString();
		this.buttons.push({
			name,
			id,
			fn,
			emoji,
			cantBeBusy: cantBeBusy ?? false,
			style
		});
	}
}
