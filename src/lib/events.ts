import { Message, MessageActionRow, MessageButton } from 'discord.js';
import { noOp } from 'e';
import { KlasaUser } from 'klasa';

import { CLIENT_ID, MAXING_MESSAGE } from '../config';
import { minionStatusCommand } from '../mahoji/lib/abstracted_commands/minionStatusCommand';
import { Events, LEVEL_99_XP, SupportServer } from './constants';
import { prisma } from './settings/prisma';
import Skills from './skilling/skills';
import { channelIsSendable } from './util';
import { formatOrdinal } from './util/formatOrdinal';
import { sendToChannelID } from './util/webhook';

const skillsVals = Object.values(Skills);
const maxFilter = skillsVals.map(s => `"skills.${s.id}" >= ${LEVEL_99_XP}`).join(' AND ');
const makeQuery = (ironman: boolean) => `SELECT count(id)
FROM users
WHERE ${maxFilter}
${ironman ? 'AND "minion.ironman" = true' : ''};`;

async function howManyMaxed() {
	const [normies, irons] = (
		(await Promise.all([prisma.$queryRawUnsafe(makeQuery(false)), prisma.$queryRawUnsafe(makeQuery(true))])) as any
	)
		.map((i: any) => i[0].count)
		.map((i: any) => parseInt(i));

	return {
		normies,
		irons
	};
}

export async function onMax(user: KlasaUser) {
	const { normies, irons } = await howManyMaxed();

	const str = `🎉 ${user.username}'s minion just achieved level 99 in every skill, they are the **${formatOrdinal(
		normies
	)}** minion to be maxed${user.isIronman ? `, and the **${formatOrdinal(irons)}** ironman to max.` : '.'} 🎉`;

	user.client.emit(Events.ServerNotification, str);
	sendToChannelID(SupportServer, { content: str }).catch(noOp);
	user.send(MAXING_MESSAGE).catch(noOp);
}

export async function onMessage(msg: Message) {
	if (!msg.content || msg.author.bot || !channelIsSendable(msg.channel)) return;
	if (msg.content.trim() !== `<@${CLIENT_ID}>`) return;

	const result = await minionStatusCommand(msg.author.id);
	msg.reply({
		content: result.content,
		components: result.components?.map(i => {
			const row = new MessageActionRow();
			for (const a of i.components) {
				row.addComponents(
					new MessageButton()
						.setCustomID(a.custom_id)
						.setLabel(a.label!)
						.setEmoji(a.emoji!.id!)
						.setStyle('SECONDARY')
				);
			}
			return row;
		})
	});
}
