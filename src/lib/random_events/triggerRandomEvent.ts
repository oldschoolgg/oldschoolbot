import { Channel, MessageEmbed, TextChannel } from 'discord.js';
import { randArrItem, randInt, Time } from 'e';
import fs from 'fs';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { hasBasicChannelPerms } from '../util/hasBasicChannelPerms';
import { RandomEvent, RandomEvents } from '.';

const cache = new Map<string, number>();

let triviaQuestions: { q: string; a: string[] }[] = [
	{
		q:
			'Out of Iron Ore and Coal, which is more likely to give Unidentified minerals in the mining guild?',
		a: ['coal']
	}
];
try {
	// eslint-disable-next-line prefer-destructuring
	triviaQuestions = JSON.parse(
		fs.readFileSync('./src/lib/resources/trivia-questions.json').toString()
	).triviaQuestions;
} catch (_) {}

async function finalizeEvent(event: RandomEvent, user: KlasaUser, ch: TextChannel) {
	const loot = new Bank();
	if (event.outfit) {
		for (const piece of event.outfit) {
			if (!user.hasItemEquippedOrInBank(piece)) {
				loot.add(piece);
				break;
			}
		}
	}
	loot.add(event.loot.roll());
	await user.addItemsToBank(loot.bank, true);
	ch.send(`You finished the ${event.name} event, and received... ${loot}.`);
}

export async function triggerRandomEvent(ch: Channel, user: KlasaUser) {
	if (user.settings.get(UserSettings.BitField).includes(BitField.DisabledRandomEvents)) {
		console.log(`${user.username} not getting event because disabled for user`);
		return;
	}

	if (!hasBasicChannelPerms(ch)) {
		console.log(`${user.username} not getting event because insufficient channel perms`);
		return;
	}
	const prev = cache.get(user.id);

	// Max 1 event per 30 mins per user
	if (prev && Date.now() - prev < Time.Minute * 30) {
		console.log(`${user.username} not getting event because of 30min limit`);
		return;
	}

	const event = randArrItem(RandomEvents);
	const roll = randInt(1, 4);
	user.log(`getting ${event.name} random event.`);
	switch (roll) {
		case 1: {
			const randTrivia = randArrItem(triviaQuestions);
			await ch.send(
				`${user}, you've encountered the ${event.name} random event! To complete this event, answer this trivia question... ${randTrivia.q}`
			);
			try {
				await ch.awaitMessages(
					answer =>
						answer.author.id === user.id &&
						randTrivia.a.includes(answer.content.toLowerCase()),
					{
						max: 1,
						time: 30_000,
						errors: ['time']
					}
				);
				finalizeEvent(event, user, ch);
				return;
			} catch (err) {
				return ch.send("You didn't give the correct answer, and failed the random event!");
			}
		}
		case 2: {
			const embed = new MessageEmbed().setImage(
				'https://cdn.discordapp.com/attachments/357422607982919680/801688145120067624/Certer_random_event.png'
			);
			await ch.send(
				`${user}, you've encountered the ${event.name} random event! To complete this event, specify the letter corresponding to the answer in this image:`,
				embed
			);
			try {
				await ch.awaitMessages(
					answer => answer.author.id === user.id && answer.content.toLowerCase() === 'a',
					{
						max: 1,
						time: 30_000,
						errors: ['time']
					}
				);
				finalizeEvent(event, user, ch);
				return;
			} catch (err) {
				return ch.send(`You didn't give the right answer - random event failed!`);
			}
		}
		case 3: {
			const embed = new MessageEmbed().setImage(
				'https://cdn.discordapp.com/attachments/342983479501389826/807737932072747018/nmgilesre.gif'
			);
			await ch.send(
				`${user}, you've encountered the ${event.name} random event! To complete this event, specify the letter corresponding to the answer in this image:`,
				embed
			);
			try {
				await ch.awaitMessages(
					answer => answer.author.id === user.id && answer.content.toLowerCase() === 'a',
					{
						max: 1,
						time: 30_000,
						errors: ['time']
					}
				);
				finalizeEvent(event, user, ch);
				return;
			} catch (err) {
				return ch.send(`You didn't give the right answer - random event failed!`);
			}
		}
		case 4: {
			const message = await ch.send(
				`${user}, you've encountered the ${event.name} random event! To complete this event, reaction to this message with any emoji.`
			);
			try {
				await message.awaitReactions((_, _user) => user.id === _user.id, {
					max: 1,
					time: 30_000,
					errors: ['time']
				});
				finalizeEvent(event, user, ch);
				return;
			} catch (err) {
				return ch.send(`You didn't react - you failed the random event!`);
			}
		}
		default: {
			throw new Error('Unmatched switch case');
		}
	}
}
