import { activity_type_enum, UserStats } from '@prisma/client';
import { sumArr, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, Monsters } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { TOBRooms } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';
import { toKMB } from 'oldschooljs/dist/util';

import { ClueTiers } from '../../../lib/clues/clueTiers';
import { getClueScoresFromOpenables } from '../../../lib/clues/clueUtils';
import { Emoji, PerkTier } from '../../../lib/constants';
import { calcCLDetails, isCLItem } from '../../../lib/data/Collections';
import { getBankBgById } from '../../../lib/minions/data/bankBackgrounds';
import killableMonsters from '../../../lib/minions/data/killableMonsters';
import { RandomEvents } from '../../../lib/randomEvents';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { prisma } from '../../../lib/settings/prisma';
import Agility from '../../../lib/skilling/skills/agility';
import { Castables } from '../../../lib/skilling/skills/magic/castables';
import { getSlayerTaskStats } from '../../../lib/slayer/slayerUtil';
import { sorts } from '../../../lib/sorts';
import { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration, getUsername, sanitizeBank, SQL_sumOfAllCLItems, stringMatches } from '../../../lib/util';
import { barChart, lineChart, pieChart } from '../../../lib/util/chart';
import { getItem } from '../../../lib/util/getOSItem';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import resolveItems from '../../../lib/util/resolveItems';
import { Cooldowns } from '../Cooldowns';
import { collectables } from './collectCommand';

interface DataPiece {
	name: string;
	perkTierNeeded: PerkTier | null;
	run: (user: MUser, stats: UserStats) => CommandResponse;
}

function wrap(str: string) {
	return `'"${str}"'`;
}

async function fetchHistoricalDataDifferences(user: MUser) {
	const result = await prisma.$queryRawUnsafe<
		{
			user_id: string;
			week_start: string;
			diff_cl_global_rank: number;
			diff_cl_completion_percentage: number;
			diff_cl_completion_count: number;
			diff_GP: number;
			diff_total_xp: number;
		}[]
	>(`WITH DateSeries AS (
    SELECT generate_series(
        (SELECT DATE_TRUNC('week', MIN(date)) FROM historical_data WHERE user_id = '${user.id}'),
        (SELECT DATE_TRUNC('week', MAX(date)) FROM historical_data WHERE user_id = '${user.id}'),
        '1 week'::interval
    )::DATE AS week_start
),
WeeklyLastValue AS (
    SELECT
        ds.week_start,
        hd.user_id,
        FIRST_VALUE(cl_global_rank) OVER (PARTITION BY hd.user_id, ds.week_start ORDER BY hd.date DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_cl_global_rank,
        FIRST_VALUE(cl_completion_percentage) OVER (PARTITION BY hd.user_id, ds.week_start ORDER BY hd.date DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_cl_completion_percentage,
        FIRST_VALUE(cl_completion_count) OVER (PARTITION BY hd.user_id, ds.week_start ORDER BY hd.date DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_cl_completion_count,
        FIRST_VALUE("GP") OVER (PARTITION BY hd.user_id, ds.week_start ORDER BY hd.date DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS "last_GP",
        FIRST_VALUE(total_xp) OVER (PARTITION BY hd.user_id, ds.week_start ORDER BY hd.date DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_total_xp
    FROM
        DateSeries ds
    LEFT JOIN historical_data hd ON hd.date BETWEEN ds.week_start AND ds.week_start + '6 days'::interval AND hd.user_id = '${user.id}'
),
DistinctWeeklyLastValue AS (
    SELECT DISTINCT
        user_id,
        week_start,
        last_cl_global_rank,
        last_cl_completion_percentage,
        last_cl_completion_count,
        "last_GP",
        last_total_xp
    FROM
        WeeklyLastValue
),
Differences AS (
    SELECT
        user_id,
        week_start,
        last_cl_global_rank - COALESCE(LAG(last_cl_global_rank) OVER (PARTITION BY user_id ORDER BY week_start), 0) AS diff_cl_global_rank,
        last_cl_completion_percentage - COALESCE(LAG(last_cl_completion_percentage) OVER (PARTITION BY user_id ORDER BY week_start), 0) AS diff_cl_completion_percentage,
        last_cl_completion_count - COALESCE(LAG(last_cl_completion_count) OVER (PARTITION BY user_id ORDER BY week_start), 0) AS diff_cl_completion_count,
        "last_GP" - COALESCE(LAG("last_GP") OVER (PARTITION BY user_id ORDER BY week_start), 0) AS "diff_GP",
        last_total_xp - COALESCE(LAG(last_total_xp) OVER (PARTITION BY user_id ORDER BY week_start), 0) AS diff_total_xp
    FROM
        DistinctWeeklyLastValue
	WHERE
        week_start > (SELECT MIN(week_start) FROM DistinctWeeklyLastValue WHERE user_id = '${user.id}')
)

SELECT
    user_id,
    week_start,
    diff_cl_global_rank,
    diff_cl_completion_percentage,
    diff_cl_completion_count,
    "diff_GP",
    diff_total_xp
FROM
    Differences
WHERE
    week_start > (SELECT DATE_TRUNC('week', MIN(date)) FROM historical_data WHERE user_id = '${user.id}');
`);
	const x = result.filter(i => i.user_id !== null);
	x.shift();
	return x;
}

