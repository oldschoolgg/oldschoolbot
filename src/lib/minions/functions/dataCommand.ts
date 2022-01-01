import { activity_type_enum } from '@prisma/client';
import { MessageAttachment, MessageOptions } from 'discord.js';
import { Time } from 'e';
import { KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { prisma } from '../../settings/prisma';
import { sorts } from '../../sorts';
import { stringMatches, toTitleCase } from '../../util';
import { pieChart } from '../../util/chart';
import killableMonsters from '../data/killableMonsters';

interface DataPiece {
	name: string;
	run: (user: KlasaUser) => Promise<MessageOptions>;
}
// https://www.chartjs.org/docs/latest/general/colors.html
// https://www.chartjs.org/docs/latest/general/colors.html
// https://www.chartjs.org/docs/latest/general/colors.html
const dataPoints: DataPiece[] = [
	// {
	// BSO
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
				files: [
					new MessageAttachment(
						await pieChart(`${user.username}'s Activity Counts`, val => `${val} Trips`, dataPoints)
					)
				]
			};
		}
	},
	{
		name: 'Activity Durations',
		run: async (user: KlasaUser) => {
			const result: { type: activity_type_enum; hours: number }[] =
				await prisma.$queryRaw`SELECT type, sum(duration) / ${Time.Hour} AS hours
FROM activity
WHERE completed = true
AND user_id = ${user.id}
OR (data->>'users')::jsonb @> ${user.id}::jsonb
GROUP BY type;`;
			const dataPoints: [string, number][] = result.filter(i => i.hours >= 1).map(i => [i.type, i.hours]);
			return {
				files: [
					new MessageAttachment(
						await pieChart(`${user.username}'s Activity Durations`, val => `${val} Hours`, dataPoints)
					)
				]
			};
		}
	},
	{
		name: 'Monster KC',
		run: async (user: KlasaUser) => {
			const result: { id: number; kc: number }[] =
				await prisma.$queryRaw`SELECT (data->>'monsterID')::int as id, SUM((data->>'quantity')::int) AS kc
FROM activity
WHERE completed = true
AND user_id = ${user.id}
AND type = 'MonsterKilling'
AND data IS NOT NULL
AND data::text != '{}'
GROUP BY data->>'monsterID';`;
			const dataPoints: [string, number][] = result
				.filter(i => i.kc >= 1)
				.map(i => [killableMonsters.find(mon => mon.id === i.id)?.name ?? i.id.toString(), i.kc]);
			return {
				files: [
					new MessageAttachment(
						await pieChart(`${user.username}'s Monster KC's`, val => `${val} KC`, dataPoints)
					)
				]
			};
		}
	},
	{
		name: 'Top Bank Value Items',
		run: async (user: KlasaUser) => {
			const items = user.bank().items().sort(sorts.value);
			const dataPoints: [string, number][] = items
				.filter(i => i[1] >= 1)
				.slice(0, 15)
				.map(i => [i[0].name, i[0].price * i[1]]);
			const everythingElse = items.slice(20, items.length);
			let everythingElseBank = new Bank();
			for (const i of everythingElse) everythingElseBank.add(i[0].id, i[1]);
			dataPoints.push(['Everything else', everythingElseBank.value()]);
			return {
				files: [
					new MessageAttachment(
						await pieChart(`${user.username}'s Top Bank Value Items`, val => `${toKMB(val)} GP`, dataPoints)
					)
				]
			};
		}
	},
	{
		name: 'Collection Log Progress',
		run: async (user: KlasaUser) => {
			const { percent } = user.completion();
			return {
				files: [
					new MessageAttachment(
						await pieChart(`${user.username}'s Top Bank Value Items`, val => `${toKMB(val)}%`, [
							['Complete Collection Log Items', percent, '#9fdfb2'],
							['Incomplete Collection Log Items', 100 - percent, '#df9f9f']
						])
					)
				]
			};
		}
	},
	{
		name: 'XP Gains',
		run: async (user: KlasaUser) => {
			const result: { skill: string; xp: number }[] = await prisma.$queryRaw`SELECT skill, SUM(xp) AS xp
FROM xp_gains
WHERE user_id = ${user.id}
GROUP BY skill;`;
			const dataPoints: [string, number][] = result
				.sort((a, b) => b.xp - a.xp)
				.map(i => [toTitleCase(i.skill), i.xp]);
			return {
				files: [
					new MessageAttachment(await pieChart(`${user.username}'s XP Gains`, val => `${val} XP`, dataPoints))
				]
			};
		}
	}
];

export async function dataCommand(msg: KlasaMessage, input: string) {
	const dataPoint = dataPoints.find(dp => stringMatches(dp.name, input));
	if (!dataPoint) {
		return {
			content: `The data points you can see are: ${dataPoints.map(i => i.name).join(', ')}.`
		};
	}
	return dataPoint.run(msg.author);
}
