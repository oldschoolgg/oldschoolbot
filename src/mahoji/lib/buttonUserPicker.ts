import { MessageButton, MessageOptions } from 'discord.js';
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
	channelID: bigint | string;
	str: string;
	timer?: number;
	ironmenAllowed: boolean;
	initialUsers?: bigint[];
	answers: string[];
	creator: bigint;
	creatorGetsTwoGuesses?: boolean;
}) {
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');

	const correctCustomID = murmurhash(answers[0]).toString();

	const buttons: MessageOptions['components'] = answers.map(
		i =>
			new MessageButton({
				label: i,
				style: 'SECONDARY',
				customID: murmurhash(i).toString()
			})
	);

	const confirmMessage = await channel.send({
		content: str,
		components: [shuffleArr(buttons)]
	});
	const guessed: bigint[] = [];

	return new Promise<bigint | null>(async resolve => {
		const collector = confirmMessage.createMessageComponentInteractionCollector({
			time: timer
		});

		collector.on('collect', async i => {
			const id = BigInt(i.user.id);
			const mUser = await mahojiUsersSettingsFetch(id);
			const isCreator = id === creator;
			let notAllowed = !ironmenAllowed && mUser.minion_ironman;
			if (notAllowed && !isCreator) {
				i.reply({ ephemeral: true, content: "You aren't allowed to participate.." });
				return false;
			}
			if (guessed.includes(id)) {
				const amountTimesGuessed = guessed.filter(g => g.toString() === i.user.id).length;
				if (
					!creatorGetsTwoGuesses ||
					i.user.id !== creator.toString() ||
					(amountTimesGuessed >= 2 && isCreator && creatorGetsTwoGuesses)
				) {
					return i.reply({ ephemeral: true, content: 'You already guessed wrong.' });
				}
			}
			if (i.customID === correctCustomID) {
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
