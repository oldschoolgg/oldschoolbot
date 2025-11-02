import { ButtonBuilder, ButtonStyle, InteractionResponseType, MessageFlags, Routes } from '@oldschoolgg/discord';
import type { IButtonInteraction, IMessage } from '@oldschoolgg/schemas';
import { isFunction, noOp, Time } from '@oldschoolgg/toolkit';

import { BLACKLISTED_USERS } from '@/lib/blacklists.js';
import type { MInteraction } from '@/lib/discord/interaction/MInteraction.js';

type DynamicButtonFn = (opts: { message: IMessage | null; interaction: MInteraction<IButtonInteraction> }) => unknown;

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
	message: any | null = null;
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
		messageOptions: BaseSendableMessage;
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
			components: buttons,
			withResponse: true
		});
		if (!this.message) return;

		//TODO
		const collectedInteraction = await new Promise<any | null>(resolve => {
			const collector = this.message!.createMessageComponentCollector({
				time: this.timer ?? Time.Second * 20
			});

			const silentAck = (bi: any) =>
				globalClient.rest.post(Routes.interactionCallback(bi.id, bi.token), {
					body: { type: InteractionResponseType.DeferredMessageUpdate }
				});

			collector.once('collect', async (i: any) => {
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
