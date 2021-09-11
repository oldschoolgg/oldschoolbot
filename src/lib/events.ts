import { noOp } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { getConnection } from 'typeorm';

import { Channel, Events, LEVEL_120_XP } from './constants';
import Skills from './skilling/skills';
import { formatOrdinal } from './util/formatOrdinal';
import { sendToChannelID } from './util/webhook';

const skillsVals = Object.values(Skills);
const maxFilter = skillsVals.map(s => `"skills.${s.id}" >= ${LEVEL_120_XP}`).join(' AND ');
const makeQuery = (ironman: boolean) => `SELECT count(id)
FROM users
WHERE ${maxFilter}
${ironman ? 'AND "minion.ironman" = true' : ''};`;

async function howManyMaxed() {
	const connection = await getConnection();
	const [normies, irons] = (
		await Promise.all([connection.query(makeQuery(false)), connection.query(makeQuery(true))])
	)
		.map(i => i[0].count)
		.map(i => parseInt(i));

	return {
		normies,
		irons
	};
}

export async function onMax(user: KlasaUser) {
	const { normies, irons } = await howManyMaxed();

	const str = `🎉 ${user.username}'s minion just achieved level 120 in every skill, they are the **${formatOrdinal(
		normies
	)}** minion to be maxed${user.isIronman ? `, and the **${formatOrdinal(irons)}** ironman to max.` : '.'} 🎉`;

	user.client.emit(Events.ServerNotification, str);
	sendToChannelID(user.client as KlasaClient, Channel.BSOGeneral, { content: str }).catch(noOp);
	user.send('Congratulations on maxing!').catch(noOp);
}