export async function personalConstructionStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'objectID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Construction'
AND user_id = '${user.id}'::bigint
AND data->>'objectID' IS NOT NULL
AND completed = true
GROUP BY data->>'objectID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalFiremakingStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'burnableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Firemaking'
AND user_id = '${user.id}'::bigint
AND data->>'burnableID' IS NOT NULL
AND completed = true
GROUP BY data->>'burnableID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalWoodcuttingStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'logID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Woodcutting'
AND user_id = '${user.id}'::bigint
AND data->>'logID' IS NOT NULL
AND completed = true
GROUP BY data->>'logID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalMiningStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'oreID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Mining'
AND user_id = '${user.id}'::bigint
AND data->>'oreID' IS NOT NULL
AND completed = true
GROUP BY data->>'oreID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

export async function personalHerbloreStats(user: MUser, stats: UserStats) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'mixableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Herblore'
AND user_id = '${user.id}'::bigint
AND data->>'mixableID' IS NOT NULL
AND completed = true
GROUP BY data->>'mixableID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	items.add(new Bank(stats.herbs_cleaned_while_farming_bank as ItemBank));
	return items;
}
export async function personalAlchingStats(user: MUser, includeAgilityAlching = true) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'itemID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Alching'
AND user_id = '${user.id}'::bigint
AND data->>'itemID' IS NOT NULL
AND completed = true
GROUP BY data->>'itemID';`);
	const agilityAlchRes: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (((data->>'alch')::json)->>'itemID')::int AS id, SUM((((data->>'alch')::json)->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Agility'
AND user_id = '${user.id}'::bigint
AND data->>'alch' IS NOT NULL
AND completed = true
GROUP BY ((data->>'alch')::json)->>'itemID';`);

	const items = new Bank();
	for (const res of [...result, ...(includeAgilityAlching ? agilityAlchRes : [])]) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}
export async function personalSmithingStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'smithedBarID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Smithing'
AND user_id = '${user.id}'::bigint
AND data->>'smithedBarID' IS NOT NULL
AND completed = true
GROUP BY data->>'smithedBarID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}
export async function personalSmeltingStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'barID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Smelting'
AND user_id = '${user.id}'::bigint
AND data->>'barID' IS NOT NULL
AND completed = true
GROUP BY data->>'barID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}
export async function personalSpellCastStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'spellID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Casting'
AND user_id = '${user.id}'::bigint
AND data->>'spellID' IS NOT NULL
AND completed = true
GROUP BY data->>'spellID';`);
	return result.map(i => ({ castable: Castables.find(t => t.id === i.id)!, id: i.id, qty: i.qty }));
}
export async function personalCollectingStats(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'collectableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Collecting'
AND user_id = '${user.id}'::bigint
AND data->>'collectableID' IS NOT NULL
AND completed = true
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
	sanitizeBank(bank);
	const image = await makeBankImage({
		title,
		bank
	});
	return {
		files: [image.file],
		content
	};
}
function makeResponseForBuffer(attachment: Buffer): Awaited<CommandResponse> {
	return {
		files: [
			{
				attachment,
				name: 'image.jpg'
			}
		]
	};
}

export const dataPoints: readonly DataPiece[] = [
	{
		name: 'Personal Activity Types',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		name: 'Personal Activity Durations (Hours)',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
			const result: { type: activity_type_enum; hours: number }[] =
				await prisma.$queryRawUnsafe(`SELECT type, sum(duration) / ${Time.Hour} AS hours
