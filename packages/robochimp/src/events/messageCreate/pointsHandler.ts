import { type GatewayMessageCreateDispatchData, InteractionType } from '@oldschoolgg/discord';
import { cryptoRng } from 'node-rng/crypto';

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

export async function pointsHandler(msg: GatewayMessageCreateDispatchData) {
	if (!msg.guild_id) return;
	const authorId = msg.author.id;

	// Give testing points for messages
	if (msg.guild_id === '940758552425955348' && msg.content && msg.content.length > 30) {
		await roboChimpClient.user.upsert({
			where: {
				id: BigInt(authorId)
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
				id: BigInt(authorId),
				testing_points: 0.05,
				testing_points_balance: 0.05
			}
		});
	}

	// Give testing points for commands
	if (
		msg.guild_id === TEST_SERVER_ID &&
		msg.interaction_metadata &&
		msg.interaction_metadata.type === InteractionType.ApplicationCommand
	) {
		const botMember = await globalClient.fetchMember({ guildId: msg.guild_id, userId: authorId });
		if (botMember.roles.includes('940764684498382858')) {
			await roboChimpClient.user.updateMany({
				where: {
					id: BigInt(msg.interaction_metadata.user.id)
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
				const userMember = await globalClient.fetchMember({
					guildId: TEST_SERVER_ID,
					userId: msg.interaction_metadata.user.id
				});
				const u = await globalClient.fetchRUser(msg.interaction_metadata.user.id);
				for (const role of testerRoles) {
					if (!userMember.roles.includes(role.id) && u.testingPoints >= role.points) {
						await globalClient.giveRole(TEST_SERVER_ID, msg.interaction_metadata.user.id, role.id);
						await globalClient.sendMessage(
							msg.channel_id,
							`${userMember}, you have been awarded the ${role.name} role! Thank you for testing.`
						);
						break;
					}
				}
			}
		}
	}
}
