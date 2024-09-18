import { formatOrdinal } from '@oldschoolgg/toolkit';
import { EmbedBuilder, type Message, type User } from 'discord.js';
import { Time, isFunction, randArrItem, shuffleArr } from 'e';
import fetch from 'node-fetch';
import { Bank, Items, LootTable, Monsters } from 'oldschooljs';

import { production } from '../config';
import { itemNameFromID, roll, stringMatches } from '../lib/util';
import { userStatsUpdate } from '../mahoji/mahojiSettings';
import { MysteryBoxes } from './bsoOpenables';
import { allCollectionLogsFlat } from './data/Collections';
import Createables from './data/createables';
import killableMonsters from './minions/data/killableMonsters';
import { BSOMonsters } from './minions/data/killableMonsters/custom/customMonsters';
import { sendToChannelID } from './util/webhook';
import { LampTable } from './xpLamps';

const triviaChallenge: Challenge = async (msg: Message): Promise<User | null> => {
	if (!msg.channel.isSendable()) return null;
	const { question, correct_answer, incorrect_answers } = await fetch(
		'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple'
	)
		.then(res => res.json())
		.then(res => res.results[0]);

	const allAnswers = [correct_answer, ...incorrect_answers].sort(() => 0.5 - Math.random());

	const embed = new EmbedBuilder()
		.setTitle('Reply with the answer for a reward!')
		.setDescription(`${question}\n\nPossible answers: ${allAnswers.join(', ')}`)
		.setThumbnail(
			'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png'
		);

	await sendToChannelID(msg.channelId, { embed: embed });

	try {
		const collected = await msg.channel.awaitMessages({
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter: _msg => stringMatches(_msg.content, correct_answer)
		});

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		await sendToChannelID(msg.channelId, 'Nobody answered in time, sorry!');
		return null;
	}
};

const itemChallenge: Challenge = async (msg: Message): Promise<User | null> => {
	if (!msg.channel.isSendable()) return null;
	const randomItem = Items.random();
	const scrambed = randomItem.name
		.split(' ')
		.map(part => shuffleArr([...part]).join(''))
		.join(' ');

	const embed = new EmbedBuilder()
		.setTitle('Reply with the answer for a reward!')
		.setDescription(`Unscramble this item name for a reward: ${scrambed}`)
		.setThumbnail(
			'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png'
		);

	await sendToChannelID(msg.channelId, { embed });

	try {
		const collected = await msg.channel.awaitMessages({
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter: _msg => stringMatches(_msg.content, randomItem.name)
		});

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		await sendToChannelID(msg.channelId, 'Nobody answered in time, sorry!');
		return null;
	}
};

const createdChallenge: Challenge = async (msg: Message): Promise<User | null> => {
	if (!msg.channel.isSendable()) return null;
	const all = Createables.filter(
		i =>
			['revert', 'fix', '(', 'unlock', 'unpack', 'pouch', ' set', 'graceful'].every(
				o => !i.name.toLowerCase().includes(o)
			) &&
			Object.keys(i.outputItems).length === 1 &&
			!isFunction(i.inputItems)
	);
	const randomCreatable = randArrItem(all);

	const embed = new EmbedBuilder()
		.setTitle('Reply with the answer for a reward!')
		.setDescription(
			`What item is created using these? ${
				isFunction(randomCreatable.inputItems)
					? "This shouldn't be possible..."
					: randomCreatable.inputItems instanceof Bank
						? randomCreatable.inputItems
						: new Bank(randomCreatable.inputItems)
			}`
		)
		.setThumbnail(
			'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png'
		);

	await msg.channel.send({ embeds: [embed] });

	try {
		const collected = await msg.channel.awaitMessages({
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter: _msg => stringMatches(_msg.content, randomCreatable.name)
		});

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		await msg.channel.send(`Nobody answered in time, sorry! The correct answer was: ${randomCreatable.name}`);
		return null;
	}
};
const monsters = [...Object.values(BSOMonsters), ...killableMonsters]
	.map(i => {
		let allItems = [];
		if (i.table instanceof LootTable) {
			allItems = i.table.allItems;
		} else {
			allItems = Monsters.get(i.id)!.allItems;
		}

		return {
			name: i.name,
			allItems
		};
	})
	.filter(m => m.allItems.length >= 3);

