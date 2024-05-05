import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { noOp, shuffleArr, Time } from 'e';
import murmurhash from 'murmurhash';

import { channelIsSendable } from '../../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export async function buttonUserPicker({
	channelID,
	str,
	timer = Time.Second * 30,
	ironmenAllowed,
	answers,
	creator,
	creatorGetsTwoGuesses
}: {
	channelID: string;
	str: string;
	timer?: number;
	ironmenAllowed: boolean;
	initialUsers?: bigint[];
	answers: string[];
	creator: string;
	creatorGetsTwoGuesses?: boolean;
}) {
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');

	const correctCustomID = murmurhash(answers[0]).toString();

	const buttons = answers.map(i =>
		new ButtonBuilder().setLabel(i).setStyle(ButtonStyle.Secondary).setCustomId(murmurhash(i).toString())
	);

	const confirmMessage = await channel.send({
		content: str,
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(shuffleArr(buttons))]
	});
	const guessed: string[] = [];

	return new Promise<string | null>(async resolve => {
		const collector = confirmMessage.createMessageComponentCollector<ComponentType.Button>({
			time: timer
		});

		collector.on('collect', async i => {
			const { id } = i.user;
			const mUser = await mahojiUsersSettingsFetch(id, { minion_ironman: true });
			const isCreator = id === creator;
			let notAllowed = !ironmenAllowed && mUser.minion_ironman;
			if (notAllowed && !isCreator) {
				i.reply({ ephemeral: true, content: "You aren't allowed to participate.." });
				return;
			}
			if (guessed.includes(id)) {
				const amountTimesGuessed = guessed.filter(g => g.toString() === i.user.id).length;
				if (
					!creatorGetsTwoGuesses ||
					i.user.id !== creator.toString() ||
					(amountTimesGuessed >= 2 && isCreator && creatorGetsTwoGuesses)
				) {
					i.reply({ ephemeral: true, content: 'You already guessed wrong.' });
					return;
				}
			}
			if (i.customId === correctCustomID) {
				resolve(id);
				collector.stop();
				i.reply({ ephemeral: true, content: 'You got it!' });
			} else {
				i.reply({ ephemeral: true, content: 'Wrong!' });
				guessed.push(id);
			}
		});

		collector.on('end', () => {
			confirmMessage.delete().catch(noOp);
			resolve(null);
		});
	});
}
