import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Monitor, MonitorStore } from 'klasa';
import fetch from 'node-fetch';

import { Color, SupportServer, Time } from '../lib/constants';
import { getRandomMysteryBox } from '../lib/openables';
import { itemID, roll, stringMatches } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';

export default class extends Monitor {
	public lastDrop = 0;

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			ignoreOthers: false,
			ignoreBots: true,
			ignoreEdits: true,
			ignoreSelf: true
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) {
			return;
		}

		if (msg.channel.id !== '732207379818479756') {
			return;
		}

		if (Date.now() - this.lastDrop < Time.Minute * 5) return;
		if (!roll(20)) return;
		this.lastDrop = Date.now();

		const { question, correct_answer, incorrect_answers } = await fetch(
			'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple'
		)
			.then(res => res.json())
			.then(res => res.results[0]);

		const allAnswers = [correct_answer, ...incorrect_answers].sort(() => 0.5 - Math.random());

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle('Answer this for a Mystery box!')
			.setDescription(`${question}\n\nPossible answers: ${allAnswers.join(', ')}`);

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

			const col = collected.first();
			if (!col) return;
			const winner = col.author!;
			const box = roll(10) ? getRandomMysteryBox() : itemID('Mystery box');
			await winner.addItemsToBank({ [box]: 1 });
			return msg.channel.send(
				`Congratulations, ${winner}! You got it. I've given you: **1x ${
					getOSItem(box).name
				}**.`
			);
		} catch (err) {
			return msg.channel.send(`Nobody got it! :(`);
		}
	}
}
