import { BSOMonsters } from '@/lib/bso/monsters/customMonsters.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import type { GatewayMessageCreateDispatchData } from '@oldschoolgg/discord';
import { EmbedBuilder } from '@oldschoolgg/discord';
import { randArrItem, roll, shuffleArr } from '@oldschoolgg/rng';
import type { IMessage } from '@oldschoolgg/schemas';
import { formatOrdinal, isFunction, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, Items, LootTable, Monsters } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';
import { allCollectionLogsFlat } from '@/lib/data/Collections.js';
import Createables from '@/lib/data/createables.js';
import killableMonsters from '../minions/data/killableMonsters/index.js';
import { LampTable } from './xpLamps.js';

const MYSTERY_BOX_THUMBNAIL =
	'https://cdn.discordapp.com/attachments/357422607982919680/1100378550189707314/534px-Mystery_box_detail.png';

async function runChallenge({
	msg,
	description,
	filter,
	timeoutMessage
}: {
	msg: IMessage;
	description: string;
	filter: (msg: GatewayMessageCreateDispatchData) => boolean;
	timeoutMessage?: string;
}): Promise<MUser | null> {
	if (!(await globalClient.channelIsSendable(msg.channel_id))) return null;

	const embed = new EmbedBuilder()
		.setTitle('Reply with the answer for a reward!')
		.setDescription(description)
		.setThumbnail(MYSTERY_BOX_THUMBNAIL);

	await globalClient.sendMessage(msg.channel_id, { embeds: [embed] });

	try {
		const [winnerMsg] = await globalClient.awaitMessages({
			channelId: msg.channel_id,
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter
		});

		if (!winnerMsg) return null;
		return await mUserFetch(winnerMsg.author.id);
	} catch (_err) {
		await globalClient.sendMessage(msg.channel_id, timeoutMessage ?? 'Nobody answered in time, sorry!');
		return null;
	}
}

const triviaChallenge: Challenge = async (msg: IMessage): Promise<MUser | null> => {
	const { question, correct_answer, incorrect_answers } = await fetch(
		'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple'
	)
		.then(res => res.json())
		.then((res: any) => res.results[0]);

	const allAnswers = [correct_answer, ...incorrect_answers].sort(() => 0.5 - Math.random());

	return runChallenge({
		msg,
		description: `${question}\n\nPossible answers: ${allAnswers.join(', ')}`,
		filter: _msg => stringMatches(_msg.content, correct_answer)
	});
};

const itemChallenge: Challenge = async (msg: IMessage): Promise<MUser | null> => {
	const randomItem = Items.random();
	const scrambed = randomItem.name
		.split(' ')
		.map(part => shuffleArr([...part]).join(''))
		.join(' ');

	return runChallenge({
		msg,
		description: `Unscramble this item name for a reward: ${scrambed}`,
		filter: _msg => stringMatches(_msg.content, randomItem.name)
	});
};

const createdChallenge: Challenge = async (msg: IMessage): Promise<MUser | null> => {
	const all = Createables.filter(
		i =>
			['revert', 'fix', '(', 'unlock', 'unpack', 'pouch', ' set', 'graceful'].every(
				o => !i.name.toLowerCase().includes(o)
			) &&
			Object.keys(i.outputItems).length === 1 &&
			!isFunction(i.inputItems)
	);
	const randomCreatable = randArrItem(all);

	return runChallenge({
		msg,
		description: `What item is created using these? ${
			isFunction(randomCreatable.inputItems)
				? "This shouldn't be possible..."
				: randomCreatable.inputItems instanceof Bank
					? randomCreatable.inputItems
					: new Bank(randomCreatable.inputItems)
		}`,
		filter: _msg => stringMatches(_msg.content, randomCreatable.name),
		timeoutMessage: `Nobody answered in time, sorry! The correct answer was: ${randomCreatable.name}`
	});
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

const monsterDropChallenge: Challenge = async (msg: IMessage): Promise<MUser | null> => {
	const monster = randArrItem(monsters);
	const items = shuffleArr(monster.allItems).slice(0, 3);
	const validMonsters = monsters.filter(mon => items.every(t => mon.allItems.includes(t)));

	return runChallenge({
		msg,
		description: `Name a monster that drops these 3 items: ${items.map(id => Items.itemNameFromId(id)).join(', ')}`,
		filter: _msg => validMonsters.some(m => stringMatches(_msg.content, m.name)),
		timeoutMessage: `Nobody answered in time, sorry! The correct answer was: ${monster.name}`
	});
};

const collectionLogChallenge: Challenge = async (msg: IMessage): Promise<MUser | null> => {
	const cl = randArrItem(allCollectionLogsFlat);

	return runChallenge({
		msg,
		description: `Name any item from this collection log: ${cl.name}`,
		filter: _msg => cl.items.values().some(c => stringMatches(_msg.content, Items.itemNameFromId(c)))
	});
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
// 			winner = a.users.cache.first();
// 		});
// 		await sleep(Time.Second * 10);
// 		return winner;
// 	} catch (err) {
// 		await msg.channel.send('Nobody reacted in time, sorry!');
// 		return null;
// 	}
// }

type Challenge = (msg: IMessage) => Promise<MUser | null>;

let lastDrop = 0;

const channelId = globalConfig.isProduction ? '792691343284764693' : '944924763405574174';

export async function boxSpawnHandler(msg: IMessage) {
	if (!globalConfig.isProduction) return;
	if (msg.channel_id !== channelId) {
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
	const wonStr = `This is your ${formatOrdinal(await winner.fetchUserStat('main_server_challenges_won'))} challenge win!`;
	const loot = roll(20) ? LampTable.roll() : MysteryBoxes.roll();

	await winner.addItemsToBank({ items: loot, collectionLog: true });
	await winner.statsUpdate({
		main_server_challenges_won: {
			increment: 1
		}
	});
	return globalClient.sendMessage(msg.channel_id, {
		content: `Congratulations, <@${winner.id}>! You received: **${loot}**. ${wonStr}`
	});
}
