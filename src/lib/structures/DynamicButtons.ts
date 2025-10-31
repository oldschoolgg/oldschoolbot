import type { BaseMessageOptions, ButtonInteraction } from '@oldschoolgg/discord';
import { ButtonBuilder, makeComponents } from '@oldschoolgg/discord';
import type { Message } from '@oldschoolgg/discord.js';
import type { IMessage } from '@oldschoolgg/schemas';
import { isFunction, noOp, Time } from '@oldschoolgg/toolkit';
import { ButtonStyle, InteractionResponseType, MessageFlags, Routes } from 'discord-api-types/v10';

import { BLACKLISTED_USERS } from '@/lib/blacklists.js';
import type { MInteraction } from '@/lib/structures/MInteraction.js';

type DynamicButtonFn = (opts: { message: IMessage | null; interaction: ButtonInteraction }) => unknown;

function simpleHash(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
	return h >>> 0;
}

export class DynamicButtons {
	buttons: {
		name: string;
		id: string;
		fn?: DynamicButtonFn;
		emoji: string | undefined;
		cantBeBusy: boolean;
		style?: ButtonStyle;
	}[] = [];

	timer: number | undefined;
	usersWhoCanInteract: string[];
	message: Message | null = null;
	mInteraction: MInteraction;

	constructor({
		interaction,
		timer,
		usersWhoCanInteract
	}: {
		interaction: MInteraction;
		timer?: number;
		usersWhoCanInteract: string[];
	}) {
		this.mInteraction = interaction;
		this.timer = timer;
		this.usersWhoCanInteract = usersWhoCanInteract;
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
			.filter(b => !(isBusy && b.cantBeBusy))
			.map(
				b =>
					new ButtonBuilder({
						label: b.name,
						custom_id: b.id,
						style: (b.style ?? ButtonStyle.Secondary) as ButtonStyle.Secondary,
						emoji: b.emoji ? { id: b.emoji } : undefined
					})
			)
			.concat(extraButtons);

		await this.mInteraction.defer({ ephemeral: false });

		this.message = await this.mInteraction.reply({
			...messageOptions,
			components: makeComponents(buttons),
			withResponse: true
		});
		if (!this.message) return;

		const collectedInteraction = await new Promise<ButtonInteraction | null>(resolve => {
			const collector = this.message!.createMessageComponentCollector({
				time: this.timer ?? Time.Second * 20
			});

			const silentAck = (bi: ButtonInteraction) =>
				this.mInteraction.client.rest.post(Routes.interactionCallback(bi.id, bi.token), {
					body: { type: InteractionResponseType.DeferredMessageUpdate }
				});

			collector.once('collect', async i => {
				if (!i.isButton()) {
					return;
				}
				await silentAck(i).catch(noOp);
				if (BLACKLISTED_USERS.has(i.user.id)) return;
				if (!this.usersWhoCanInteract.includes(i.user.id)) {
					await i.reply({ flags: MessageFlags.Ephemeral, content: 'This is not your message.' }).catch(noOp);
					return;
				}
				resolve(i);
				collector.stop();
			});

			collector.once('end', () => resolve(null));
		});

		if (!collectedInteraction) {
			return null;
		}

		for (const button of this.buttons) {
			if (collectedInteraction.customId !== button.id) {
				continue;
			}
			if (ActivityManager.minionIsBusy(collectedInteraction.user.id) && button.cantBeBusy) {
				await collectedInteraction
					.reply({
						content: "Your action couldn't be performed, because your minion is busy.",
						flags: MessageFlags.Ephemeral
					})
					.catch(noOp);
				return null;
			}
			if ('fn' in button && isFunction(button.fn)) {
				await button.fn({ message: this.message, interaction: collectedInteraction });
			}
			return button;
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
		const id = simpleHash(name).toString();
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
