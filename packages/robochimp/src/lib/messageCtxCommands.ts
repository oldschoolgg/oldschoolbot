import { codeBlock, type Message, type MessageContextMenuCommandInteraction, MessageFlags } from 'discord.js';

import { globalConfig, TEST_SERVER_ID } from '@/constants.js';
import { getInfoStrOfUser } from '@/lib/messageCommands.js';
import { Bits, CHANNELS } from '@/util.js';

interface MessageCtxCommand {
	name: string;
	guildID: string;
	run: (options: {
		interaction: MessageContextMenuCommandInteraction;
		message: Message | undefined;
		user: RUser;
	}) => void;
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
		run: async ({ interaction, user }) => {
			const userToCheck = interaction.targetMessage.author.id;

			if (!user.isMod() && user.id.toString() !== userToCheck) {
				return interaction.reply({
					content: "You can't do that.",
					flags: MessageFlags.Ephemeral
				});
			}

			const result = await getInfoStrOfUser(userToCheck);
			return interaction.reply({
				content: result,
				flags: MessageFlags.Ephemeral
			});
		}
	},
	...awards.map(
		(award): MessageCtxCommand => ({
			name: `Award ${award.name} pts`,
			guildID: TEST_SERVER_ID,
			run: async ({ interaction, message, user }) => {
				// Must be trusted
				if (!user.bits.includes(Bits.Trusted)) {
					return interaction.reply({
						content: "You can't do that.",
						flags: MessageFlags.Ephemeral
					});
				}

				const tester = await globalClient.fetchUser(interaction.targetMessage.author.id);
				await tester.update({
					testing_points: {
						increment: award.points
					},
					testing_points_balance: {
						increment: award.points
					}
				});

				globalClient.sendToChannelID(
					CHANNELS.TESTING_AWARDS,
					`${interaction.targetMessage.author} was awarded points by ${user.mention} for this message\n${codeBlock(message?.content ?? 'No message content')}`
				);

				return interaction.reply({
					content: 'Done.',
					flags: MessageFlags.Ephemeral
				});
			}
		})
	)
];
