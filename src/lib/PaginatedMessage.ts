import { MessageEditOptions, MessageOptions, TextChannel } from 'discord.js';
import { Time } from 'e';

const paginatedMessageCache = new Set<PaginatedMessage>();

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
	public pages: MessageEditOptions[];
	public channel: TextChannel;

	constructor({ channel, pages }: { channel: TextChannel; pages: MessageEditOptions[] }) {
		this.pages = pages;
		this.channel = channel;

		paginatedMessageCache.add(this);
	}

	async run(targetUsers?: string[]) {
		const message = await this.channel.send(this.pages[0] as MessageOptions);
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
						await interaction.update(this.pages[this.index]);
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
