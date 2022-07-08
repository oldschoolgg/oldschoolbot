import { activity_type_enum, User } from '@prisma/client';
import { sumArr, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { collectables } from '../../../mahoji/lib/abstracted_commands/collectCommand';
import { getMahojiBank } from '../../../mahoji/mahojiSettings';
import { calcCLDetails } from '../../data/Collections';
import { TOBRooms } from '../../data/tob';
import { prisma } from '../../settings/prisma';
import { Castables } from '../../skilling/skills/magic/castables';
import { SkillsEnum } from '../../skilling/types';
import { getSlayerTaskStats } from '../../slayer/slayerUtil';
import { sorts } from '../../sorts';
import { ItemBank } from '../../types';
import { InfernoOptions } from '../../types/minions';
import { formatDuration } from '../../util';
import { barChart, lineChart, pieChart } from '../../util/chart';
import { getItem } from '../../util/getOSItem';
import { makeBankImage } from '../../util/makeBankImage';
import killableMonsters from '../data/killableMonsters';

interface DataPiece {
	name: string;
	run: (user: User) => CommandResponse;
}

function wrap(str: string) {
	return `'"${str}"'`;
}

export async function personalConstructionStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'objectID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Construction'
AND user_id = '${user.id}'::bigint
AND data->>'objectID' IS NOT NULL
GROUP BY data->>'objectID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalFiremakingStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'burnableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Firemaking'
AND user_id = '${user.id}'::bigint
AND data->>'burnableID' IS NOT NULL
GROUP BY data->>'burnableID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalWoodcuttingStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'logID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Woodcutting'
AND user_id = '${user.id}'::bigint
AND data->>'logID' IS NOT NULL
GROUP BY data->>'logID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalMiningStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'oreID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Mining'
AND user_id = '${user.id}'::bigint
AND data->>'oreID' IS NOT NULL
GROUP BY data->>'oreID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalHerbloreStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'mixableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Herblore'
AND user_id = '${user.id}'::bigint
AND data->>'mixableID' IS NOT NULL
GROUP BY data->>'mixableID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}
export async function personalAlchingStats(user: User, includeAgilityAlching = true) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'itemID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Alching'
AND user_id = '${user.id}'::bigint
AND data->>'itemID' IS NOT NULL
GROUP BY data->>'itemID';`);
	const agilityAlchRes: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (((data->>'alch')::json)->>'itemID')::int AS id, SUM((((data->>'alch')::json)->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Agility'
AND user_id = '${user.id}'::bigint
AND data->>'alch' IS NOT NULL
GROUP BY ((data->>'alch')::json)->>'itemID';`);

	const items = new Bank();
	for (const res of [...result, ...(includeAgilityAlching ? agilityAlchRes : [])]) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}
export async function personalSmithingStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'smithedBarID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Smithing'
AND user_id = '${user.id}'::bigint
AND data->>'smithedBarID' IS NOT NULL
GROUP BY data->>'smithedBarID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}
export async function personalSpellCastStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'spellID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Casting'
AND user_id = '${user.id}'::bigint
AND data->>'spellID' IS NOT NULL
GROUP BY data->>'spellID';`);
	return result.map(i => ({ castable: Castables.find(t => t.id === i.id)!, id: i.id, qty: i.qty }));
}
export async function personalCollectingStats(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'collectableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Collecting'
AND user_id = '${user.id}'::bigint
AND data->>'collectableID' IS NOT NULL
GROUP BY data->>'collectableID';`);
	let bank = new Bank();
	for (const { id, qty } of result) {
		const col = collectables.find(t => t.item.id === id);
		if (!col) continue;
		bank.add(col.item.id, col.quantity * qty);
	}
	return bank;
}

async function makeResponseForBank(bank: Bank, title: string, content?: string) {
	const image = await makeBankImage({
		title,
		bank
	});
	return {
		attachments: [image.file],
		content
	};
}
function makeResponseForBuffer(buffer: Buffer) {
	return {
		attachments: [
			{
				buffer,
				fileName: 'image.jpg'
			}
		]
	};
}

