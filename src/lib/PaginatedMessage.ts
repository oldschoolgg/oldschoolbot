import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageEditOptions,
	MessageOptions,
	TextChannel
} from 'discord.js';
import { Time } from 'e';

import { UserError } from './UserError';
import { PaginatedMessagePage } from './util';
import { logError } from './util/logError';

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
				paginatedMessage.index = paginatedMessage.totalPages - 1;
			} else {
				--paginatedMessage.index;
			}
		}
	},
	{
		customId: 'pm-next-page',
		emoji: '▶️',
		run: ({ paginatedMessage }) => {
			if (paginatedMessage.index === paginatedMessage.totalPages - 1) {
				paginatedMessage.index = 0;
			} else {
				++paginatedMessage.index;
			}
		}
	},
	{
		customId: 'pm-last-page',
		emoji: '⏩',
		run: ({ paginatedMessage }) => (paginatedMessage.index = paginatedMessage.totalPages - 1)
	}
];

type PaginatedPages =
	| { numPages: number; generate: (opts: { currentPage: number }) => Promise<MessageEditOptions> }
	| PaginatedMessagePage[];

export class PaginatedMessage {
	public index = 0;
	public pages: PaginatedPages;
	public channel: TextChannel;
	public totalPages: number;

	constructor({
		channel,
		pages,
		startingPage
	}: {
		channel: TextChannel;
		pages: PaginatedPages;
		startingPage?: number;
	}) {
		this.pages = pages;
		this.channel = channel;
		this.index = startingPage ?? 0;
		this.totalPages = Array.isArray(pages) ? pages.length : pages.numPages;
	}

	async render(): Promise<MessageEditOptions | string> {
		try {
			const rawPage = !Array.isArray(this.pages)
				? await this.pages.generate({ currentPage: this.index })
				: this.pages[this.index];
			return {
				...rawPage,
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						controlButtons.map(i =>
							new ButtonBuilder()
								.setStyle(ButtonStyle.Secondary)
								.setCustomId(i.customId)
								.setEmoji(i.emoji)
						)
					)
				]
			};
		} catch (err) {
			if (typeof err === 'string') return err;
			if (err instanceof UserError) return err.message;
			logError(err);
			return 'Sorry, something went wrong.';
		}
	}

	async run(targetUsers?: string[]) {
		const message = await this.channel.send((await this.render()) as MessageOptions);
		if (this.totalPages === 1) return;
		const collector = await message.createMessageComponentCollector({
			time: Time.Minute * 10
		});

		collector.on('collect', async interaction => {
			if (targetUsers && !targetUsers.includes(interaction.user.id)) {
				interaction.reply({ content: "This isn't your message!", ephemeral: true });
				return;
			}
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
