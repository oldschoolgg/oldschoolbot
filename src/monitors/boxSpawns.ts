import { isFunction } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import { randArrItem, shuffleArr, Time } from 'e';
import he from 'he';
import { KlasaMessage, KlasaUser, Monitor, MonitorStore } from 'klasa';
import fetch from 'node-fetch';
import { Bank, Items } from 'oldschooljs';

import { production, SupportServer } from '../config';
import { MysteryBoxes } from '../lib/bsoOpenables';
import { Channel, Color } from '../lib/constants';
import Createables from '../lib/data/createables';
import { roll, stringMatches } from '../lib/util';

export async function triviaChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	let { question, correct_answer, incorrect_answers } = await fetch(
		'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple'
	)
		.then(res => res.json())
		.then(res => res.results[0]);

	correct_answer = he.decode(correct_answer);
	incorrect_answers = incorrect_answers.map((s: string) => he.decode(s));
	question = he.decode(question);

	const allAnswers = [correct_answer, ...incorrect_answers].sort(() => 0.5 - Math.random());

	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription(`${he.decode(question)}\n\nPossible answers: ${allAnswers.join(', ')}`);

	await msg.channel.send({ embeds: [embed] });

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
		msg.channel.send('Nobody answered in time, sorry!');
		return null;
	}
}

export async function itemChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	const randomItem = Items.random();
	const scrambed = randomItem.name
		.split(' ')
		.map(part => shuffleArr([...part]).join(''))
		.join(' ');

	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription(`Unscramble this item name for a reward: ${scrambed}`);
	await msg.channel.send({ embeds: [embed] });

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
		msg.channel.send(`Nobody answered in time, sorry! The correct answer was: ${randomItem.name}`);
		return null;
	}
}

export async function createdChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	const all = Createables.filter(
		i =>
			['revert', 'fix', '(', 'unlock', 'unpack', 'pouch', ' set', 'graceful'].every(
				o => !i.name.toLowerCase().includes(o)
			) && Object.keys(i.outputItems).length === 1
	);
	const randomCreatable = randArrItem(all);

	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription(
			`What item is created using these? ${
				isFunction(randomCreatable.inputItems)
					? randomCreatable.inputItems(msg.author)
					: randomCreatable.inputItems instanceof Bank
					? randomCreatable.inputItems
					: new Bank(randomCreatable.inputItems)
			}`
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
		msg.channel.send(`Nobody answered in time, sorry! The correct answer was: ${randomCreatable.name}`);
		return null;
	}
}

export async function reactChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription('React to this message with any emoji for a reward!');
	const message = await msg.channel.send({ embeds: [embed] });
	try {
		const collected = await message.awaitReactions({
			max: 1,
			time: Time.Second * 30,
			errors: ['time'],
			filter: () => true
		});
		const winner = collected.first()?.users.cache.first();
		return winner ?? null;
	} catch (err) {
		return null;
	}
}

async function challenge(msg: KlasaMessage) {
	const item = randArrItem([itemChallenge, itemChallenge, createdChallenge, reactChallenge, triviaChallenge]);
	const winner = await item(msg);
	if (winner) {
		const loot = MysteryBoxes.roll();
		await winner.addItemsToBank({ items: loot, collectionLog: false });
		return msg.channel.send(`Congratulations, ${winner}! You received: **${loot}**.`);
	}
}

export default class extends Monitor {
	public lastDrop = 0;

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: production,
			ignoreOthers: false,
			ignoreBots: true,
			ignoreEdits: true,
			ignoreSelf: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer || msg.channel.id !== Channel.BSOGeneral) {
			return;
		}

		if (Date.now() - this.lastDrop < Time.Minute * 5) return;
		if (!roll(20)) return;
		this.lastDrop = Date.now();
		challenge(msg);
	}
}
