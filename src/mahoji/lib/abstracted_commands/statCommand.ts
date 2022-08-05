import { bold } from '@discordjs/builders';
import { activity_type_enum, User } from '@prisma/client';
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
import { calcCLDetails } from '../../../lib/data/Collections';
import { calcActualClues } from '../../../lib/leagues/leagues';
import backgroundImages from '../../../lib/minions/data/bankBackgrounds';
import killableMonsters from '../../../lib/minions/data/killableMonsters';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { prisma } from '../../../lib/settings/prisma';
import Agility from '../../../lib/skilling/skills/agility';
import { Castables } from '../../../lib/skilling/skills/magic/castables';
import { getSlayerTaskStats } from '../../../lib/slayer/slayerUtil';
import { sorts } from '../../../lib/sorts';
import { InfernoOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import { barChart, lineChart, pieChart } from '../../../lib/util/chart';
import { getItem } from '../../../lib/util/getOSItem';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { minionName } from '../../../lib/util/minionUtils';
import { getMahojiBank, mahojiUsersSettingsFetch } from '../../mahojiSettings';
import { Cooldowns } from '../Cooldowns';
import { collectables } from './collectCommand';

interface DataPiece {
	name: string;
	perkTierNeeded: PerkTier | null;
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

export async function personalFiremakingStats(user: User) {
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

export async function personalWoodcuttingStats(user: User) {
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

export async function personalMiningStats(user: User) {
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

export async function personalHerbloreStats(user: User) {
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
	return items;
}
export async function personalAlchingStats(user: User, includeAgilityAlching = true) {
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
export async function personalSmithingStats(user: User) {
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
export async function personalSmeltingStats(user: User) {
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
export async function personalSpellCastStats(user: User) {
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
export async function personalCollectingStats(user: User) {
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

export const dataPoints: readonly DataPiece[] = [
	{
		name: 'Personal Activity Types',
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const result: { mins: number; count: number }[] =
				await prisma.$queryRaw`SELECT mins, COUNT(mins) FROM (SELECT ((data->>'deathTime')::int / 1000 / 60) as mins
FROM activity
WHERE type = 'Inferno'
AND data->>'deathTime' IS NOT NULL) death_mins
AND completed = true
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
		perkTierNeeded: PerkTier.Four,
		run: async (user: User) => {
			const result: { mins: number; count: number }[] =
				await prisma.$queryRawUnsafe(`SELECT mins, COUNT(mins) FROM (SELECT ((data->>'deathTime')::int / 1000 / 60) as mins
FROM activity
WHERE type = 'Inferno'
AND user_id = ${BigInt(user.id)}
AND data->>'deathTime' IS NOT NULL) death_mins
AND completed = true
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		run: async (user: User) => {
			return makeResponseForBank(new Bank(user.tob_cost as ItemBank), 'Your TOB Cost');
		}
	},
	{
		name: 'Personal TOB Loot',
		perkTierNeeded: PerkTier.Four,
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
		},
		perkTierNeeded: PerkTier.Four
	},
	{
		name: 'Personal Slayer Tasks',
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
		perkTierNeeded: PerkTier.Four,
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
	},
	{
		name: 'Personal Smelting Stats',
		perkTierNeeded: PerkTier.Four,
		run: async (user: User) => {
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
						`**${backgroundImages[res.bankBackground - 1].name}:** ${parseInt(res.count).toLocaleString()}`
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
				'SELECT ARRAY(SELECT "monsterScores" FROM users WHERE "monsterScores"::text <> \'{}\'::text);'
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

			return { attachments: [{ buffer: Buffer.from(str), fileName: 'Bot Stats Monsters.txt' }] };
		}
	},
	{
		name: 'Global Clues',
		perkTierNeeded: PerkTier.Four,
		run: async () => {
			const totalBank: { [key: string]: number } = {};

			const res: any = await prisma.$queryRawUnsafe(
				'SELECT ARRAY(SELECT "openable_scores" FROM users WHERE "openable_scores"::text <> \'{}\'::text);'
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
		run: async (user: User) => {
			const userData = await mahojiUsersSettingsFetch(user.id, {
				openable_scores: true
			});

			const clueScores = getClueScoresFromOpenables(new Bank(userData.openable_scores as ItemBank));
			if (clueScores.length === 0) return "You haven't done any clues yet.";

			let res = `${Emoji.Casket} **${minionName(user)}'s Clue Scores:**\n\n`;
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
		run: async (user: User) => {
			return makeResponseForBank(new Bank(user.openable_scores as ItemBank), "You've opened...");
		}
	},
	{
		name: 'Personal Agility Stats',
		perkTierNeeded: null,
		run: async (user: User) => {
			const entries = Object.entries(user.lapsScores as ItemBank).map(arr => [parseInt(arr[0]), arr[1]]);
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
		name: 'Actual Clues Done',
		perkTierNeeded: null,
		run: async (user: User) => {
			const actualClues = await calcActualClues(user);
			return `These are the clues you have acquired, completed and opened yourself:

${actualClues
	.items()
	.map(i => `${bold(i[0].name)}: ${i[1].toLocaleString()}`)
	.join('\n')}`;
		}
	}
] as const;

export async function statsCommand(user: User, type: string): CommandResponse {
	const cooldown = Cooldowns.get(user.id, 'stats_command', Time.Second * 5);
	if (cooldown !== null) {
		return `This command is on cooldown, you can use it again in ${formatDuration(cooldown)}`;
	}
	const dataPoint = dataPoints.find(dp => stringMatches(dp.name, type));
	if (!dataPoint) return 'Invalid stat name.';
	const { perkTierNeeded } = dataPoint;
	if (perkTierNeeded !== null && getUsersPerkTier(user) < perkTierNeeded) {
		return `Sorry, you need to be a Tier ${perkTierNeeded + 1} Patron to see this stat.`;
	}
	return dataPoint.run(user);
}
