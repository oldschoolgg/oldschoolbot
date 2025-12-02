import { time, userMention } from '@oldschoolgg/discord';
import { debounce, Events, Time } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import type { Giveaway } from '@/prisma/main.js';

async function refundGiveaway(creator: MUser, loot: Bank) {
	await creator.transactItems({
		itemsToAdd: loot
	});
	Logging.logDebug('Refunding a giveaway.', { type: 'GIVEAWAY_REFUND', user_id: creator.id, loot: loot.toJSON() });
	await globalClient.sendDm(creator.id, `Your giveaway failed to finish, you were refunded the items: ${loot}.`);
}

export function generateGiveawayContent(host: string, finishDate: Date, usersEntered: string[]) {
	return `${userMention(host)} created a giveaway that will finish at ${time(finishDate, 'F')} (${time(
		finishDate,
		'R'
	)}).

There are ${usersEntered.length} users entered in this giveaway.`;
}

async function pickRandomGiveawayWinner(giveaway: Giveaway): Promise<MUser | null> {
	if (giveaway.users_entered.length === 0) return null;
	const result: { id: string }[] = await prisma.$queryRaw`WITH giveaway_users AS (
  SELECT unnest(users_entered) AS user_id
  FROM giveaway
  WHERE id = ${giveaway.id}
)
SELECT id
FROM users
WHERE id IN (SELECT user_id FROM giveaway_users)
AND "minion.ironman" = false
AND id != ${giveaway.user_id}
ORDER BY random()
LIMIT 1;
`;
	const id = result[0]?.id;
	if (!id) return null;
	const user = await mUserFetch(id);
	return user;
}

export const updateGiveawayMessage = debounce(async (_giveaway: Giveaway) => {
	const giveaway = await prisma.giveaway.findFirst({ where: { id: _giveaway.id } });
	if (!giveaway) return;
	const message = await globalClient.fetchMessage(giveaway.channel_id, giveaway.message_id);
	if (!message) return;
	const newContent = generateGiveawayContent(giveaway.user_id, giveaway.finish_date, giveaway.users_entered);
	const edits: BaseSendableMessage = {};
	if (giveaway.completed) edits.components = [];
	if (message.content !== newContent) {
		edits.content = newContent;
	}
	if (Object.keys(edits).length > 0) {
		await globalClient.editMessage(giveaway.channel_id, giveaway.message_id, edits);
	}
}, Time.Second);

export async function handleGiveawayCompletion(_giveaway: Giveaway) {
	Logging.logDebug('Completing a giveaway.', { type: 'GIVEAWAY_COMPLETE', giveaway_id: _giveaway.id });
	if (_giveaway.completed) {
		throw new Error('Tried to complete an already completed giveaway.');
	}

	const loot = new Bank(_giveaway.loot as ItemBank);

	try {
		const giveaway = await prisma.giveaway.update({
			where: {
				id: _giveaway.id
			},
			data: {
				completed: true
			}
		});

		await updateGiveawayMessage(giveaway);

		const creator = await mUserFetch(giveaway.user_id);

		const winner = await pickRandomGiveawayWinner(giveaway);

		if (winner === null) {
			await refundGiveaway(creator, loot);
			return;
		}

		await winner.transactItems({ itemsToAdd: loot });
		await prisma.economyTransaction.create({
			data: {
				guild_id: undefined,
				sender: BigInt(creator.id),
				recipient: BigInt(winner.id),
				items_sent: loot.toJSON(),
				items_received: undefined,
				type: 'giveaway'
			}
		});

		globalClient.emit(
			Events.EconomyLog,
			`${winner.mention}[${winner.id}] won ${loot} in a giveaway of ${giveaway.users_entered.length} made by ${creator.mention}[${creator.id}].`
		);

		const str = `<@${giveaway.user_id}> **Giveaway finished:** ${giveaway.users_entered.length} users joined, the winner is... **${winner.mention}**

They received these items: ${loot}`;

		await globalClient.sendMessage(giveaway.channel_id, {
			content: str,
			allowedMentions: { users: [giveaway.user_id, winner.id] }
		});
	} catch (err) {
		Logging.logError(err as Error);
	}
}
