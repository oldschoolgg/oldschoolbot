import { asyncGzip, formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import type { Activity, User } from '@prisma/client';
import { ChannelType, EmbedBuilder } from 'discord.js';
import { Bank, type Item, type ItemBank, ItemGroups, Items, resolveItems, ToBUniqueTable } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { allStashUnitsFlat } from '@/lib/clues/stashUnits.js';
import { BitField, PerkTier } from '@/lib/constants.js';
import { allCLItemsFiltered, allDroppedItems } from '@/lib/data/Collections.js';
import { gnomeRestaurantCL, guardiansOfTheRiftCL, shadesOfMorttonCL } from '@/lib/data/CollectionsExport.js';
import pets from '@/lib/data/pets.js';
import { choicesOf, itemOption, monsterOption, skillOption } from '@/lib/discord/index.js';
import killableMonsters, { effectiveMonsters, NightmareMonster } from '@/lib/minions/data/killableMonsters/index.js';
import { allOpenables, type UnifiedOpenable } from '@/lib/openables.js';
import type { MinigameName } from '@/lib/settings/minigames.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { Skills } from '@/lib/skilling/skills/index.js';
import type { NexTaskOptions, RaidsOptions, TheatreOfBloodTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { parseStaticTimeInterval, staticTimeIntervals } from '@/lib/util/smallUtils.js';
import { getUsername, isGroupActivity } from '@/lib/util.js';
import {
	stashUnitBuildAllCommand,
	stashUnitFillAllCommand,
	stashUnitUnfillCommand,
	stashUnitViewCommand
} from '@/mahoji/lib/abstracted_commands/stashUnitsCommand.js';
import { patronMsg } from '@/mahoji/mahojiSettings.js';

function isRaidsActivity(data: any): data is RaidsOptions {
	return 'challengeMode' in data;
}

function isTOBOrTOAActivity(data: any): data is TheatreOfBloodTaskOptions {
	return 'wipedRoom' in data;
}

function isNexActivity(data: any): data is NexTaskOptions {
	return 'wipedKill' in data && 'userDetails' in data && 'leader' in data;
}

const skillsVals = Object.values(Skills);

function dateDiff(first: number, second: number) {
	return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

const whereInMassClause = (id: string) =>
	`OR (group_activity = true AND data::jsonb ? 'users' AND data->>'users'::text LIKE '%${id}%')`;

async function activityExport(user: User): CommandResponse {
	const allActivities = await prisma.$queryRawUnsafe<
		Activity[]
	>(`SELECT floor(date_part('epoch', start_date)) AS start_date, floor(date_part('epoch', finish_date)) AS finish_date, duration, type, data
FROM activity
WHERE user_id = '${user.id}'
OR (group_activity = true AND data::jsonb ? 'users' AND data->>'users'::text LIKE '%${user.id}%');`);
	let res = ['Start', 'Finish', 'Duration', 'Type', 'Data'].join('\t');
	for (const { start_date, finish_date, duration, type, data } of allActivities) {
		res += `\n${start_date}\t${finish_date}\t${duration}\t${type}\t${JSON.stringify(data)}`;
	}
	const buffer = Buffer.from(res, 'utf-8');
	const zipped = await asyncGzip(buffer);

	return {
		files: [{ name: 'activity-export.txt.gz', attachment: zipped }]
	};
}

async function minionStats(user: User) {
	const { id } = user;
	const [[totalActivities], [firstActivity], countsPerActivity, [_totalDuration]] = (await Promise.all([
		prisma.$queryRawUnsafe(`SELECT count(id)
FROM activity
WHERE user_id = ${id}
${whereInMassClause(id)};`),
		prisma.$queryRawUnsafe(`SELECT id, start_date, type
FROM activity
WHERE user_id = ${id}
ORDER BY id ASC
LIMIT 1;`),
		prisma.$queryRawUnsafe(`
SELECT type, count(type) as qty
FROM activity
WHERE user_id = ${id}
${whereInMassClause(id)}
GROUP BY type
ORDER BY qty DESC
LIMIT 15;`),
		prisma.$queryRawUnsafe(`
SELECT sum(duration)
FROM activity
WHERE user_id = ${id}
${whereInMassClause(id)};`)
	])) as any[];

	const totalDuration = Number(_totalDuration.sum);
	const firstActivityDate = new Date(firstActivity.start_date);

	const diff = dateDiff(firstActivityDate.getTime(), Date.now());
	const perDay = totalDuration / diff;

	return `**Total Activities:** ${totalActivities.count}
**Common Activities:** ${countsPerActivity
		.slice(0, 3)
		.map((i: any) => `${i.qty}x ${i.type}`)
		.join(', ')}
**Total Minion Activity:** ${formatDuration(totalDuration)}
**First Activity:** ${firstActivity.type} ${firstActivityDate.toLocaleDateString('en-CA')}
**Average Per Day:** ${formatDuration(perDay)}
`;
}

async function clueGains(interval: string, tier?: string, ironmanOnly?: boolean) {
	if (!parseStaticTimeInterval(interval)) {
		return 'Invalid time interval.';
	}

	let tierFilter = '';
	let title = '';

	if (tier) {
		const clueTier = ClueTiers.find(t => t.name.toLowerCase() === tier.toLowerCase());
		if (!clueTier) return 'Invalid clue scroll tier.';
		const tierId = clueTier.id;
		tierFilter = `AND (a."data"->>'ci')::int = ${tierId}`;
		title = `Highest ${clueTier.name} clue scroll completions in the past ${interval}`;
	} else {
		title = `Highest All clue scroll completions in the past ${interval}`;
	}

	const query = `SELECT a.user_id::text, SUM((a."data"->>'q')::int) AS qty, MAX(a.finish_date) AS lastDate
	  FROM activity a
	  JOIN users u ON a.user_id::text = u.id
	  WHERE a.type = 'ClueCompletion'
	  AND a.finish_date >= now() - interval '1 ${interval}' AND a.completed = true
	  ${ironmanOnly ? ' AND u."minion.ironman" = true' : ''}
	  ${tierFilter}
	  GROUP BY a.user_id
	  ORDER BY qty DESC, lastDate ASC
	  LIMIT 10`;

	const res = await prisma.$queryRawUnsafe<{ user_id: string; qty: number }[]>(query);

	if (res.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new EmbedBuilder()
		.setTitle(title)
		.setDescription(
			(
				await Promise.all(
					res.map(
						async (i: any) =>
							`${++place}. **${await getUsername(i.user_id)}**: ${Number(i.qty).toLocaleString()}`
					)
				)
			).join('\n')
		);

	return { embeds: [embed] };
}

interface XPRecord {
	user: string;
	total_xp: number;
	lastDate: string;
}

async function executeXPGainsQuery(
	intervalValue: string,
	skillId: string | undefined,
	ironmanOnly: boolean
): Promise<XPRecord[]> {
	const query = `
        SELECT
            x.user_id::text AS user,
            sum(x.xp) AS total_xp,
            max(x.date) AS lastDate
        FROM
            xp_gains AS x
        INNER JOIN
            users AS u ON u.id = x.user_id::text
        WHERE
            x.date > now() - INTERVAL '1 ${intervalValue}'
            ${skillId ? `AND x.skill = '${skillId}'` : ''}
            ${ironmanOnly ? ' AND u."minion.ironman" = true' : ''}
        GROUP BY
            x.user_id
        ORDER BY
            total_xp DESC,
            lastDate ASC
        LIMIT 10;
    `;

	const result = await prisma.$queryRawUnsafe<XPRecord[]>(query);
	return result;
}

async function xpGains(interval: string, skill?: string, ironmanOnly?: boolean) {
	if (!parseStaticTimeInterval(interval)) {
		return 'Invalid time interval.';
	}

	const skillObj = skill
		? skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, skill)))
		: undefined;

	const xpRecords = await executeXPGainsQuery(interval, skillObj?.id, Boolean(ironmanOnly));

	if (xpRecords.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new EmbedBuilder()
		.setTitle(`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`)
		.setDescription(
			(
				await Promise.all(
					xpRecords.map(
						async record =>
							`${++place}. **${await getUsername(record.user)}**: ${Number(record.total_xp).toLocaleString()} XP`
					)
				)
			).join('\n')
		);

	return { embeds: [embed] };
}

export async function kcGains(interval: string, monsterName: string, ironmanOnly?: boolean): CommandResponse {
	if (!parseStaticTimeInterval(interval)) {
		return 'Invalid time interval.';
	}
	const monster = killableMonsters.find(
		k => stringMatches(k.name, monsterName) || k.aliases.some(a => stringMatches(a, monsterName))
	);

	if (!monster) {
		return 'Invalid monster.';
	}

	const query = `
    SELECT a.user_id::text, SUM((a."data"->>'q')::int) AS qty, MAX(a.finish_date) AS lastDate
    FROM activity a
    JOIN users u ON a.user_id::text = u.id
    WHERE a.type = 'MonsterKilling' AND (a."data"->>'mi')::int = ${monster.id}
    AND a.finish_date >= now() - interval '1 ${interval}'
    AND a.completed = true
    ${ironmanOnly ? ' AND u."minion.ironman" = true' : ''}
    GROUP BY a.user_id
    ORDER BY qty DESC, lastDate ASC
    LIMIT 10`;
	const res = await prisma.$queryRawUnsafe<{ user_id: string; qty: number }[]>(query);

	if (res.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new EmbedBuilder()
		.setTitle(`Highest ${monster.name} KC gains in the past ${interval}`)
		.setDescription(
			(
				await Promise.all(
					res.map(
						async (i: any) =>
							`${++place}. **${await getUsername(i.user_id)}**: ${Number(i.qty).toLocaleString()}`
					)
				)
			).join('\n')
		);

	return { embeds: [embed] };
}

interface DrystreakMinigame {
	name: string;
	key: MinigameName;
	items: number[];
}

const dryStreakMinigames: DrystreakMinigame[] = [
	{
		name: 'Theatre of Blood (ToB)',
		key: 'tob',
		items: ToBUniqueTable.allItems
	},
	{
		name: 'Fishing Trawler',
		key: 'fishing_trawler',
		items: ItemGroups.anglerOutfit
	},
	{
		name: 'Gnome Restaurant',
		key: 'gnome_restaurant',
		items: gnomeRestaurantCL
	},
	{
		name: 'Gauntlet',
		key: 'gauntlet',
		items: resolveItems(['Crystal weapon seed', 'Crystal armour seed', 'Enhanced crystal weapon seed', 'Youngllef'])
	},
	{
		name: 'Inferno',
		key: 'inferno',
		items: resolveItems(['Jal-nib-rek'])
	},
	{
		name: 'Wintertodt',
		key: 'wintertodt',
		items: resolveItems(['Tome of fire', 'Phoenix', 'Bruma torch', 'Warm gloves'])
	},
	{
		name: 'Tombs of Amascut',
		key: 'tombs_of_amascut',
		items: ItemGroups.toaCL
	},
	{
		name: 'Shades of Morton',
		key: 'shades_of_morton',
		items: shadesOfMorttonCL
	}
];

interface DrystreakEntity {
	name: string;
	items: number[];
	run: (args: { item: Item; ironmanOnly: boolean }) => Promise<string | { id: string; val: number | string }[]>;
	format: (num: number | string) => string;
}

function convertOpenableToDryStreakEntity(openable: UnifiedOpenable): DrystreakEntity {
	return {
		name: openable.name,
		items: openable.allItems,
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; val: number }[]
			>(`SELECT id, ("openable_scores"->>'${openable.id}')::int AS val
FROM users
INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
WHERE "collectionLogBank"->>'${item.id}' IS NULL
AND "openable_scores"->>'${openable.id}' IS NOT NULL
${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
ORDER BY ("openable_scores"->>'${openable.id}')::int DESC
LIMIT 10;`);
			return result;
		},
		format: val => `${val.toLocaleString()} ${openable.name}`
	};
}

export const dryStreakEntities: DrystreakEntity[] = [
	{
		name: 'Chambers of Xeric (CoX)',
		items: resolveItems([
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
			'Twisted bow',
			'Olmlet'
		]),
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; points: number; raids_total_kc: number }[]
			>(`SELECT "users"."id", "user_stats".total_cox_points AS points, "minigames"."raids" + "minigames"."raids_challenge_mode" AS raids_total_kc
FROM user_stats
INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text
INNER JOIN "minigames" on "minigames"."user_id" = "user_stats"."user_id"::text
WHERE "collectionLogBank"->>'${item.id}' IS NULL
${ironmanOnly ? ' AND "minion.ironman" = true' : ''}
ORDER BY "user_stats".total_cox_points DESC
LIMIT 10;`);
			return result.map(i => ({
				id: i.id,
				val: `${i.points.toLocaleString()} points / ${i.raids_total_kc} KC`
			}));
		},
		format: num => num.toString()
	},
	{
		name: 'Nightmare',
		items: resolveItems([
			"Inquisitor's mace",
			"Inquisitor's great helm",
			"Inquisitor's hauberk",
			"Inquisitor's plateskirt",
			'Nightmare staff',
			'Eldritch orb',
			'Volatile orb',
			'Harmonised orb'
		]),
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; val: number }[]
			>(`SELECT "id", ("monster_scores"->>'${NightmareMonster.id}')::int AS val
		   FROM users
		   INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
		   WHERE "collectionLogBank"->>'${item.id}' IS NULL
		   AND "monster_scores"->>'${NightmareMonster.id}' IS NOT NULL
		   ${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
		   ORDER BY ("monster_scores"->>'${NightmareMonster.id}')::int DESC
		   LIMIT 10;`);
			return result;
		},

		format: num => `${num.toLocaleString()} KC`
	},
	{
		name: 'Barbarian Assault (Pet penance queen)',
		items: resolveItems(['Pet penance queen']),
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT "id", high_gambles AS val
				   FROM users
				   INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
				   WHERE "collectionLogBank"->>'${item.id}' IS NULL
				   AND high_gambles > 0
				   ${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
				   ORDER BY high_gambles DESC
				   LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} Gambles`
	},
	{
		name: 'Guardians of the Rift',
		items: guardiansOfTheRiftCL,
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; val: number }[]
			>(`SELECT users.id, gotr_rift_searches AS val
            FROM users
            INNER JOIN "user_stats" "userstats" on "userstats"."user_id"::text = "users"."id"
            WHERE "collectionLogBank"->>'${item.id}' IS NULL
            ${ironmanOnly ? ' AND "minion.ironman" = true' : ''}
            ORDER BY gotr_rift_searches DESC
            LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} Rift Searches`
	},
	{
		name: 'Evil Chicken Outfit',
		items: ItemGroups.evilChickenOutfit,
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`
            SELECT *
			FROM
			(
			SELECT users.id::text
            , COALESCE(SUM((bird_eggs_offered_bank->>'5076')::int),0)
                + COALESCE(SUM((bird_eggs_offered_bank->>'5077')::int),0)
                + COALESCE(SUM((bird_eggs_offered_bank->>'5078')::int),0) AS val
            FROM users
            INNER JOIN "user_stats" "userstats" on "userstats"."user_id"::text = "users"."id"
            WHERE "collectionLogBank"->>'${item.id}' IS NULL
            ${ironmanOnly ? ' AND "minion.ironman" = true' : ''}
            GROUP BY users.id
            ORDER BY val DESC
            LIMIT 10
			)
			AS eggs
			WHERE eggs.val > 0;`);
			return result;
		},
		format: num => `${num.toLocaleString()} Bird Eggs Offered`
	},
	{
		name: 'Random Events',
		items: resolveItems(['Stale baguette']),
		run: async ({ ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; mbox_opens: number; baguettes_received: number }[]
			>(`SELECT id, (openable_scores->>'6199')::int AS mbox_opens, ("collectionLogBank"->>'6961')::int AS baguettes_received,

