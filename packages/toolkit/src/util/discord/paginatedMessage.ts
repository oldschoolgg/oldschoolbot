import {
	ActionRowBuilder,
	type BaseMessageOptions,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	type MessageEditOptions,
	MessageFlags,
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

const controlButtons = [
	{
		customId: InteractionID.PaginatedMessage.FirstPage,
		emoji: '⏪',
		run: ({ paginatedMessage }: { paginatedMessage: BasePaginatedMessage }) => (paginatedMessage.index = 0)
	},
	{
		customId: InteractionID.PaginatedMessage.PreviousPage,
		emoji: '◀️',
		run: ({ paginatedMessage }: { paginatedMessage: BasePaginatedMessage }) => {
			if (paginatedMessage.index === 0) paginatedMessage.index = paginatedMessage.totalPages - 1;
			else --paginatedMessage.index;
		}
	},
	{
		customId: InteractionID.PaginatedMessage.NextPage,
		emoji: '▶️',
		run: ({ paginatedMessage }: { paginatedMessage: BasePaginatedMessage }) => {
			if (paginatedMessage.index === paginatedMessage.totalPages - 1) paginatedMessage.index = 0;
			else ++paginatedMessage.index;
		}
	},
	{
		customId: InteractionID.PaginatedMessage.LastPage,
		emoji: '⏩',
		run: ({ paginatedMessage }: { paginatedMessage: BasePaginatedMessage }) =>
			(paginatedMessage.index = paginatedMessage.totalPages - 1)
	}
] as const;

export type PaginatedMessagePage = MessageEditOptions | (() => Promise<MessageEditOptions>);
export type PaginatedPages =
	| { numPages: number; generate: (opts: { currentPage: number }) => Promise<MessageEditOptions> }
	| PaginatedMessagePage[];

abstract class BasePaginatedMessage {
	public index = 0;
	public pages!: PaginatedPages;
	public totalPages: number;
	public onError: (err: Error, interaction?: ButtonInteraction) => void;

	constructor(
		pages: PaginatedPages,
		startingPage: number | undefined,
		onError: (err: Error, itx?: ButtonInteraction) => void
	) {
		this.pages = pages;
		this.index = startingPage ?? 0;
		this.totalPages = Array.isArray(pages) ? pages.length : pages.numPages;
		this.onError = onError;
	}

	async render(): Promise<MessageEditOptions> {
		try {
			const rawPage = !Array.isArray(this.pages)
				? await this.pages.generate({ currentPage: this.index })
				: this.pages[this.index];

			const page = isFunction(rawPage) ? await rawPage() : rawPage;

			return {
				...page,
				components:
					this.totalPages === 1
						? []
						: [
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									controlButtons.map(btn =>
										new ButtonBuilder()
											.setStyle(ButtonStyle.Secondary)
											.setCustomId(btn.customId)
											.setEmoji(btn.emoji)
									)
								)
							]
			};
		} catch (err) {
			let msg = 'Sorry, something went wrong.';
			if (typeof err === 'string') msg = err;
			else if (err instanceof UserError) msg = err.message;
			return { content: msg };
		}
	}

	protected async handleCollector(message: Message, targetUsers?: string[]) {
		const collector = message.createMessageComponentCollector({
			time: Time.Minute * 10,
			componentType: ComponentType.Button
		});

		collector.on('collect', async (interaction: ButtonInteraction) => {
			if (targetUsers && !targetUsers.includes(interaction.user.id)) {
				await interaction.reply({ content: "This isn't your message!", ephemeral: true });
				return;
			}

			for (const action of controlButtons) {
				if (interaction.customId === action.customId) {
					const previousIndex = this.index;
					action.run({ paginatedMessage: this });

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

		collector.on('end', () => message.edit({ components: [] }));
	}

	abstract run(targetUsers?: string[]): Promise<void>;
}

export class PaginatedMessage extends BasePaginatedMessage {
	public channel: TextChannel;

	constructor({
		channel,
		pages,
		startingPage,
		onError
	}: {
		channel: TextChannel;
		pages: PaginatedPages;
		startingPage?: number;
		onError: (err: Error, itx?: ButtonInteraction) => void;
	}) {
		super(pages, startingPage, onError);
		this.channel = channel;
	}

	async run(targetUsers?: string[]) {
		const message = await this.channel.send((await this.render()) as BaseMessageOptions);
		if (this.totalPages === 1) return;
		await this.handleCollector(message, targetUsers);
	}
}

export class EphemeralPaginatedMessage extends BasePaginatedMessage {
	public interaction: ChatInputCommandInteraction;

	constructor({
		interaction,
		pages,
		startingPage,
		onError
	}: {
		interaction: ChatInputCommandInteraction;
		pages: PaginatedPages;
		startingPage?: number;
		onError: (err: Error, itx?: ButtonInteraction) => void;
	}) {
		super(pages, startingPage, onError);
		this.interaction = interaction;
	}

	async run(targetUsers?: string[]) {
		const baseOptions = await this.render();
		await this.interaction.reply({
			...baseOptions,
			content: baseOptions.content ?? undefined,
			flags: MessageFlags.Ephemeral
		});
		if (this.totalPages === 1) return;
		const msg = await this.interaction.fetchReply();
		await this.handleCollector(msg, targetUsers);
	}
}

export async function makePaginatedMessage(
	channel: TextChannel,
	pages: PaginatedMessagePage[],
	onError: (err: Error, itx?: ButtonInteraction) => unknown,
	target?: string
) {
	const m = new PaginatedMessage({ pages, channel, onError });
	return m.run(target ? [target] : undefined);
}

export async function makeEphemeralPaginatedMessage(
	interaction: ChatInputCommandInteraction,
	pages: PaginatedMessagePage[],
	onError: (err: Error, itx?: ButtonInteraction) => unknown,
	target?: string
) {
	const m = new EphemeralPaginatedMessage({ pages, interaction, onError });
	return m.run(target ? [target] : undefined);
}
