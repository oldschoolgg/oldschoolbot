import { type Message, TextChannel } from 'discord.js';
import { noOp } from 'e';
import { Bank, Items } from 'oldschooljs';

import { MysteryBoxes } from './bsoOpenables';
import { stringMatches } from './util';
import { makeBankImage } from './util/makeBankImage';

export async function boxFrenzy(channelID: string, content: string, quantity: number) {
	const channel = globalClient.channels.cache.get(channelID);
	if (!channel || !(channel instanceof TextChannel)) {
		throw new Error(`Tried to start box frenzy in invalid channel ${channelID}`);
	}

	const bank = new Bank();
	for (let i = 0; i < quantity; i++) {
		bank.add(Items.random().id, 1);
	}
	const items = bank.items();

	const guessed = new Set();

	const image = await makeBankImage({ bank, title: 'Guess These Item Names For A Mystery Box' });

	try {
		const message = await channel.send({
			content: `${content}
			
**Reply to this message with your guesses** (Right click -> Reply)`,
			files: [image.file]
		});

		await channel
			.awaitMessages({
				time: 60_000,
				errors: ['time'],
				filter: async (_msg: Message) => {
					const isRight = items.find(i => stringMatches(i[0].name, _msg.content) && !guessed.has(i[0].id));
					if (isRight) {
						const item = isRight[0];
						const loot = MysteryBoxes.roll();
						const user = await mUserFetch(_msg.author.id);
						await user.addItemsToBank({ items: loot, collectionLog: true });
						guessed.add(item.id);
						_msg.channel.send(
							`${_msg.author}, you guessed one of the items correctly and received ${loot}.`
						);
					}
					return false;
				}
			})
			.then(() => message.edit({ content: 'Finished!', files: [] }))
			.catch(noOp);

		await channel.send(`The box frenzy has ended, ${guessed.size} boxes were given out.`);
	} catch (err) {
		console.error(err);
	}
}