(openable_scores->>'6199')::int + (("collectionLogBank"->>'6961')::int * 4) AS factor

FROM users
INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
WHERE "collectionLogBank"->>'6199' IS NOT NULL
AND "collectionLogBank"->>'6961' IS NOT NULL
AND "collectionLogBank"->>'20590' IS NULL
AND openable_scores->>'6199' IS NOT NULL
AND (openable_scores->>'6199')::int > 3
${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
ORDER BY factor DESC
LIMIT 10;`);
			return result.map(i => ({
				id: i.id,
				val: `${i.mbox_opens} Mystery box Opens, ${i.baguettes_received} Baguettes`
			}));
		},
		format: num => `${num.toLocaleString()}`
	},
	{
		name: 'Superior Slayer Creatures',
		items: resolveItems(['Imbued heart', 'Eternal gem']),
		run: async ({ ironmanOnly, item }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; slayer_superior_count: number }[]
			>(`SELECT id, slayer_superior_count
FROM users
INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
WHERE "collectionLogBank"->>'${item.id}' IS NULL
${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
ORDER BY slayer_superior_count DESC
LIMIT 10;`);
			return result.map(i => ({
				id: i.id,
				val: `${i.slayer_superior_count} Superiors Slayed`
			}));
		},
		format: num => `${num.toLocaleString()}`
	}
];
for (const minigame of dryStreakMinigames) {
	dryStreakEntities.push({
		name: minigame.name,
		items: minigame.items,
		run: async ({ item, ironmanOnly }) => {
			const minigameObj = Minigames.find(i => i.column === minigame.key)!;
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT users.id, "minigame"."${
				minigameObj.column
			}" AS val
FROM users
INNER JOIN "minigames" "minigame" on "minigame"."user_id" = "users"."id"::text
WHERE "collectionLogBank"->>'${item.id}' IS NULL
${ironmanOnly ? ' AND "minion.ironman" = true' : ''}
ORDER BY "minigame"."${minigameObj.column}" DESC
LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} KC`
	});
}

