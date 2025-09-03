import { type Message, type MessageContextMenuCommandInteraction, codeBlock, userMention } from 'discord.js';

import { TEST_SERVER_ID, globalConfig } from '../constants.js';
import { Bits, CONFUSED_MONKEY_GIF, fetchUser, sendToChannelID } from '../util.js';
import { getInfoStrOfUser } from './messageCommands.js';

interface MessageCtxCommand {
	name: string;
	guildID: string;
	run: (interaction: MessageContextMenuCommandInteraction, message: Message | undefined) => void;
}

interface Award {
	name: string;
	points: number;
}

const awards: Award[] = [
	{
		name: '2',
		points: 2
	},
	{
		name: '4',
		points: 4
	}
];

export const messageCtxCommands: MessageCtxCommand[] = [
	{
		name: 'Check User Info',
		guildID: globalConfig.supportServerID,
		run: async (interaction: MessageContextMenuCommandInteraction) => {
			const commandUser = await fetchUser(interaction.user.id);
			const userToCheck = interaction.targetMessage.author.id;

			if (!commandUser.bits.includes(Bits.Mod) && commandUser.id.toString() !== userToCheck) {
				return interaction.reply({
					content: CONFUSED_MONKEY_GIF,
					ephemeral: true
				});
			}

			const result = await getInfoStrOfUser(userToCheck);
			return interaction.reply({
				content: result,
				ephemeral: true
			});
		}
	},
	...awards.map(
		(award): MessageCtxCommand => ({
			name: `Award ${award.name} pts`,
			guildID: TEST_SERVER_ID,
			run: async (interaction, message) => {
				const contributor = await fetchUser(interaction.user.id);

				// Must be trusted
				if (!contributor.bits.includes(Bits.Trusted)) {
					return interaction.reply({
						content: CONFUSED_MONKEY_GIF,
						ephemeral: true
					});
				}

				const tester = await fetchUser(interaction.targetMessage.author.id);
				await roboChimpClient.user.update({
					where: {
						id: tester.id
					},
					data: {
						testing_points: {
							increment: award.points
						},
						testing_points_balance: {
							increment: award.points
						}
					}
				});

				sendToChannelID(
					'1195579189714243685',
					`${interaction.targetMessage.author} was awarded points by ${userMention(
						contributor.id.toString()
					)} for this message\n${codeBlock(message?.content ?? 'No message content')}`
				);

				return interaction.reply({
					content: 'Done.',
					ephemeral: true
				});
			}
		})
	)
];
