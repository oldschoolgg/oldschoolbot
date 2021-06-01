import { MessageEmbed } from 'discord.js';
import { randArrItem, shuffleArr } from 'e';
import he from 'he';
import { KlasaMessage, KlasaUser, Monitor, MonitorStore } from 'klasa';
import fetch from 'node-fetch';
import { Bank, Items } from 'oldschooljs';

import { production } from '../config';
import { Color, SupportServer, Time } from '../lib/constants';
import { getRandomMysteryBox } from '../lib/data/openables';
import { roll, stringMatches } from '../lib/util';

async function triviaChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	const { question, correct_answer, incorrect_answers } = await fetch(
		'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple'
	)
		.then(res => res.json())
		.then(res => res.results[0]);

	const allAnswers = [correct_answer, ...incorrect_answers].sort(() => 0.5 - Math.random());

	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription(`${he.decode(question)}\n\nPossible answers: ${allAnswers.join(', ')}`);

	await msg.channel.send(embed);

	try {
		const collected = await msg.channel.awaitMessages(
			_msg => stringMatches(_msg.content, correct_answer),
			{
				max: 1,
				time: 14_000,
				errors: ['time']
			}
		);

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		msg.channel.send('Nobody answered in time, sorry!');
		return null;
	}
}
async function itemChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	const randomItem = Items.random();
	const scrambed = randomItem.name
		.split(' ')
		.map(part => shuffleArr([...part]).join(''))
		.join(' ');

	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription(`Unscramble this item name for a reward: ${scrambed}`);
	await msg.channel.send(embed);

	try {
		const collected = await msg.channel.awaitMessages(
			_msg => stringMatches(_msg.content, randomItem.name),
			{
				max: 1,
				time: 14_000,
				errors: ['time']
			}
		);

		const winner = collected.first()?.author;
		return winner ?? null;
	} catch (err) {
		msg.channel.send('Nobody answered in time, sorry!');
		return null;
	}
}

async function reactChallenge(msg: KlasaMessage): Promise<KlasaUser | null> {
	const embed = new MessageEmbed()
		.setColor(Color.Orange)
		.setTitle('Answer this for a reward!')
		.setDescription(`React to this message with any emoji for a reward!`);
	const message = await msg.channel.send(embed);
	try {
		const collected = await message.awaitReactions(() => true, {
			max: 1,
			time: 30_000,
			errors: ['time']
		});
		const winner = collected.first()?.users.cache.first();
		return winner ?? null;
	} catch (err) {
		return null;
	}
}

async function challenge(msg: KlasaMessage) {
	const item = randArrItem([
		itemChallenge,
		itemChallenge,
		itemChallenge,
		itemChallenge,
		reactChallenge,
		triviaChallenge
	]);
	const winner = await item(msg);
	if (winner) {
		const loot = new Bank().add(getRandomMysteryBox());
		await winner.addItemsToBank(loot);
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
		if (
			!msg.guild ||
			msg.guild.id !== SupportServer ||
			msg.channel.id !== '792691343284764693'
		) {
			return;
		}

		if (Date.now() - this.lastDrop < Time.Minute * 5) return;
		if (!roll(20)) return;
		this.lastDrop = Date.now();
		challenge(msg);
	}
}
