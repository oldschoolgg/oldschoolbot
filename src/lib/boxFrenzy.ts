import { TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { Bank, Items } from 'oldschooljs';

import { getRandomMysteryBox } from './data/openables';
import { itemNameFromID, stringMatches } from './util';

export async function boxFrenzy(channel: TextChannel, content: string, quantity: number) {
	let bank = new Bank();
	for (let i = 0; i < quantity; i++) {
		bank.add(Items.random().id, 1);
	}
	const items = bank.items();

	const guessed = new Set();

	try {
		channel.sendBankImage({
			bank: bank.bank,
			content,
			title: `Guess These Item Names For A Mystery Box`
		});

		await channel.awaitMessages(
			(_msg: KlasaMessage) => {
				const isRight = items.find(
					i => stringMatches(i[0].name, _msg.content) && !guessed.has(i[0].id)
				);
				if (isRight) {
					const item = isRight[0];
					const box = getRandomMysteryBox();
					_msg.author.addItemsToBank({ [box]: 1 });
					guessed.add(item.id);
					_msg.channel.send(
						`${
							_msg.author
						}, you guessed one of the items correctly and received 1x ${itemNameFromID(
							box
						)}.`
					);
				}
				return false;
			},
			{
				max: 1,
				time: 60_000,
				errors: ['time']
			}
		);
		channel.send(`The box frenzy has ended, ${guessed.size} boxes were given out.`);
	} catch (err) {
		console.error(err);
	}
}
