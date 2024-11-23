import type { Giveaway } from '@prisma/client';
import type { MessageEditOptions } from 'discord.js';
import { time, userMention } from 'discord.js';
import { Time, debounce, noOp, randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { Events } from '../constants';

import { channelIsSendable } from '../util';
import { logError } from './logError';
import { sendToChannelID } from './webhook';

async function refundGiveaway(creator: MUser, loot: Bank) {
	await transactItems({
		userID: creator.id,
		itemsToAdd: loot
	});
	const user = await globalClient.fetchUser(creator.id);
	debugLog('Refunding a giveaway.', { type: 'GIVEAWAY_REFUND', user_id: creator.id, loot: loot.toJSON() });
	user.send(`Your giveaway failed to finish, you were refunded the items: ${loot}.`).catch(noOp);
}

async function getGiveawayMessage(giveaway: Giveaway) {
	const channel = globalClient.channels.cache.get(giveaway.channel_id);
	if (channelIsSendable(channel)) {
		const message = await channel.messages.fetch(giveaway.message_id).catch(noOp);
		if (message) return message;
	}
}

export function generateGiveawayContent(host: string, finishDate: Date, usersEntered: string[]) {
	return `${userMention(host)} created a giveaway that will finish at ${time(finishDate, 'F')} (${time(
		finishDate,
		'R'
	)}).

There are ${usersEntered.length} users entered in this giveaway.`;
}

export const updateGiveawayMessage = debounce(async (_giveaway: Giveaway) => {
	const giveaway = await prisma.giveaway.findFirst({ where: { id: _giveaway.id } });
	if (!giveaway) return;
	const message = await getGiveawayMessage(giveaway);
	if (!message) return;
	const newContent = generateGiveawayContent(giveaway.user_id, giveaway.finish_date, giveaway.users_entered);
	const edits: MessageEditOptions = {};
	if (giveaway.completed) edits.components = [];
	if (message.content !== newContent) {
		edits.content = newContent;
	}
	if (Object.keys(edits).length > 0) {
		await message.edit(edits);
	}
}, Time.Second);

export async function handleGiveawayCompletion(_giveaway: Giveaway) {
	debugLog('Completing a giveaway.', { type: 'GIVEAWAY_COMPLETE', giveaway_id: _giveaway.id });
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

		const creator = await mUserFetch(giveaway.user_id);

		const users = (await Promise.all(giveaway.users_entered.map(i => mUserFetch(i)))).filter(
			u => !u.isIronman && u.id !== giveaway.user_id
		);
		await updateGiveawayMessage(giveaway);

		if (users.length === 0) {
			await refundGiveaway(creator, loot);
			return;
		}

		const winner = randArrItem(users);
		await transactItems({ userID: winner.id, itemsToAdd: loot });
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
			`${winner.mention}[${winner.id}] won ${loot} in a giveaway of ${users.length} made by ${creator.mention}[${creator.id}].`
		);

		const str = `<@${giveaway.user_id}> **Giveaway finished:** ${users.length} users joined, the winner is... **${winner.mention}**
			
They received these items: ${loot}`;

		await sendToChannelID(giveaway.channel_id, {
			content: str
		});
	} catch (err) {
		logError(err);
	}
}
