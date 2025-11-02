import { ButtonBuilder, type ButtonInteraction, ComponentType } from '@oldschoolgg/discord';
import { SpecialResponse, Time, UserError } from '@oldschoolgg/toolkit';
import { ButtonStyle, InteractionResponseType, MessageFlags, Routes } from 'discord-api-types/v10';
import { isFunction } from 'remeda';

import { InteractionID } from '@/lib/InteractionID.js';

const controlButtons: {
	customId: string;
	emoji: string;
	run: (opts: { paginatedMessage: BasePaginatedMessage }) => unknown;
}[] = [
	{
		customId: InteractionID.PaginatedMessage.FirstPage,
		emoji: '⏪',
		run: ({ paginatedMessage }) => {
			paginatedMessage.index = 0;
		}
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
		run: ({ paginatedMessage }) => {
			paginatedMessage.index = paginatedMessage.totalPages - 1;
		}
	}
];

export type PaginatedMessagePage =
	| BaseSendableMessage
	| ((currentIndex: number) => Promise<BaseSendableMessage> | BaseSendableMessage);
export type PaginatedPages =
	| {
			numPages: number;
			generate: (opts: { currentPage: number }) => Promise<BaseSendableMessage> | BaseSendableMessage;
	  }
	| PaginatedMessagePage[];

class BasePaginatedMessage {
	public index = 0;
	public pages!: PaginatedPages;
	public totalPages: number;

	constructor(pages: PaginatedPages, startingPage: number | undefined) {
		this.pages = pages;
		this.index = startingPage ?? 0;
		this.totalPages = Array.isArray(pages) ? pages.length : pages.numPages;
	}

	async render(): Promise<BaseSendableMessage> {
		try {
			const rawPage = !Array.isArray(this.pages)
				? await this.pages.generate({ currentPage: this.index })
				: this.pages[this.index];

			const _page = isFunction(rawPage) ? await rawPage(this.index) : rawPage;
			return {
				..._page,
				components:
					this.totalPages === 1
						? []
						: controlButtons.map(i =>
								new ButtonBuilder()
									.setStyle(ButtonStyle.Secondary)
									.setCustomId(i.customId)
									.setEmoji({ id: i.emoji })
							)
			};
		} catch (err) {
			let msg = 'Sorry, something went wrong.';
			if (typeof err === 'string') msg = err;
			else if (err instanceof UserError) msg = err.message;
			return { content: msg, components: [] };
		}
	}
}

export type PaginatedMessageOptions = {
	pages: PaginatedPages;
	startingPage?: number;
	ephemeral?: boolean;
};

export class PaginatedMessage extends BasePaginatedMessage {
	public interaction: MInteraction;
	public ephemeral: boolean;

	constructor({
		interaction,
		pages,
		startingPage,
		ephemeral
	}: {
		interaction: MInteraction;
	} & PaginatedMessageOptions) {
		super(pages, startingPage);
		this.interaction = interaction;
		this.ephemeral = ephemeral ?? false;
	}

	async run(targetUsers?: string[]) {
		const flags = this.ephemeral ? MessageFlags.Ephemeral : undefined;
		await this.interaction.defer({ ephemeral: this.ephemeral });
		const interactionResponse = await this.interaction.reply({ ...(await this.render()), withResponse: true });
		if (this.totalPages === 1) return SpecialResponse.PaginatedMessageResponse;

		const collector = interactionResponse!.createMessageComponentCollector<ComponentType.Button>({
			time: Time.Minute * 10,
			componentType: ComponentType.Button
		});

		collector.on('collect', async (buttonPressInteraction: ButtonInteraction) => {
			if (targetUsers && !targetUsers.includes(buttonPressInteraction.user.id)) {
				await buttonPressInteraction.reply({ content: "This isn't your message!", flags });
				await globalClient.respondToAutocompleteInteraction;
				return;
			}

			// Acknowledge the button press to avoid "This interaction failed" message.
			await globalClient.rest.post(
				Routes.interactionCallback(buttonPressInteraction.id, buttonPressInteraction.token),
				{
					body: {
						type: InteractionResponseType.DeferredMessageUpdate
					}
				}
			);

			for (const action of controlButtons) {
				if (buttonPressInteraction.customId === action.customId) {
					const previousIndex = this.index;
					action.run({ paginatedMessage: this });

					if (previousIndex !== this.index) {
						await this.interaction.reply(await this.render());
						return;
					}
				}
			}
		});

		collector.on('end', async () => {
			await this.interaction.reply({ components: [] });
		});

		return SpecialResponse.PaginatedMessageResponse;
	}
}
