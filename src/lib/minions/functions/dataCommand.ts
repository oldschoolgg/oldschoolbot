import { activity_type_enum } from '@prisma/client';
import { MessageAttachment, MessageOptions } from 'discord.js';
import { KlasaMessage, KlasaUser } from 'klasa';

import { prisma } from '../../settings/prisma';
import { pieChart } from '../../util/chart';

interface DataPiece {
	name: string;
	run: (user: KlasaUser) => Promise<MessageOptions>;
}
// https://www.chartjs.org/docs/latest/general/colors.html
// https://www.chartjs.org/docs/latest/general/colors.html
// https://www.chartjs.org/docs/latest/general/colors.html
const dataPoints: DataPiece[] = [
	// {
	// 	name: 'Gambling PNL',
	//     run: async (user, prismUser: User) => {
	//         return `**Dicing:** ${prismUser.gp}`
	// 		return user.username;
	// 	}
	// }
	{
		name: 'Activity Types',
		run: async (user: KlasaUser) => {
			const result: { type: activity_type_enum; qty: number }[] =
				await prisma.$queryRaw`SELECT type, count(type) AS qty
FROM activity
WHERE completed = true
AND user_id = ${user.id}
OR (data->>'users')::jsonb @> ${user.id}::jsonb
GROUP BY type;`;
			const dataPoints: [string, number][] = result.filter(i => i.qty >= 5).map(i => [i.type, i.qty]);
			return {
				files: [new MessageAttachment(await pieChart(`${user.username}'s Activity Counts`, dataPoints))]
			};
		}
	}
];

export async function dataCommand(msg: KlasaMessage) {
	return dataPoints[0].run(msg.author);
}
