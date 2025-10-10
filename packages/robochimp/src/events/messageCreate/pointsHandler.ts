import { cryptoRng } from '@oldschoolgg/rng';
import { InteractionType, type Message } from 'discord.js';

import { TEST_SERVER_ID } from '@/constants.js';

const testerRoles = [
	{
		name: 'Grandmaster',
		id: '1203526113788436520',
		points: 1000
	},
	{
		name: 'Master',
		id: '1203526095220121630',
		points: 500
	},
	{
		name: 'Elite',
		id: '1203526074773012520',
		points: 100
	},
	{
		name: 'Hard',
		id: '1203526056884310016',
		points: 25
	},
	{
		name: 'Medium',
		id: '1203526031496192041',
		points: 5
	},
	{
		name: 'Easy',
		id: '1203525952781557832',
		points: 1
	}
];

export async function pointsHandler(msg: Message) {
	if (!msg.guild) return;

	// Give testing points for messages
	if (msg.guild.id === '940758552425955348' && !msg.author.bot && msg.content && msg.content.length > 30) {
		await roboChimpClient.user.upsert({
			where: {
				id: BigInt(msg.author.id)
			},
			update: {
				testing_points: {
					increment: 0.05
				},
				testing_points_balance: {
					increment: 0.05
				}
			},
			create: {
				id: BigInt(msg.author.id),
				testing_points: 0.05,
				testing_points_balance: 0.05
			}
		});
	}

	// Give testing points for commands
	if (
		msg.guild.id === TEST_SERVER_ID &&
		msg.interactionMetadata &&
		msg.interactionMetadata.type === InteractionType.ApplicationCommand
	) {
		const botMember = await msg.guild.members.fetch(msg.author.id);
		if (botMember.roles.cache.has('940764684498382858')) {
			await roboChimpClient.user.updateMany({
				where: {
					id: BigInt(msg.interactionMetadata.user.id)
				},
				data: {
					testing_points: {
						increment: 0.2
					},
					testing_points_balance: {
						increment: 0.2
					}
				}
			});
			if (cryptoRng.roll(5)) {
				const userMember = await msg.guild.members.fetch(msg.interactionMetadata.user.id);
				const u = await globalClient.fetchUser(msg.interactionMetadata.user.id);
				for (const role of testerRoles) {
					if (!userMember.roles.cache.has(role.id) && u.testingPoints >= role.points) {
						await userMember.roles.add(role.id);
						await globalClient.sendToChannelID(
							msg.channel.id,
							`${userMember}, you have been awarded the ${role.name} role! Thank you for testing.`
						);
						break;
					}
				}
			}
		}
	}
}
