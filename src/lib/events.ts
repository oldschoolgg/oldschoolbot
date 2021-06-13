import { KlasaUser } from 'klasa';
import { getConnection } from 'typeorm';

import { Events, LEVEL_99_XP } from './constants';
import Skills from './skilling/skills';
import { formatOrdinal } from './util/formatOrdinal';

const skillsVals = Object.values(Skills);
const maxFilter = skillsVals.map(s => `"skills.${s.id}" >= ${LEVEL_99_XP}`).join(' AND ');
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

	const str = `🎉 ${
		user.username
	}'s minion just achieved level 99 in every skill, they are the **${formatOrdinal(
		normies
	)}** minion to be maxed${
		user.isIronman ? `, and the **${formatOrdinal(irons)}** ironman to max.` : '.'
	} 🎉`;

	user.client.emit(Events.ServerNotification, str);

	user.send(`Congratulations on maxing!`);
}