const names = new Set();
for (const openable of allOpenables) {
	if (openable.allItems.length > 0 && !names.has(openable.name)) {
		dryStreakEntities.push(convertOpenableToDryStreakEntity(openable));
		names.add(openable.name);
	}
}

async function dryStreakCommand(sourceName: string, itemName: string, ironmanOnly: boolean) {
	const item = Items.get(itemName);
	if (!item) return 'Invalid item.';
	const entity = dryStreakEntities.find(
		e =>
			stringMatches(e.name, sourceName) ||
			allOpenables.some(o => o.name === e.name && o.aliases.some(alias => stringMatches(alias, sourceName)))
	);

	if (entity) {
		if (!entity.items.includes(item.id)) {
			return `That's not a valid item dropped for this thing, valid items are: ${entity.items
				.map(id => Items.itemNameFromId(id))
				.join(', ')}.`;
		}

		const result = await entity.run({ item, ironmanOnly });
		if (result.length === 0) return 'No results found.';
		if (typeof result === 'string') return result;

		return `**Dry Streaks for ${item.name} from ${entity.name}:**\n${(
			await Promise.all(
				result.map(async ({ id, val }) => `${await getUsername(id)}: ${entity.format(val || -1)}`)
			)
		).join('\n')}`;
	}

	const mon = effectiveMonsters.find(mon => mon.aliases.some(alias => stringMatches(alias, sourceName)));
	if (!mon) {
		return "That's not a valid monster or minigame.";
	}

	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	const key = 'monster_scores';
	const { id } = mon;
	const query = `SELECT id, "${key}"->>'${id}' AS "KC"
				FROM users
				INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
				WHERE "collectionLogBank"->>'${item.id}' IS NULL
						AND "${key}"->>'${id}' IS NOT NULL
						${ironmanPart}
				ORDER BY ("${key}"->>'${id}')::int DESC
				LIMIT 10;`;

	const result =
		await prisma.$queryRawUnsafe<
			{
				id: string;
				KC: string;
			}[]
		>(query);

	if (result.length === 0) return 'No results found.';

	return `**Dry Streaks for ${item.name} from ${mon.name}:**\n${(
		await Promise.all(
			result.map(
				async ({ id, KC }) =>
					`${(await getUsername(id)) as string}: ${Number.parseInt(KC, 10).toLocaleString()}`
			)
		)
	).join('\n')}`;
}

