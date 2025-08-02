import {
	ActionRowBuilder,
	type BaseMessageOptions,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ComponentType,
	type MessageEditOptions,
	type TextChannel
} from 'discord.js';

import { UserError } from '../../structures';
import { Time } from '../datetime';
import { isFunction } from '../typeChecking';

const InteractionID = {
	PaginatedMessage: {
		FirstPage: 'PM_FIRST_PAGE',
		PreviousPage: 'PM_PREVIOUS_PAGE',
		NextPage: 'PM_NEXT_PAGE',
		LastPage: 'PM_LAST_PAGE'
	}
} as const;

const controlButtons: {
	customId: string;
	emoji: string;
	run: (opts: { paginatedMessage: PaginatedMessage }) => unknown;
}[] = [
	{
		customId: InteractionID.PaginatedMessage.FirstPage,
		emoji: '⏪',
		run: ({ paginatedMessage }) => (paginatedMessage.index = 0)
	},
	{
		customId: InteractionID.PaginatedMessage.PreviousPage,
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
		customId: InteractionID.PaginatedMessage.NextPage,
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
		customId: InteractionID.PaginatedMessage.LastPage,
		emoji: '⏩',
		run: ({ paginatedMessage }) => (paginatedMessage.index = paginatedMessage.totalPages - 1)
	}
];

type PaginatedPages =
	| { numPages: number; generate: (opts: { currentPage: number }) => Promise<MessageEditOptions> }
	| PaginatedMessagePage[];

export class PaginatedMessage {
	public index = 0;
	public pages!: PaginatedPages;
	public channel: TextChannel;
	public totalPages: number;
	public onError: (error: Error, interaction?: ButtonInteraction) => void;

	constructor({
		channel,
		pages,
		startingPage,
		onError
	}: {
		channel: TextChannel;
		pages: PaginatedPages;
		startingPage?: number;
		onError: (error: Error, interaction?: ButtonInteraction) => void;
	}) {
		this.pages = pages;
		this.channel = channel;
		this.index = startingPage ?? 0;
		this.totalPages = Array.isArray(pages) ? pages.length : pages.numPages;
		this.onError = onError;
	}

	async render(): Promise<MessageEditOptions | string> {
		const numberOfPages = Array.isArray(this.pages) ? this.pages.length : this.pages.numPages;
		try {
			const rawPage = !Array.isArray(this.pages)
				? await this.pages.generate({ currentPage: this.index })
				: this.pages[this.index];

			return {
				...(isFunction(rawPage) ? await rawPage() : rawPage),
				components:
					numberOfPages === 1
						? []
						: [
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
			this.onError(err as Error);
			return 'Sorry, something went wrong.';
		}
	}

	async run(targetUsers?: string[]) {
		const message = await this.channel.send((await this.render()) as BaseMessageOptions);
		if (this.totalPages === 1) return;
		const collector = await message.createMessageComponentCollector<ComponentType.Button>({
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
						try {
							await interaction.update(await this.render());
						} catch (err) {
							this.onError(err as Error, interaction);
						}
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

export type PaginatedMessagePage = MessageEditOptions | (() => Promise<MessageEditOptions>);

export async function makePaginatedMessage(
	channel: TextChannel,
	pages: PaginatedMessagePage[],
	onError: (err: Error, itx?: ButtonInteraction) => unknown,
	target?: string
) {
	const m = new PaginatedMessage({ pages, channel, onError });
	return m.run(target ? [target] : undefined);
}