FROM activity
WHERE completed = true
AND user_id = ${BigInt(user.id)}
OR (data->>'users')::jsonb @> ${wrap(user.id)}::jsonb
GROUP BY type;`);
			const dataPoints: [string, number][] = result
				.filter(i => i.hours >= 1)
				.sort((a, b) => b.hours - a.hours)
				.map(i => [i.type, i.hours]);
			const buffer = await barChart('Your Activity Durations', val => `${val} Hrs`, dataPoints);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Monster KC',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
			const items = user.bank.items().sort(sorts.value);
			const dataPoints: [string, number][] = items
				.filter(i => i[1] >= 1)
				.slice(0, 15)
				.map(i => [i[0].name, i[0].price * i[1]]);
			const everythingElse = items.slice(20, items.length);
			let everythingElseBank = new Bank();
			for (const i of everythingElse) everythingElseBank.add(i[0].name, i[1]);
			dataPoints.push(['Everything else', everythingElseBank.value()]);
			const buffer = await barChart(
				'Your Top Bank Value Items',
				val => {
					if (typeof val === 'string') return val;
					return `${toKMB(val)} GP`;
				},
				dataPoints
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Collection Log Progress',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser): CommandResponse => {
			const { percent } = calcCLDetails(user);
			const attachment: Buffer = await pieChart(
				'Your Personal Collection Log Progress',
				val => `${toKMB(val)}%`,
				[
					['Complete Collection Log Items', percent, '#9fdfb2'],
					['Incomplete Collection Log Items', 100 - percent, '#df9f9f']
				]
			);
			return makeResponseForBuffer(attachment);
		}
	},
	{
		name: 'Global Inferno Death Times',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result: { mins: number; count: number }[] =
				await prisma.$queryRaw`SELECT mins, COUNT(mins) FROM (SELECT ((data->>'deathTime')::int / 1000 / 60) as mins
FROM activity
WHERE type = 'Inferno'
AND completed = true
AND data->>'deathTime' IS NOT NULL) death_mins
GROUP BY mins;`;
			if (result.length === 0) return 'No results.';
			const buffer = await lineChart(
				'Global Inferno Death Times',
				result.map(i => [i.mins.toString(), i.count]),
				val => `${val} Mins`
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Inferno Death Times',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
			const result: { mins: number; count: number }[] =
				await prisma.$queryRawUnsafe(`SELECT mins, COUNT(mins) FROM (SELECT ((data->>'deathTime')::int / 1000 / 60) as mins
FROM activity
WHERE type = 'Inferno'
AND user_id = ${BigInt(user.id)}
AND completed = true
AND data->>'deathTime' IS NOT NULL) death_mins
GROUP BY mins;`);
			if (result.length === 0) return 'No results.';
			const buffer = await lineChart(
				'Personal Inferno Death Times',
				result.map(i => [i.mins.toString(), i.count]),
				val => `${val} Mins`
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Personal Inferno',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result = (
				await Promise.all(
					Object.values(SkillsEnum).map(
						skillName =>
							prisma.$queryRawUnsafe(`SELECT '${skillName}' as skill_name, COUNT(id)::int AS qty
FROM users
WHERE "skills.${skillName}" = 200000000::int;`) as Promise<{ qty: number; skill_name: string }[]>
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
			const result: { plant: string; qty: number }[] =
				await prisma.$queryRawUnsafe(`SELECT data->>'plantsName' as plant, COUNT(data->>'plantsName') AS qty
FROM activity
WHERE type = 'Farming'
AND data->>'plantsName' IS NOT NULL
AND user_id = ${BigInt(user.id)}
GROUP BY data->>'plantsName'`);
			result.sort((a, b) => b.qty - a.qty);
			const buffer = await barChart(
				'Personal Farmed Crops',
				val => `${val} Crops`,
				result.map(i => [i.plant, i.qty])
			);
			return makeResponseForBuffer(buffer);
		}
	},
	{
		name: 'Global Farmed Crops',
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
		run: async (_, stats) => {
			return makeResponseForBank(new Bank(stats.tob_cost as ItemBank), 'Your TOB Cost');
		}
	},
	{
		name: 'Personal TOB Loot',
		perkTierNeeded: PerkTier.Four,
		run: async (_, stats) => {
			return makeResponseForBank(new Bank(stats.tob_loot as ItemBank), 'Your TOB Loot');
		}
	},
	{
		name: 'Personal Slayer Tasks',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser, stats) => {
			const result = await personalHerbloreStats(user, stats);
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
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
	},
	{
		name: 'Personal Smelting Stats',
		perkTierNeeded: PerkTier.Four,
		run: async (user: MUser) => {
			const result = await personalSmeltingStats(user);
			if (result.length === 0) return "You haven't smelted anything yet.";
			return `You've smelted...
