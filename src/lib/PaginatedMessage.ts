import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageEditOptions,
	MessageOptions,
	TextChannel
} from 'discord.js';
import { Time } from 'e';

import { isFunction, PaginatedMessagePage } from './util';

const controlButtons: {
	customId: string;
	emoji: string;
	run: (opts: { paginatedMessage: PaginatedMessage }) => unknown;
}[] = [
	{
		customId: 'pm-first-page',
		emoji: '⏪',
		run: ({ paginatedMessage }) => (paginatedMessage.index = 0)
	},
	{
		customId: 'pm-previous-page',
		emoji: '◀️',
		run: ({ paginatedMessage }) => {
			if (paginatedMessage.index === 0) {
				paginatedMessage.index = paginatedMessage.pages.length - 1;
			} else {
				--paginatedMessage.index;
			}
		}
	},
	{
		customId: 'pm-next-page',
		emoji: '▶️',
		run: ({ paginatedMessage }) => {
			if (paginatedMessage.index === paginatedMessage.pages.length - 1) {
				paginatedMessage.index = 0;
			} else {
				++paginatedMessage.index;
			}
		}
	},
	{
		customId: 'pm-last-page',
		emoji: '⏩',
		run: ({ paginatedMessage }) => (paginatedMessage.index = paginatedMessage.pages.length - 1)
	}
];

export class PaginatedMessage {
	public index = 0;
	public pages: PaginatedMessagePage[];
	public channel: TextChannel;

	constructor({
		channel,
		pages,
		startingPage
	}: {
		channel: TextChannel;
		pages: PaginatedMessagePage[];
		startingPage?: number;
	}) {
		this.pages = pages;
		this.channel = channel;
		this.index = startingPage ?? 0;
	}

	async render(): Promise<MessageEditOptions> {
		const rawPage = this.pages[this.index];
		const rendered = isFunction(rawPage) ? await rawPage({ currentPage: this.index }) : rawPage;
		return {
			...rendered,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					controlButtons.map(i =>
						new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(i.customId).setEmoji(i.emoji)
					)
				)
			]
		};
	}

	async run(targetUsers?: string[]) {
		const message = await this.channel.send((await this.render()) as MessageOptions);
		if (this.pages.length === 1) return;
		const collector = await message.createMessageComponentCollector({
			time: Time.Minute * 10,
			filter: i => (targetUsers ? targetUsers.includes(i.user.id) : true)
		});

		collector.on('collect', async interaction => {
			for (const action of controlButtons) {
				if (interaction.customId === action.customId) {
					const previousIndex = this.index;

					action.run({
						paginatedMessage: this
					});

					if (previousIndex !== this.index) {
						await interaction.update(await this.render());
						return;
					}
				}
			}
		});

		collector.on('end', () => {
			message.edit({ components: [] });
		});
	}
}
