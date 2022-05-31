import { DMChannel, MessageButton, MessageOptions, NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { chunk, noOp, Time } from 'e';
import murmurhash from 'murmurhash';

import { ClientSettings } from './settings/types/ClientSettings';

export class DynamicButtons {
	buttons: { name: string; id: string; fn: () => {}; emoji: string | undefined; cantBeBusy: boolean }[] = [];
	channel: TextChannel;
	timer: number | undefined;
	usersWhoCanInteract: string[];

	constructor({
		channel,
		timer,
		usersWhoCanInteract
	}: {
		channel: TextChannel | DMChannel | NewsChannel | ThreadChannel;
		timer?: number;
		usersWhoCanInteract: string[];
	}) {
		this.channel = channel as TextChannel;
		this.timer = timer;
		this.usersWhoCanInteract = usersWhoCanInteract;
	}

	async render({ isBusy, messageOptions }: { isBusy: boolean; messageOptions: MessageOptions }) {
		const buttons = this.buttons
			.filter(b => {
				if (isBusy && b.cantBeBusy) return false;
				return true;
			})
			.map(b => new MessageButton({ label: b.name, customID: b.id, style: 'SECONDARY', emoji: b.emoji }));
		const chunkedButtons = chunk(buttons, 5);
		const message = await this.channel.send({ ...messageOptions, components: chunkedButtons });
		const collectedInteraction = await message
			.awaitMessageComponentInteraction({
				filter: i => {
					if (globalClient.settings.get(ClientSettings.UserBlacklist).includes(i.user.id)) return false;
					if (this.usersWhoCanInteract.includes(i.user.id)) {
						return true;
					}
					i.reply({ ephemeral: true, content: 'This is not your message.' });
					return false;
				},
				time: this.timer ?? Time.Second * 20
			})
			.catch(noOp);
		await message.edit({ components: [] });

		if (collectedInteraction) {
			collectedInteraction.deferUpdate();
			for (const button of this.buttons) {
				if (collectedInteraction.customID === button.id) {
					if (collectedInteraction.user.minionIsBusy && button.cantBeBusy) {
						return collectedInteraction.reply({
							content: "Your action couldn't be performed, because your minion is busy.",
							ephemeral: true
						});
					}
					return button.fn();
				}
			}
		}
	}

	add({ name, fn, emoji, cantBeBusy }: { name: string; fn: () => {}; emoji?: string; cantBeBusy?: boolean }) {
		const id = murmurhash(name).toString();
		this.buttons.push({
			name,
			id,
			fn,
			emoji,
			cantBeBusy: cantBeBusy ?? false
		});
	}
}
