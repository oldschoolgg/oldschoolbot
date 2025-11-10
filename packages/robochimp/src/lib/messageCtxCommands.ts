
import { TEST_SERVER_ID } from '@/constants.js';
import type { IMessage } from '@oldschoolgg/schemas';

interface MessageCtxCommand {
	name: string;
	guildID: string;
	run: (options: {
		interaction: MInteraction;
		message: IMessage | undefined;
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
	// {
	// 	name: 'Check User Info',
	// 	guildID: globalConfig.supportServerID,
	// 	run: async ({ interaction, user }) => {
	// 		const userToCheck = interaction.targetMessage.author.id;

	// 		if (!user.isMod() && user.id.toString() !== userToCheck) {
	// 			return interaction.reply({
	// 				content: "You can't do that.",
	// 				ephemeral: true,
	// 			});
	// 		}

	// 		const result = await getInfoStrOfUser(userToCheck);
	// 		return interaction.reply({
	// 			content: result,
	// 			ephemeral: true
	// 		});
	// 	}
	// },
	...awards.map(
		(award): MessageCtxCommand => ({
			name: `Award ${award.name} pts`,
			guildID: TEST_SERVER_ID,
			run: async ({ interaction }) => {
				// Must be trusted
				// if (!user.bits.includes(Bits.Trusted)) {
				// 	return interaction.reply({
				// 		content: "You can't do that.",
				// 		ephemeral: true
				// 	});
				// }

				// const tester = await globalClient.fetchRUser(interaction.targetMessage.author.id);
				// await tester.update({
				// 	testing_points: {
				// 		increment: award.points
				// 	},
				// 	testing_points_balance: {
				// 		increment: award.points
				// 	}
				// });

				// globalClient.sendDm(
				// 	CHANNELS.TESTING_AWARDS,
				// 	`${interaction.targetMessage.author} was awarded points by ${user.mention} for this message\n${codeBlock(message?.content ?? 'No message content')}`
				// );

				// return interaction.reply({
				// 	content: 'Done.',
				// 	ephemeral: true
				// });
				return interaction.reply({
					content: 'Temporarily disabled.',
					ephemeral: true
				});
			}
		})
	)
];
