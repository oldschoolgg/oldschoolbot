import { MessageReaction, ReactionCollector, User } from 'discord.js';

export class CustomReactionCollector extends ReactionCollector {
	// @ts-ignore Custom implementation that returns all event parameters
	async *[Symbol.asyncIterator](): AsyncIterableIterator<[MessageReaction, User]> {
		const queue: [MessageReaction, User][] = [];
		const onCollect = (...items: [MessageReaction, User]) => queue.push(items);
		this.on('collect', onCollect);

		try {
			while (queue.length || !this.ended) {
				if (queue.length) {
					yield queue.shift()!;
				} else {
					// eslint-disable-next-line no-await-in-loop
					await new Promise<void>(resolve => {
						const tick = () => {
							this.removeListener('collect', tick);
							this.removeListener('end', tick);
							return resolve();
						};
						this.on('collect', tick);
						this.on('end', tick);
					});
				}
			}
		} finally {
			this.removeListener('collect', onCollect);
		}
	}
}
