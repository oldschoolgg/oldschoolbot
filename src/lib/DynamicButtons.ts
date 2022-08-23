import {
	DMChannel,
	MessageButton,
	MessageButtonStyle,
	MessageComponentInteraction,
	MessageOptions,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { chunk, noOp, Time } from 'e';
import { KlasaMessage } from 'klasa';
import murmurhash from 'murmurhash';

import { BLACKLISTED_USERS } from './blacklists';
import { minionIsBusy } from './util/minionIsBusy';

type DynamicButtonFn = (opts: { message: KlasaMessage; interaction: MessageComponentInteraction }) => unknown;

export class DynamicButtons {
	buttons: {
		name: string;
		id: string;
		fn: DynamicButtonFn;
		emoji: string | undefined;
		cantBeBusy: boolean;
		style?: MessageButtonStyle;
	}[] = [];

	channel: TextChannel;
	timer: number | undefined;
	usersWhoCanInteract: string[];
	message: KlasaMessage | null = null;
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
		messageOptions: MessageOptions;
		extraButtons?: MessageButton[];
	}) {
		const buttons = this.buttons
			.filter(b => {
				if (isBusy && b.cantBeBusy) return false;
				return true;
			})
			.map(
				b => new MessageButton({ label: b.name, customID: b.id, style: b.style ?? 'SECONDARY', emoji: b.emoji })
			)
			.concat(extraButtons);
		const chunkedButtons = chunk(buttons, 5);
		this.message = await this.channel.send({ ...messageOptions, components: chunkedButtons });
		const collectedInteraction = await this.message
			.awaitMessageComponentInteraction({
				filter: i => {
					if (BLACKLISTED_USERS.has(i.user.id)) return false;
					if (this.usersWhoCanInteract.includes(i.user.id)) {
						return true;
					}
					i.reply({ ephemeral: true, content: 'This is not your message.' });
					return false;
				},
				time: this.timer ?? Time.Second * 20
			})
			.catch(noOp);
		if (this.deleteAfterConfirm === true) {
			await this.message.delete().catch(noOp);
		} else {
			await this.message.edit({ components: [], content: this.contentAfterFinish ?? undefined });
		}

		if (collectedInteraction) {
			for (const button of this.buttons) {
				if (collectedInteraction.customID === button.id) {
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
		style?: MessageButtonStyle;
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
