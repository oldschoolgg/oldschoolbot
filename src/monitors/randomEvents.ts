import { Monitor, MonitorStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';

import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { channelIsSendable } from '../lib/util/channelIsSendable';
import { Emoji, Time } from '../lib/constants';
import { shuffle } from '../lib/util';
import resolveItems from '../lib/util/resolveItems';

const numberEmojis = [Emoji.One, Emoji.Two, Emoji.Three, Emoji.Four];

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, { ignoreOthers: false, enabled: true });
	}

	/* eslint-disable consistent-return */
	async run(msg: KlasaMessage) {
		if (!msg.guild || !msg.guild.settings.get(GuildSettings.RandomEvents.Enabled)) return;

		// If no redirect channel, and the bot can't speak in this channel, return.
		if (
			!channelIsSendable(msg.channel) &&
			!msg.guild.settings.get(GuildSettings.RandomEvents.RedirectChannel)
		) {
			return;
		}

		// Can't get a random event if minion isn't doing something.
		// if (!msg.author.minionIsBusy) return;
		if (msg.channel.id !== '701085094659489843') return;
		if (msg.author.id !== '157797566833098752') return;

		return this.drillDemon(msg);
	}

	async drillDemon(msg: KlasaMessage) {
		let afterMessage = '';
		const generate = (str: string) =>
			new MessageEmbed()
				.setDescription(
					`**Sergeant Damien:** ${str} ${
						Boolean(afterMessage) ? `\n\n${afterMessage}` : ''
					}`
				)
				.setThumbnail(
					'https://cdn.discordapp.com/attachments/357422607982919680/701069963594825749/Sergeant_Damien_chathead.png'
				);

		const workouts = shuffle([
			[`I want to see you on that mat doing star jumps, private!`, 'Star Jumps'],
			['Drop and give me push ups on that mat, private!', 'Push Ups'],
			['Get yourself over there and jog on that mat, private!', 'Jog'],
			['Get on that mat and give me sit ups, private!', 'Sit Ups']
		]);

		const embed = generate(
			`Private ${msg.author.minionName}, atten-SHUN! You've been recommended for my corps. Do you think you can be the best?`
		);

		const eventMessage = await msg.channel.send(embed);
		const saidYes = await eventMessage.askBoolean(msg.author);
		if (!saidYes) {
			eventMessage.edit(generate(`As you were, soldier.`));
			return;
		}

		// Add 1234 reactions
		let failedToReact = false;
		for (const emoji of numberEmojis) {
			await eventMessage.react(emoji).catch(() => {
				failedToReact = true;
			});
		}
		if (failedToReact) {
			return eventMessage.edit(
				`Oops! I don't have permissions to add reactions, or failed to add them :(`
			);
		}

		let shuffledWorkouts = workouts;
		let numWrong = 0;
		for (const workout of workouts) {
			// Randomize order of shuffledWorkouts on each iteration
			shuffledWorkouts = shuffle(workouts);

			await eventMessage.edit(
				generate(
					`${workout[0]}\n\n${shuffledWorkouts
						.map((wk, ind) => `${wk[1]}: ${ind + 1}`)
						.join('\n')}`
				)
			);
			const reactions = await eventMessage.awaitReactions(
				(reaction, user) => {
					return user === msg.author && numberEmojis.includes(reaction.emoji.toString());
				},
				{
					time: Time.Second * 20,
					max: 1
				}
			);

			if (!reactions || reactions.size === 0 || !reactions.first()) {
				eventMessage.removeAllReactions();
				await eventMessage.edit(
					generate(`You didn't answer in time! Get out of my sight.`)
				);
				return;
			}

			const wasRight =
				shuffledWorkouts.indexOf(workout) ===
				numberEmojis.indexOf(reactions.first()!.emoji.toString() as Emoji);

			if (!wasRight) {
				numWrong++;
				if (numWrong === 2) {
					afterMessage = '';
					eventMessage.removeAllReactions();
					await eventMessage.edit(generate(`You got it wrong again! You're out.`));
					return;
				}
				afterMessage = `That's wrong! Another one wrong, and you're getting kicked out!`;
			}
		}

		afterMessage = '';
		eventMessage.removeAllReactions();

		for (const reward of resolveItems([
			'Camo helmet',
			'Camo top',
			'Camo bottoms'
		]) as number[]) {
			const hasThis = msg.author.hasItemEquippedOrInBank(reward);
			if (!hasThis) {
				await msg.author.addItemsToBank({ [reward]: 1 });
				await eventMessage.edit(
					generate(
						`Well I'll be, you actually did it, Private. Now take this camo outfit piece and get out of my sight.`
					)
				);
				return;
			}
		}

		msg.author.addGP(500);
		await eventMessage.edit(
			generate(
				`Well I'll be, you actually did it, Private. Now take 500 GP and get out of my sight.`
			)
		);
	}
}