const monsterDropChallenge: Challenge = async (msg: Message): Promise<User | null> => {
	const monster = randArrItem(monsters);
	if (!msg.channel.isSendable()) return null;

	const items = shuffleArr(monster.allItems).slice(0, 3);
	const validMonsters = monsters.filter(mon => items.every(t => mon.allItems.includes(t)));

	const embed = new EmbedBuilder()
		.setTitle('Reply with the answer for a reward!')
		.setDescription(`Name a monster that drops these 3 items: ${items.map(itemNameFromID).join(', ')}`)
		.setThumbnail(
			'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png'
		);

	await msg.channel.send({ embeds: [embed] });

	try {
		const collected = await msg.channel.awaitMessages({
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter: _msg => validMonsters.some(m => stringMatches(_msg.content, m.name))
		});

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		await sendToChannelID(msg.channelId, `Nobody answered in time, sorry! The correct answer was: ${monster.name}`);
		return null;
	}
};

const collectionLogChallenge: Challenge = async (msg: Message): Promise<User | null> => {
	const cl = randArrItem(allCollectionLogsFlat);
	if (!msg.channel.isSendable()) return null;
	const embed = new EmbedBuilder()
		.setTitle('Reply with the answer for a reward!')
		.setDescription(`Name any item from this collection log: ${cl.name}`)
		.setThumbnail(
			'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png'
		);

	await sendToChannelID(msg.channelId, { embed });

	try {
		const collected = await msg.channel.awaitMessages({
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter: _msg => cl.items.some(c => stringMatches(_msg.content, itemNameFromID(c)))
		});

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		await sendToChannelID(msg.channelId, 'Nobody answered in time, sorry!');
		return null;
	}
};
// export async function reactChallenge(msg: Message): Promise<User | null> {
// 	const embed = new EmbedBuilder()
// 		.setTitle('Answer this for a reward!')
// 		.setDescription('React to this message with any emoji for a reward!')
// 		.setThumbnail(
// 			'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png'
// 		);

// 	const message = await msg.channel.send({ embeds: [embed] });
// 	try {
// 		let winner = null;
// 		const collected = await message.createReactionCollector({
// 			time: Time.Second * 10
// 		});
// 		collected.on('collect', a => {
// 			console.log(a);
// 			winner = a.users.cache.first();
// 		});
// 		await sleep(Time.Second * 10);
// 		return winner;
// 	} catch (err) {
// 		await msg.channel.send('Nobody reacted in time, sorry!');
// 		return null;
// 	}
// }

type Challenge = (msg: Message) => Promise<User | null>;

let lastDrop = 0;

const channelID = production ? '792691343284764693' : '944924763405574174';

export async function boxSpawnHandler(msg: Message) {
	if (!production) return;
	if (msg.channel.id !== channelID || msg.author.bot) {
		return;
	}
	if (Date.now() - lastDrop < Time.Minute * 5) return;
	if (!roll(20)) return;
	lastDrop = Date.now();

	const item: Challenge = randArrItem([
		itemChallenge,
		triviaChallenge,
		createdChallenge,
		collectionLogChallenge,
		collectionLogChallenge,
		monsterDropChallenge,
		monsterDropChallenge
	]);
	const winner = await item(msg);
	if (!winner) return;
	const winnerUser = await mUserFetch(winner.id);
	const newStats = await userStatsUpdate(
		winnerUser.id,
		{
			main_server_challenges_won: {
				increment: 1
			}
		},
		{ main_server_challenges_won: true }
	);
	const wonStr = `This is your ${formatOrdinal(newStats.main_server_challenges_won)} challenge win!`;
	const loot = roll(20) ? LampTable.roll() : MysteryBoxes.roll();

	await winnerUser.addItemsToBank({ items: loot, collectionLog: true });
	return sendToChannelID(msg.channelId, {
		content: `Congratulations, ${winner}! You received: **${loot}**. ${wonStr}`
	});
}