async function mostDrops(user: MUser, itemName: string, filter: string) {
	const item = Items.get(itemName);
	const ironmanPart =
		filter === 'Irons Only'
			? 'AND "minion.ironman" = true'
			: filter === 'Mains Only'
				? 'AND "minion.ironman" = false'
				: '';
	if (!item) return "That's not a valid item.";
	if (!allDroppedItems.includes(item.id) && !user.bitfield.includes(BitField.isModerator)) {
		return "You can't check this item, because it's not on any collection log.";
	}

	const query = `SELECT "id", "collectionLogBank"->>'${item.id}' AS "qty" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NOT NULL ${ironmanPart} ORDER BY ("collectionLogBank"->>'${item.id}')::int DESC LIMIT 10;`;

	const result =
		await prisma.$queryRawUnsafe<
			{
				id: string;
				qty: string;
			}[]
		>(query);

	if (result.length === 0) return 'No results found.';

	return `**Most '${item.name}' received:**\n${(
		await Promise.all(
			result.map(
				async ({ id, qty }) =>
					`${result.length < 10 ? '(Anonymous)' : await getUsername(id)}: ${Number.parseInt(qty, 10).toLocaleString()}`
			)
		)
	).join('\n')}`;
}

async function checkMassesCommand(guildID: string | undefined) {
	if (!guildID) return 'This can only be used in a server.';
	const guild = globalClient.guilds.cache.get(guildID.toString());
	if (!guild) return 'Guild not found.';
	const channelIDs = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).map(c => BigInt(c.id));

	const masses = (
		await prisma.activity.findMany({
			where: {
				completed: false,
				group_activity: true,
				channel_id: { in: channelIDs }
			},
			orderBy: {
				finish_date: 'asc'
			}
		})
	)
		.map(_act => ActivityManager.convertStoredActivityToFlatActivity(_act))
		.filter(m => (isRaidsActivity(m) || isGroupActivity(m) || isTOBOrTOAActivity(m)) && m.users.length > 1);

	if (masses.length === 0) {
		return 'There are no active masses in this server.';
	}
	const now = Date.now();
	const massStr = masses
		.map(m => {
			const remainingTime =
				isTOBOrTOAActivity(m) || isNexActivity(m)
					? m.finishDate - m.duration + m.fakeDuration - now
					: m.finishDate - now;
			if ('users' in m) {
				return [
					remainingTime,
					`${m.type}${m.type === 'Raids' && m.challengeMode ? ' CM' : ''}: ${m.users.length} users (<#${
						m.channelID
					}> in ${formatDuration(remainingTime, true)})`
				];
			}
			return null;
		})
		.filter((m): m is [number, string] => m !== null)
		.sort((a, b) => (a![0] < b![0] ? -1 : a![0] > b![0] ? 1 : 0))
		.map(m => m![1])
		.join('\n');
	return `**Masses in this server:**
${massStr}`.slice(0, 1999);
}