export const dataPoints: DataPiece[] = [
	{
		name: 'Personal Activity Types',
		run: async (user: User) => {
			const result: { type: activity_type_enum; qty: number }[] =
				await prisma.$queryRawUnsafe(`SELECT type, count(type) AS qty
FROM activity
WHERE completed = true	
AND user_id = ${BigInt(user.id)}
OR (data->>'users')::jsonb @> ${wrap(user.id)}::jsonb
GROUP BY type;`);
			const dataPoints: [string, number][] = result.filter(i => i.qty >= 5).map(i => [i.type, i.qty]);
			return makeResponseForBuffer(await barChart('Your Activity Types', val => `${val} Trips`, dataPoints));
		}
	},
	{
		name: 'Personal Activity Durations',
		run: async (user: User) => {
			const result: { type: activity_type_enum; hours: number }[] =
				await prisma.$queryRawUnsafe(`SELECT type, sum(duration) / ${Time.Hour} AS hours
FROM activity
WHERE completed = true
AND user_id = ${BigInt(user.id)}
OR (data->>'users')::jsonb @> ${wrap(user.id)}::jsonb
GROUP BY type;`);
			const dataPoints: [string, number][] = result.filter(i => i.hours >= 1).map(i => [i.type, i.hours]);
			const buffer = await barChart('Your Activity Durations', val => `${val} Hours`, dataPoints);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Monster KC',
		run: async (user: User) => {
			const result: { id: number; kc: number }[] =
				await prisma.$queryRawUnsafe(`SELECT (data->>'monsterID')::int as id, SUM((data->>'quantity')::int) AS kc
FROM activity
WHERE completed = true
AND user_id = ${BigInt(user.id)}
AND type = 'MonsterKilling'
AND data IS NOT NULL
AND data::text != '{}'
GROUP BY data->>'monsterID';`);
			const dataPoints: [string, number][] = result
				.sort((a, b) => b.kc - a.kc)
				.slice(0, 30)
				.map(i => [killableMonsters.find(mon => mon.id === i.id)?.name ?? i.id.toString(), i.kc]);
			const buffer = await barChart("Your Monster KC's", val => `${val} KC`, dataPoints);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Top Bank Value Items',
		run: async (user: User) => {
			const bank = getMahojiBank(user);
			const items = bank.items().sort(sorts.value);
			const dataPoints: [string, number][] = items
				.filter(i => i[1] >= 1)
				.slice(0, 15)
				.map(i => [i[0].name, i[0].price * i[1]]);
			const everythingElse = items.slice(20, items.length);
			let everythingElseBank = new Bank();
			for (const i of everythingElse) everythingElseBank.add(i[0].id, i[1]);
			dataPoints.push(['Everything else', everythingElseBank.value()]);
			const buffer = await barChart('Your Top Bank Value Items', val => `${toKMB(val)} GP`, dataPoints);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Collection Log Progress',
		run: async (user: User): CommandResponse => {
			const { percent } = calcCLDetails(user);
			const buffer: Buffer = await pieChart('Your Personal Collection Log Progress', val => `${toKMB(val)}%`, [
				['Complete Collection Log Items', percent, '#9fdfb2'],
				['Incomplete Collection Log Items', 100 - percent, '#df9f9f']
			]);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Global Inferno Death Times',
		run: async () => {
			const result: { mins: number; count: number }[] =
				await prisma.$queryRaw`SELECT mins, COUNT(mins) FROM (SELECT ((data->>'deathTime')::int / 1000 / 60) as mins
FROM activity
WHERE type = 'Inferno'
AND data->>'deathTime' IS NOT NULL) death_mins
GROUP BY mins;`;
			const buffer = await lineChart(
				'Global Inferno Death Times',
				val => `${val} Mins`,
				result.map(i => [i.mins.toString(), i.count])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Inferno Death Times',
		run: async (user: User) => {
			const result: { mins: number; count: number }[] =
				await prisma.$queryRawUnsafe(`SELECT mins, COUNT(mins) FROM (SELECT ((data->>'deathTime')::int / 1000 / 60) as mins
FROM activity
WHERE type = 'Inferno'
AND user_id = ${BigInt(user.id)}
AND data->>'deathTime' IS NOT NULL) death_mins
GROUP BY mins;`);
			const buffer = await lineChart(
				'Personal Inferno Death Times',
				val => `${val} Mins`,
				result.map(i => [i.mins.toString(), i.count])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Inferno',
		run: async (user: User) => {
			const activities = await prisma.activity.findMany({
				where: {
					user_id: BigInt(user.id),
					type: 'Inferno'
				},
				orderBy: {
					finish_date: 'asc'
				}
			});
			let completedAt = null;
			let postFirstCapeCompletions = 0;
			let totalCost = new Bank();
			for (let i = 0; i < activities.length; i++) {
				const data = activities[i].data as unknown as InfernoOptions;
				if (completedAt === null && !data.deathTime) {
					completedAt = i + 1;
				} else if (!data.deathTime && completedAt !== null) {
					postFirstCapeCompletions++;
				}
				totalCost.add(data.cost);
			}

			return makeResponseForBank(
				totalCost,
				'Your Personal Inferno',
				`**First Cape:** ${completedAt ? `After ${completedAt} attempts` : 'Never'}
**Extra Capes:** ${postFirstCapeCompletions}
**Total Time Spent in Inferno:** ${formatDuration(sumArr(activities.map(i => i.duration)))}`
			);
		}
	},
	{
		name: 'Personal TOB Wipes',
		run: async (user: User) => {
			const result: { wiped_room: number; count: number }[] =
				await prisma.$queryRawUnsafe(`SELECT (data->>'wipedRoom')::int AS wiped_room, COUNT(data->>'wipedRoom')::int
FROM activity
WHERE type = 'TheatreOfBlood'
AND completed = true
AND data->>'wipedRoom' IS NOT NULL
AND user_id = ${BigInt(user.id)}
OR (data->>'users')::jsonb @> ${wrap(user.id)}::jsonb
GROUP BY 1;`);
			if (result.length === 0) {
				return { content: "You haven't wiped in any Theatre of Blood raids yet." };
			}
			const buffer = await barChart(
				'Personal TOB Deaths',
				val => `${val} Deaths`,
				result.map(i => [TOBRooms[i.wiped_room].name, i.count])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Global TOB Wipes',
		run: async () => {
			const result: { wiped_room: number; count: number }[] =
				await prisma.$queryRaw`SELECT (data->>'wipedRoom')::int AS wiped_room, COUNT(data->>'wipedRoom')::int
FROM activity
WHERE type = 'TheatreOfBlood'
AND completed = true
AND data->>'wipedRoom' IS NOT NULL
GROUP BY 1;`;
			const buffer = await barChart(
				'Global TOB Deaths',
				val => `${val} Deaths`,
				result.map(i => [TOBRooms[i.wiped_room].name, i.count])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Global 200ms',
		run: async () => {
			const result = (
				await Promise.all(
					Object.values(SkillsEnum).map(
						skillName =>
							prisma.$queryRawUnsafe(`SELECT '${skillName}' as skill_name, COUNT(id) AS qty
FROM users
WHERE "skills.${skillName}" = 200000000;`) as Promise<{ qty: number; skill_name: string }[]>
					)
				)
			)
				.map(i => i[0])
				.sort((a, b) => b.qty - a.qty);
			const buffer = await barChart(
				'Global 200ms',
				val => `${val} 200ms`,
				result.map(i => [i.skill_name, i.qty])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Farmed Crops',
		run: async (user: User) => {
			const result: { plant: string; qty: number }[] =
				await prisma.$queryRawUnsafe(`SELECT data->>'plantsName' as plant, COUNT(data->>'plantsName') AS qty
FROM activity
WHERE type = 'Farming'
AND data->>'plantsName' IS NOT NULL
AND user_id = ${BigInt(user.id)}
GROUP BY data->>'plantsName'`);
			result.sort((a, b) => b.qty - a.qty);
			const buffer = await barChart(
				'Global Farmed Crops',
				val => `${val} Crops`,
				result.map(i => [i.plant, i.qty])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Global Farmed Crops',
		run: async () => {
			const result: { plant: string; qty: number }[] =
				await prisma.$queryRaw`SELECT data->>'plantsName' as plant, COUNT(data->>'plantsName') AS qty
FROM activity
WHERE type = 'Farming'
AND data->>'plantsName' IS NOT NULL
GROUP BY data->>'plantsName'`;
			result.sort((a, b) => b.qty - a.qty);
			const buffer = await barChart(
				'Global Farmed Crops',
				val => `${val} Crops`,
				result.map(i => [i.plant, i.qty])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal TOB Cost',
		run: async (user: User) => {
			return makeResponseForBank(new Bank(user.tob_cost as ItemBank), 'Your TOB Cost');
		}
	},
	{
		name: 'Personal TOB Loot',
		run: async (user: User) => {
			return makeResponseForBank(new Bank(user.tob_loot as ItemBank), 'Your TOB Loot');
		}
	},
	{
		name: 'Gambling PNL',
		run: async (user: User) => {
			const gpDice = toKMB(Number(user.gp_dice));
			const gpLuckyPick = toKMB(Number(user.gp_luckypick));
			const gpSlots = toKMB(Number(user.gp_slots));

			return {
				content: `**Dicing:** ${gpDice}
**Lucky Pick:** ${gpLuckyPick}
**Slots:** ${gpSlots}`
			};
		}
	},
	{
		name: 'Personal Slayer Tasks',
		run: async (user: User) => {
			const res = await getSlayerTaskStats(user.id);
			return `**Your Top Slayer Tasks**
${res
	.sort((a, b) => b.total_killed - a.total_killed)
	.slice(0, 15)
	.map(i => `**${i.monsterName}**: ${i.total_killed.toLocaleString()} Killed in ${i.total_tasks} tasks`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Construction Stats',
		run: async (user: User) => {
			const result = await personalConstructionStats(user);
			if (result.length === 0) return "You haven't built anything yet.";
			return `You've built...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Alching Stats',
		run: async (user: User) => {
			const result = await personalAlchingStats(user);
			if (result.length === 0) return "You haven't alched anything yet.";
			return `You've alched...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Herblore Stats',
		run: async (user: User) => {
			const result = await personalHerbloreStats(user);
			if (result.length === 0) return "You haven't made anything yet.";
			return `You've made...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Mining Stats',
		run: async (user: User) => {
			const result = await personalMiningStats(user);
			if (result.length === 0) return "You haven't mined anything yet.";
			return `You've mined...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Firemaking Stats',
		run: async (user: User) => {
			const result = await personalFiremakingStats(user);
			if (result.length === 0) return "You haven't burnt anything yet.";
			return `You've burnt...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Smithing Stats',
		run: async (user: User) => {
			const result = await personalSmithingStats(user);
			if (result.length === 0) return "You haven't smithed anything yet.";
			return `You've smithed...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Spell Casting Stats',
		run: async (user: User) => {
			const result = await personalSpellCastStats(user);
			if (result.length === 0) return "You haven't cast anything yet.";
			return `You've cast...
${result
	.sort((a, b) => b.qty - a.qty)
	.slice(0, 15)
	.map(i => `${i.castable.name}: ${i.qty.toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Collecting Stats',
		run: async (user: User) => {
			const result = await personalCollectingStats(user);
			if (result.length === 0) return "You haven't collected anything yet.";
			return `You've collected...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Personal Woodcutting Stats',
		run: async (user: User) => {
			const result = await personalWoodcuttingStats(user);
			if (result.length === 0) return "You haven't chopped anything yet.";
			return `You've chopped...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	}
];