${result
	.items()
	.sort(sorts.quantity)
	.slice(0, 15)
	.map(i => `${i[0].name}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	},
	{
		name: 'Global Servers',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			return `Old School Bot is in ${globalClient.guilds.cache.size} servers.`;
		}
	},
	{
		name: 'Global Minions',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result = await prisma.$queryRawUnsafe<any>(
				'SELECT COUNT(*) FROM users WHERE "minion.hasBought" = true;'
			);
			return `There are ${result[0].count.toLocaleString()} minions!`;
		}
	},
	{
		name: 'Global Ironmen',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result = await prisma.$queryRawUnsafe<any>(
				'SELECT COUNT(*) FROM users WHERE "minion.ironman" = true;'
			);
			return `There are ${parseInt(result[0].count).toLocaleString()} ironman minions!`;
		}
	},
	{
		name: 'Global Icons',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result: { icon: string | null; qty: number }[] = await prisma.$queryRawUnsafe(
				'SELECT "minion.icon" as icon, COUNT(*) as qty FROM users WHERE "minion.icon" is not null group by "minion.icon" order by qty asc;'
			);
			return `**Current minion tiers and their number of users:**\n${Object.values(result)
				.map(row => `${row.icon ?? '<:minion:763743627092164658>'} : ${row.qty}`)
				.join('\n')}`;
		}
	},
	{
		name: 'Global Bank Backgrounds',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result = await prisma.$queryRawUnsafe<any>(`SELECT "bankBackground", COUNT(*)
FROM users
WHERE "bankBackground" <> 1
GROUP BY "bankBackground";`);

			return result
				.map(
					(res: any) =>
						`**${getBankBgById(res.bankBackground).name}:** ${parseInt(res.count).toLocaleString()}`
				)
				.join('\n');
		}
	},
	{
		name: 'Global Sacrificed',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result = await prisma.$queryRawUnsafe<any>('SELECT SUM ("sacrificedValue") AS total FROM users;');
			return `There has been ${parseInt(result[0].total).toLocaleString()} GP worth of items sacrificed!`;
		}
	},
	{
		name: 'Global Monsters Killed',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const totalBank: { [key: string]: number } = {};

			const res: any = await prisma.$queryRawUnsafe(
				'SELECT ARRAY(SELECT "monster_scores" FROM user_stats WHERE "monster_scores"::text <> \'{}\'::text);'
			);

			const banks: ItemBank[] = res[0].array;

			banks.map(bank => {
				for (const [id, qty] of Object.entries(bank)) {
					if (!totalBank[id]) totalBank[id] = qty;
					else totalBank[id] += qty;
				}
			});

			let str = 'Bot Stats Monsters\n\n';
			str += Object.entries(totalBank)
				.sort(([, qty1], [, qty2]) => qty2 - qty1)
				.map(([monID, qty]) => {
					return `${Monsters.get(parseInt(monID))?.name}: ${qty.toLocaleString()}`;
				})
				.join('\n');

			return { files: [{ attachment: Buffer.from(str), name: 'Bot Stats Monsters.txt' }] };
		}
	},
	{
		name: 'Global Clues',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const totalBank: { [key: string]: number } = {};

			const res: any = await prisma.$queryRawUnsafe(
				'SELECT ARRAY(SELECT "openable_scores" FROM user_stats WHERE "openable_scores"::text <> \'{}\'::text);'
			);

			const banks: ItemBank[] = res[0].array;

			banks.map(bank => {
				for (const [id, qty] of Object.entries(bank)) {
					if (!ClueTiers.some(i => i.id === Number(id))) continue;
					if (!totalBank[id]) totalBank[id] = qty;
					else totalBank[id] += qty;
				}
			});

			return Object.entries(totalBank)
				.map(
					([clueID, qty]) =>
						`**${ClueTiers.find(t => t.id === parseInt(clueID))?.name}:** ${qty.toLocaleString()}`
				)
				.join('\n');
		}
	},
	{
		name: 'Personal Clue Stats',
		perkTierNeeded: null,
		run: async (user, stats) => {
			const clueScores = getClueScoresFromOpenables(new Bank(stats.openable_scores as ItemBank));
			if (clueScores.length === 0) return "You haven't done any clues yet.";

			let res = `${Emoji.Casket} **${user.minionName}'s Clue Scores:**\n\n`;
			for (const [clueID, clueScore] of Object.entries(clueScores.bank)) {
				const clue = ClueTiers.find(c => c.id === parseInt(clueID));
				res += `**${clue!.name}**: ${clueScore.toLocaleString()}\n`;
			}
			return res;
		}
	},
	{
		name: 'Personal Open Stats',
		perkTierNeeded: null,
		run: async (_, stats) => {
			return makeResponseForBank(new Bank(stats.openable_scores as ItemBank), "You've opened...");
		}
	},
	{
		name: 'Personal Agility Stats',
		perkTierNeeded: null,
		run: async (user, stats) => {
			const entries = Object.entries(stats.laps_scores as ItemBank).map(arr => [parseInt(arr[0]), arr[1]]);
			const sepulchreCount = await getMinigameScore(user.id, 'sepulchre');
			if (sepulchreCount === 0 && entries.length === 0) {
				return "You haven't done any laps yet! Sad.";
			}
			const data = `${entries
				.map(([id, qty]) => `**${Agility.Courses.find(c => c.id === id)!.name}:** ${qty}`)
				.join('\n')}\n**Hallowed Sepulchre:** ${sepulchreCount}`;
			return data;
		}
	},
	{
		name: 'Total Items Sold',
		perkTierNeeded: PerkTier.Four,
		run: async (_, stats) => {
			return makeResponseForBank(new Bank(stats.items_sold_bank as ItemBank), "You've sold...");
		}
	},
	{
		name: 'Total GP From Selling',
		perkTierNeeded: PerkTier.Four,
		run: async (_, stats) => {
			return `You've received **${Number(stats.sell_gp).toLocaleString()}** GP from selling items.`;
		}
	},
	{
		name: 'Prayer XP from Ash Sanctifier',
		perkTierNeeded: PerkTier.Four,
		run: async (_, stats) => {
			return `You've received **${Number(
				stats.ash_sanctifier_prayer_xp
			).toLocaleString()}** XP from using the Ash Sanctifier.`;
		}
	},
	{
		name: 'Bird Eggs Offered',
		perkTierNeeded: null,
		run: async (_, stats) => {
			return `You've offered... **${new Bank(stats.bird_eggs_offered_bank as ItemBank)}**.`;
		}
	},
	{
		name: 'Ashes Scattered',
		perkTierNeeded: null,
		run: async (_, stats) => {
			return makeResponseForBank(new Bank(stats.scattered_ashes_bank as ItemBank), "You've scattered...");
		}
	},
	{
		name: 'Total Giveaway Cost',
		perkTierNeeded: PerkTier.Four,
		run: async u => {
			const giveaways = await prisma.economyTransaction.findMany({
				where: {
					sender: BigInt(u.id),
					type: 'giveaway'
				},
				select: {
					items_sent: true
				}
			});
			let items = new Bank();
			for (const g of giveaways) {
				items.add(g.items_sent as ItemBank);
			}
			sanitizeBank(items);
			return makeResponseForBank(items, "You've given away...");
		}
	},
	{
		name: 'Total Giveaway Winnings/Loot',
		perkTierNeeded: PerkTier.Four,
		run: async u => {
			const giveaways = await prisma.economyTransaction.findMany({
				where: {
					recipient: BigInt(u.id),
					type: 'giveaway'
				},
				select: {
					items_sent: true
				}
			});
			let items = new Bank();
			for (const g of giveaways) {
				items.add(g.items_sent as ItemBank);
			}
			sanitizeBank(items);
			return makeResponseForBank(items, "You've received from giveaways...");
		}
	},
	{
		name: 'Rarest CL Items',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const res = await prisma.$queryRaw<{ banks: ItemBank }[]>`SELECT jsonb_object_agg(itemid, itemqty) AS banks
FROM   (
                  SELECT     KEY             AS itemid,
                             SUM(FLOOR(value::numeric)::bigint) AS itemqty
                  FROM       users
                  CROSS JOIN jsonb_each_text("collectionLogBank")
                  GROUP BY   KEY ) s;`;
			const bank = new Bank(res[0].banks);
			return {
				content: `**Rarest CL Items**
${bank
	.items()
	.filter(isCLItem)
	.sort(sorts.quantity)
	.reverse()
	.slice(0, 10)
	.map((ent, ind) => `${++ind}. ${ent[0].name}: ${ent[1]}`)
	.join('\n')}`
			};
		}
	},
	{
		name: 'Rarest CL Items (Ironmen)',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const res = await prisma.$queryRaw<{ banks: ItemBank }[]>`SELECT jsonb_object_agg(itemid, itemqty) AS banks
FROM   (
                  SELECT     KEY             AS itemid,
                             SUM(FLOOR(value::numeric)::bigint) AS itemqty
                  FROM       users
                  CROSS JOIN jsonb_each_text("collectionLogBank")
				  WHERE "users"."minion.ironman" = true
                  GROUP BY   KEY ) s;`;
			const bank = new Bank(res[0].banks);
			return {
				content: `**Rarest CL Items (Ironmen)**
${bank
	.items()
	.filter(isCLItem)
	.sort(sorts.quantity)
	.reverse()
	.slice(0, 10)
	.map((ent, ind) => `${++ind}. ${ent[0].name}: ${ent[1]}`)
	.join('\n')}`
			};
		}
	},
	{
		name: 'Random Events',
		perkTierNeeded: PerkTier.Four,
		run: async (_, userStats) => {
			let str = 'You have completed...\n\n';
			for (const event of RandomEvents) {
				const qty = (userStats.random_event_completions_bank as ItemBank)[event.id] ?? 0;
				str += `${event.name}: ${qty}\n`;
			}
			return str;
		}
	},
	{
		name: 'Tombs of Amascut (TOA) cost',
		perkTierNeeded: PerkTier.Four,
		run: (_, userStats) => {
			return makeResponseForBank(new Bank(userStats.toa_cost as ItemBank), 'Your TOA Cost');
		}
	},
	{
		name: 'Tombs of Amascut (TOA) loot',
		perkTierNeeded: PerkTier.Four,
		run: (_, userStats) => {
			return makeResponseForBank(new Bank(userStats.toa_loot as ItemBank), 'Your TOA Loot');
		}
	},
	{
		name: 'Raids/CoX Luckiest and Unluckiest',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const items = resolveItems([
				'Dexterous prayer scroll',
				'Arcane prayer scroll',
				'Twisted buckler',
				'Dragon hunter crossbow',
				"Dinh's bulwark",
				'Ancestral hat',
				'Ancestral robe top',
				'Ancestral robe bottom',
				'Dragon claws',
				'Elder maul',
				'Kodai insignia',
				'Twisted bow'
			]);
			const totalCoxItemsText = SQL_sumOfAllCLItems(items);
			const [luckiestSQL, unluckiestSQL] = ['ASC', 'DESC'].map(
				order => `SELECT "users"."id", "user_stats".total_cox_points AS points, "minigames"."raids" + "minigames"."raids_challenge_mode" AS raids_total_kc, ${totalCoxItemsText} AS total_cox_items, "user_stats".total_cox_points / ${totalCoxItemsText} AS points_per_item
FROM user_stats
INNER JOIN "users" on "users"."id" = "user_stats"."user_id":: text
INNER JOIN "minigames" on "minigames"."user_id" = "user_stats"."user_id":: text
WHERE "user_stats".total_cox_points > 0 AND ${totalCoxItemsText} > 10
ORDER BY points_per_item ${order}
LIMIT 5;`
			);

			const [luckiest, unluckiest] = (await Promise.all([
				prisma.$queryRawUnsafe(luckiestSQL),
				prisma.$queryRawUnsafe(unluckiestSQL)
			])) as {
				id: string;
				points: number;
				raids_total_kc: number;
				total_cox_items: number;
				points_per_item: number;
			}[][];

			const response = `**Luckiest CoX Raiders**
${luckiest
	.map(
		i =>
			`${getUsername(i.id)}: ${i.points_per_item.toLocaleString()} points per item / 1 in ${(
				i.raids_total_kc / i.total_cox_items
			).toFixed(1)} raids`
	)
	.join('\n')}

**Unluckiest CoX Raiders**
${unluckiest
	.map(
		i =>
			`${getUsername(i.id)}: ${i.points_per_item.toLocaleString()} points per item / 1 in ${(
				i.raids_total_kc / i.total_cox_items
			).toFixed(1)} raids`
	)
	.join('\n')}`;
			return {
				content: response
			};
		}
	},
	{
		name: 'Items In Bank Not Sacrificed',
		perkTierNeeded: null,
		run: (user, userStats) => {
			const sacrificedItems = new Bank(userStats.sacrificed_bank as ItemBank).items().map(i => i[0].id);
			const itemsNotSac = user.bank.items().map(i => i[0].id);
			const itemsNotSacFiltered = itemsNotSac.filter(i => !sacrificedItems.includes(i));
			const itemsNotSacBank = new Bank();
			for (const item of itemsNotSacFiltered) itemsNotSacBank.add(item);
			return makeResponseForBank(itemsNotSacBank, 'Not Sacrificed Items');
		}
	},
	{
		name: 'Herbs cleaned while farming',
		perkTierNeeded: PerkTier.Four,
		run: (_, userStats) => {
			return makeResponseForBank(
				new Bank().add(userStats.herbs_cleaned_while_farming_bank as ItemBank),
				'Herbs cleaned while farming'
			);
		}
	},
	{
		name: 'Implings Obtained Passively',
		perkTierNeeded: null,
		run: (_, userStats) => {
			return makeResponseForBank(
				new Bank().add(userStats.passive_implings_bank as ItemBank),
				'Implings Obtained Passively'
			);
		}
	},
	{
		name: 'Weekly XP Gains',
		perkTierNeeded: PerkTier.Four,
		run: async user => {
			const result = await fetchHistoricalDataDifferences(user);
			const dataPoints: [string, number][] = result.map(i => [i.week_start, i.diff_total_xp]);
			return makeResponseForBuffer(
				await barChart('Your Weekly XP Gains', val => `${toKMB(val)} XP`, dataPoints, true)
			);
		}
	},
	{
		name: 'Weekly CL slot gains',
		perkTierNeeded: PerkTier.Four,
		run: async user => {
			const result = await fetchHistoricalDataDifferences(user);
			const dataPoints: [string, number][] = result.map(i => [i.week_start, i.diff_cl_completion_count]);
			return makeResponseForBuffer(
				await barChart('Your Weekly CL slot Gains', val => `${toKMB(val)} Slots`, dataPoints, true)
			);
		}
	},
	{
		name: 'Weekly CL leaderboard rank gains',
		perkTierNeeded: PerkTier.Four,
		run: async user => {
			const result = await fetchHistoricalDataDifferences(user);
			const dataPoints: [string, number][] = result.map(i => [i.week_start, i.diff_cl_global_rank]);
			return makeResponseForBuffer(
				await barChart(
					'Your Weekly CL leaderboard rank gains',
					val => `${val > 0 ? `+${val}` : val}`,
					dataPoints,
					true
				)
			);
		}
	},
	{
		name: 'Weekly GP gains',
		perkTierNeeded: PerkTier.Four,
		run: async user => {
			const result = await fetchHistoricalDataDifferences(user);
			const dataPoints: [string, number][] = result.map(i => [i.week_start, i.diff_GP]);
			return makeResponseForBuffer(
				await barChart('Your Weekly GP gains', val => `${toKMB(val)} GP`, dataPoints, true)
			);
		}
	}
] as const;

export async function statsCommand(user: MUser, type: string): CommandResponse {
	const cooldown = Cooldowns.get(user.id, 'stats_command', Time.Second * 5);
	if (cooldown !== null) {
		return `This command is on cooldown, you can use it again in ${formatDuration(cooldown)}`;
	}
	const dataPoint = dataPoints.find(dp => stringMatches(dp.name, type));
	if (!dataPoint) return 'Invalid stat name.';
	const { perkTierNeeded } = dataPoint;
	if (perkTierNeeded !== null && user.perkTier() < perkTierNeeded) {
		return `Sorry, you need to be a Tier ${perkTierNeeded - 1} Patron to see this stat.`;
	}
	const userStats = await prisma.userStats.upsert({
		where: {
			user_id: BigInt(user.id)
		},
		update: {},
		create: {
			user_id: BigInt(user.id)
		}
	});
	return dataPoint.run(user, userStats);
}