export const toolsCommand = defineCommand({
	name: 'tools',
	description: 'Various tools and miscellaneous commands.',
	options: [
		{
			name: 'patron',
			description: 'Tools that only patrons can use.',
			type: 'SubcommandGroup',
			options: [
				{
					type: 'Subcommand',
					name: 'clue_gains',
					description: "Show's who has the highest clue scroll completions for a given time period.",
					options: [
						{
							type: 'String',
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: choicesOf(staticTimeIntervals)
						},
						{
							type: 'String',
							name: 'tier',
							description: 'The tier of clue scroll.',
							required: false,
							autocomplete: async (value: string) => {
								return [...ClueTiers.map(i => ({ name: i.name, value: i }))]
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.name }));
							}
						},
						{
							type: 'Boolean',
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'kc_gains',
					description: "Show's who has the highest KC gains for a given time period.",
					options: [
						{
							type: 'String',
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week', 'month'].map(i => ({ name: i, value: i }))
						},
						monsterOption,
						{
							type: 'Boolean',
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'xp_gains',
					description: "Show's who has the highest XP gains for a given time period.",
					options: [
						{
							type: 'String',
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: choicesOf(['day', 'week', 'month'])
						},
						skillOption,
						{
							type: 'Boolean',
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'drystreak',
					description: "Show's the biggest drystreaks for certain drops from a certain monster.",
					options: [
						{
							type: 'String',
							name: 'source',
							description: 'The source of the item – a monster, minigame, clue, etc.',
							required: true,
							autocomplete: async (value: string) => {
								return [
									...dryStreakEntities.map(i => ({ name: i.name, value: i })),
									...killableMonsters
								]
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.name }));
							}
						},
						{
							...itemOption(item => allCLItemsFiltered.includes(item.id)),
							required: true
						},
						{
							type: 'Boolean',
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'mostdrops',
					description:
						"Show's which players have received the most drops of an item, based on their collection log.",
					options: [
						{
							...itemOption(),
							required: true
						},
						{
							type: 'String',
							name: 'filter',
							description: 'Filter by account type.',
							required: false,
							choices: ['Both', 'Irons Only', 'Mains Only'].map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'sacrificed_bank',
					description: 'Shows an image containing all your sacrificed items.'
				},
				{
					type: 'Subcommand',
					name: 'cl_bank',
					description: 'Shows a bank image containing all items in your collection log.',
					options: [
						{
							type: 'String',
							name: 'format',
							description: 'Bank Image or Json format?',
							required: false,
							choices: ['bank', 'json'].map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'minion_stats',
					description: 'Shows statistics about your minion.'
				},
				{
					type: 'Subcommand',
					name: 'activity_export',
					description: 'Export all your activities (For advanced users).'
				}
			]
		},
		{
			name: 'user',
			description: 'Various tools for yourself.',
			type: 'SubcommandGroup',
			options: [
				{
					type: 'Subcommand',
					name: 'mypets',
					description: 'See the chat pets you have.',
					options: []
				},
				{
					type: 'Subcommand',
					name: 'temp_cl',
					description: 'Manage and view your temporary CL.',
					options: [
						{
							type: 'Boolean',
							name: 'reset',
							description: 'Reset your temporary CL.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'checkmasses',
					description: 'Check the masses going on in the server.'
				}
			]
		},
		{
			name: 'stash_units',
			description: 'Build and fill your treasure trails S.T.A.S.H units.',
			type: 'SubcommandGroup',
			options: [
				{
					type: 'Subcommand',
					name: 'view',
					description: 'View your STASH units.',
					options: [
						{
							type: 'String',
							name: 'unit',
							description: 'The specific unit you want to view (optional).',
							required: false,
							autocomplete: async (value: string) => {
								return allStashUnitsFlat
									.filter(i => (!value ? true : i.desc.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.desc, value: i.id }));
							}
						},
						{
							type: 'Boolean',
							name: 'not_filled',
							description: 'View all STASH units that you have not filled/built.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'build_all',
					description: 'Automatically build all the STASH units that you can.',
					options: []
				},
				{
					type: 'Subcommand',
					name: 'fill_all',
					description: 'Automatically fill all the STASH units that you can.',
					options: []
				},
				{
					type: 'Subcommand',
					name: 'unfill',
					description: 'Remove the items from a specific stash.',
					options: [
						{
							type: 'String',
							name: 'unit',
							description: 'The specific unit you want to unfill.',
							required: true,
							autocomplete: async (value: string, user: MUser) => {
								return (await user.fetchStashUnits())
									.filter(i => i.builtUnit !== undefined && i.builtUnit.items_contained.length > 0)
									.filter(i =>
										!value ? true : i.unit.desc.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i.unit.desc, value: i.unit.id }));
							}
						}
					]
				}
			]
		}
	],
	run: async ({ options, user, interaction, guildID }) => {
		await interaction.defer();

		if (options.patron) {
			const { patron } = options;

			if (patron.clue_gains) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return clueGains(patron.clue_gains.time, patron.clue_gains.tier, Boolean(patron.clue_gains.ironman));
			}
			if (patron.kc_gains) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return kcGains(patron.kc_gains.time, patron.kc_gains.monster, Boolean(patron.kc_gains.ironman));
			}
			if (patron.xp_gains) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return xpGains(patron.xp_gains.time, patron.xp_gains.skill, patron.xp_gains.ironman);
			}
			if (patron.drystreak) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return dryStreakCommand(
					patron.drystreak.source,
					patron.drystreak.item,
					Boolean(patron.drystreak.ironman)
				);
			}
			if (patron.mostdrops) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return mostDrops(user, patron.mostdrops.item, String(patron.mostdrops.filter));
			}
			if (patron.sacrificed_bank) {
				if (user.perkTier() < PerkTier.Two) return patronMsg(PerkTier.Two);
				const sacBank = await user.fetchStats();
				const image = await makeBankImage({
					bank: new Bank(sacBank.sacrificed_bank as ItemBank),
					title: 'Your Sacrificed Items'
				});
				return {
					files: [image.file]
				};
			}
			if (patron.cl_bank) {
				if (user.perkTier() < PerkTier.Two) return patronMsg(PerkTier.Two);
				const clBank = user.cl;
				if (patron.cl_bank.format === 'json') {
					const json = JSON.stringify(clBank);
					return {
						files: [{ attachment: Buffer.from(json), name: 'clbank.json' }]
					};
				}
				const image = await makeBankImage({
					bank: clBank,
					title: 'Your Entire Collection Log'
				});
				return {
					files: [image.file]
				};
			}
			if (patron.minion_stats) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return minionStats(user.user);
			}
			if (patron.activity_export) {
				if (user.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				const promise = activityExport(user.user);
				await interaction.confirmation(
					'I will send a file containing ALL of your activities, intended for advanced users who want to use the data. Anyone in this channel will be able to see and download the file, are you sure you want to do this?'
				);
				const result = await promise;
				return result;
			}
		}
		if (options.user) {
			if (options.user.mypets) {
				const b = new Bank();
				for (const [pet, qty] of Object.entries(user.user.pets as ItemBank)) {
					const petObj = pets.find(i => i.id === Number(pet));
					if (!petObj) continue;
					b.add(petObj.name, qty);
				}
				return {
					files: [
						(await makeBankImage({ bank: b, title: `Your Chat Pets (${b.length}/${pets.length})` })).file
					]
				};
			}
		}

		if (options.stash_units) {
			if (options.stash_units.view) {
				return stashUnitViewCommand(user, options.stash_units.view.unit, options.stash_units.view.not_filled);
			}
			if (options.stash_units.build_all) return stashUnitBuildAllCommand(user);
			if (options.stash_units.fill_all) return stashUnitFillAllCommand(user);
			if (options.stash_units.unfill) {
				return stashUnitUnfillCommand(user, options.stash_units.unfill.unit);
			}
		}
		if (options.user?.temp_cl) {
			if (options.user.temp_cl.reset === true) {
				await interaction.confirmation('Are you sure you want to reset your temporary CL?');
				await user.update({
					temp_cl: {},
					last_temp_cl_reset: new Date()
				});
				return 'Reset your temporary CL.';
			}
			const lastReset = await prisma.user.findUnique({
				where: {
					id: user.id
				},
				select: {
					last_temp_cl_reset: true
				}
			});
			return `You can view your temporary CL using, for example, \`/cl name:PvM type:Temp\`.
You last reset your temporary CL: ${
				lastReset?.last_temp_cl_reset
					? `<t:${Math.floor((lastReset?.last_temp_cl_reset?.getTime() ?? 1) / 1000)}>`
					: 'Never'
			}`;
		}
		if (options.user?.checkmasses) {
			return checkMassesCommand(guildID);
		}
		return 'Invalid command!';
	}
});
