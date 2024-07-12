import {
	type CommandResponse,
	type CommandRunOptions,
	type MahojiUserOption,
	PerkTier,
	asyncGzip
} from '@oldschoolgg/toolkit';
import type { Activity, User } from '@prisma/client';
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, userMention } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import type { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { ToBUniqueTable } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';
import { ADMIN_IDS, OWNER_IDS, production } from '../../config.example';
import { giveBoxResetTime, isPrimaryPatron, mahojiUserSettingsUpdate, spawnLampResetTime } from '../../lib/MUser';
import { MysteryBoxes, spookyTable } from '../../lib/bsoOpenables';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { allStashUnitsFlat } from '../../lib/clues/stashUnits';
import { BitField, Channel, Emoji } from '../../lib/constants';
import { allCLItems, allDroppedItems } from '../../lib/data/Collections';
import {
	anglerOutfit,
	evilChickenOutfit,
	gnomeRestaurantCL,
	guardiansOfTheRiftCL,
	shadesOfMorttonCL,
	toaCL
} from '../../lib/data/CollectionsExport';
import pets from '../../lib/data/pets';
import { addToDoubleLootTimer } from '../../lib/doubleLoot';
import killableMonsters, { effectiveMonsters, NightmareMonster } from '../../lib/minions/data/killableMonsters';
import { getUsersPerkTier } from '../../lib/perkTiers';
import type { MinigameName } from '../../lib/settings/minigames';
import { Minigames } from '../../lib/settings/minigames';
import { convertStoredActivityToFlatActivity } from '../../lib/settings/prisma';
import Skills from '../../lib/skilling/skills';
import {
	formatDuration,
	generateXPLevelQuestion,
	getUsername,
	isGroupActivity,
	isNexActivity,
	isRaidsActivity,
	isTOBOrTOAActivity,
	itemID,
	itemNameFromID,
	roll,
	stringMatches
} from '../../lib/util';
import { getItem } from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { repairBrokenItemsFromUser } from '../../lib/util/repairBrokenItems';
import resolveItems from '../../lib/util/resolveItems';
import { LampTable } from '../../lib/xpLamps';
import { Cooldowns } from '../lib/Cooldowns';
import {
	getParsedStashUnits,
	stashUnitBuildAllCommand,
	stashUnitFillAllCommand,
	stashUnitUnfillCommand,
	stashUnitViewCommand
} from '../lib/abstracted_commands/stashUnitsCommand';
import { dataPoints, statsCommand } from '../lib/abstracted_commands/statCommand';
import { buttonUserPicker } from '../lib/buttonUserPicker';
import { itemOption, monsterOption, skillOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { patronMsg } from '../mahojiSettings';

const INTERVAL_DAY = 'day';
const INTERVAL_WEEK = 'week';
const INTERVAL_MONTH = 'month';
const skillsVals = Object.values(Skills);

function dateDiff(first: number, second: number) {
	return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

async function giveBox(mahojiUser: MUser, _recipient: MahojiUserOption) {
	if (!_recipient) return 'You need to specify a user to give a box to.';
	const recipient = await mUserFetch(_recipient.user.id);
	if (!isPrimaryPatron(mahojiUser)) {
		return 'Shared-perk accounts cannot use this.';
	}

	const currentDate = Date.now();
	const lastDate = Number(mahojiUser.user.lastGivenBoxx);
	const difference = currentDate - lastDate;
	const isOwner = OWNER_IDS.includes(mahojiUser.id);

	// If no user or not an owner and can not send one yet, show time till next box.
	if (difference < giveBoxResetTime && !isOwner) {
		return `You can give another box in ${formatDuration(giveBoxResetTime - difference)}`;
	}

	if (recipient.id === mahojiUser.id) return "You can't give boxes to yourself!";
	if (recipient.isIronman) return "You can't give boxes to ironmen!";
	await mahojiUserSettingsUpdate(mahojiUser.id, {
		lastGivenBoxx: currentDate
	});

	const boxToReceive = new Bank().add(roll(10) ? MysteryBoxes.roll() : itemID('Mystery box'));

	await recipient.addItemsToBank({ items: boxToReceive, collectionLog: false });

	return `Gave **${boxToReceive}** to ${recipient}.`;
}

const whereInMassClause = (id: string) =>
	`OR (group_activity = true AND data::jsonb ? 'users' AND data->>'users'::text LIKE '%${id}%')`;

async function activityExport(user: User): CommandResponse {
	const allActivities = await prisma.$queryRawUnsafe<Activity[]>(`SELECT floor(date_part('epoch', start_date)) AS start_date, floor(date_part('epoch', finish_date)) AS finish_date, duration, type, data
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
	let tierFilter = '';
	let title = '';
	let intervalValue = '';

	switch (interval.toLowerCase()) {
		case INTERVAL_DAY:
			intervalValue = 'day';
			break;
		case INTERVAL_WEEK:
			intervalValue = 'week';
			break;
		case INTERVAL_MONTH:
			intervalValue = 'month';
			break;
		default:
			return 'Invalid time interval.';
	}
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
	  AND a.finish_date >= now() - interval '1 ${intervalValue}' AND a.completed = true
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
			res
				.map((i: any) => `${++place}. **${getUsername(i.user_id)}**: ${Number(i.qty).toLocaleString()}`)
				.join('\n')
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
	let intervalValue = '';

	switch (interval.toLowerCase()) {
		case INTERVAL_DAY:
			intervalValue = 'day';
			break;
		case INTERVAL_WEEK:
			intervalValue = 'week';
			break;
		case INTERVAL_MONTH:
			intervalValue = 'month';
			break;
		default:
			return 'Invalid time interval.';
	}

	const skillObj = skill
		? skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, skill)))
		: undefined;

	const xpRecords = await executeXPGainsQuery(intervalValue, skillObj?.id, Boolean(ironmanOnly));

	if (xpRecords.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new EmbedBuilder()
		.setTitle(`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`)
		.setDescription(
			xpRecords
				.map(
					record =>
						`${++place}. **${getUsername(record.user)}**: ${Number(record.total_xp).toLocaleString()} XP`
				)
				.join('\n')
		);

	return { embeds: [embed.data] };
}

async function kcGains(interval: string, monsterName: string, ironmanOnly?: boolean): CommandResponse {
	let intervalValue = '';

	switch (interval.toLowerCase()) {
		case INTERVAL_DAY:
			intervalValue = 'day';
			break;
		case INTERVAL_WEEK:
			intervalValue = 'week';
			break;
		case INTERVAL_MONTH:
			intervalValue = 'month';
			break;
		default:
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
    AND a.finish_date >= now() - interval '1 ${intervalValue}'  -- Corrected interval usage
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
			res
				.map((i: any) => `${++place}. **${getUsername(i.user_id)}**: ${Number(i.qty).toLocaleString()}`)
				.join('\n')
		);

	return { embeds: [embed.data] };
}

export function spawnLampIsReady(user: MUser, channelID: string): [true] | [false, string] {
	if (production && ![Channel.BSOChannel, Channel.General, Channel.BSOGeneral].includes(channelID)) {
		return [false, "You can't use spawnlamp in this channel."];
	}

	const perkTier = getUsersPerkTier(user, true);
	const isPatron = perkTier >= PerkTier.Four || user.bitfield.includes(BitField.HasPermanentSpawnLamp);
	if (!isPatron) {
		return [false, 'You need to be a T3 patron or higher to use this command.'];
	}
	const currentDate = Date.now();
	const lastDate = Number(user.user.lastSpawnLamp);
	const difference = currentDate - lastDate;

	const cooldown = spawnLampResetTime(user);

	if (difference < cooldown) {
		const duration = formatDuration(Date.now() - (lastDate + cooldown));
		return [false, `You can spawn another lamp in ${duration}.`];
	}
	return [true];
}
async function spawnLampCommand(user: MUser, channelID: string): CommandResponse {
	const isAdmin = OWNER_IDS.includes(user.id) || ADMIN_IDS.includes(user.id);
	const [lampIsReady, reason] = isAdmin ? [true, ''] : spawnLampIsReady(user, channelID.toString());
	if (!lampIsReady && reason) return reason;

	await mahojiUserSettingsUpdate(user.id, {
		lastSpawnLamp: Date.now()
	});

	const { answers, question, explainAnswer } = generateXPLevelQuestion();

	const winnerID = await buttonUserPicker({
		channelID,
		str: `<:Huge_lamp:988325171498721290> ${userMention(user.id)} spawned a Lamp: ${question}`,
		ironmenAllowed: false,
		answers,
		creator: user.id,
		creatorGetsTwoGuesses: true
	});
	if (!winnerID) return `Nobody got it. ${explainAnswer}`;
	const winner = await mUserFetch(winnerID);
	const loot = LampTable.roll();
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `${winner} got it, and won **${loot}**! ${explainAnswer}`;
}
async function spawnBoxCommand(user: MUser, channelID: string): CommandResponse {
	const perkTier = getUsersPerkTier(user, true);
	if (perkTier < PerkTier.Four && !user.bitfield.includes(BitField.HasPermanentEventBackgrounds)) {
		return 'You need to be a T3 patron or higher to use this command.';
	}
	if (production && ![Channel.BSOChannel, Channel.General, Channel.BSOGeneral].includes(channelID.toString())) {
		return "You can't use spawnbox in this channel.";
	}
	const isOnCooldown = Cooldowns.get(user.id, 'SPAWN_BOX', Time.Minute * 45);
	if (isOnCooldown !== null) {
		return `This command is on cooldown for you for ${formatDuration(isOnCooldown)}.`;
	}
	const { answers, question, explainAnswer } = generateXPLevelQuestion();

	const winnerID = await buttonUserPicker({
		channelID,
		str: `${Emoji.MysteryBox} ${userMention(user.id)} spawned a Mystery Box: ${question}`,
		ironmenAllowed: false,
		answers,
		creator: user.id
	});
	if (!winnerID) return `Nobody got it. ${explainAnswer}`;
	const winner = await mUserFetch(winnerID);

	const loot = new Bank().add(MysteryBoxes.roll());
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `Congratulations, ${winner}! You received: **${loot}**. ${explainAnswer}`;
}

const clueItemsOnlyDroppedInOneTier = ClueTiers.flatMap(i =>
	i.table.allItems.filter(itemID => ClueTiers.filter(i => i.table.allItems.includes(itemID)).length === 1)
);

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
		items: anglerOutfit
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
		items: toaCL
	},
	{
		name: 'Shades of Morton',
		key: 'shades_of_morton',
		items: shadesOfMorttonCL
	},
	{
		name: 'Baxtorian Bathhouses',
		key: 'bax_baths',
		items: resolveItems(['Inferno adze', 'Flame gloves', 'Ring of fire', 'Phoenix eggling'])
	},
	{
		name: 'Monkey Rumble',
		key: 'monkey_rumble',
		items: resolveItems([
			'Monkey egg',
			'Marimbo statue',
			'Monkey dye',
			'Banana enchantment scroll',
			'Rumble token',
			'Big banana',
			'Monkey crate'
		])
	}
];

interface DrystreakEntity {
	name: string;
	items: number[];
	run: (args: { item: Item; ironmanOnly: boolean }) => Promise<string | { id: string; val: number | string }[]>;
	format: (num: number | string) => string;
}

export const dryStreakEntities: DrystreakEntity[] = [
	{
		name: 'Halloween Mini-Minigames',
		items: resolveItems([
			'Spooky gear frame unlock',
			'Kuro',
			'Spooky cat ears',
			'Pumpkinpole',
			'Gastly ghost cape',
			'Spooky box'
		]),
		run: async ({ item, ironmanOnly }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT user_id::text AS id, COUNT(1) as val
FROM activity WHERE
user_id IN (SELECT id::bigint FROM users WHERE "collectionLogBank"->'${item.id}' IS NULL
${ironmanOnly ? ' AND "minion.ironman" = TRUE' : ''})
AND type = 'HalloweenMiniMinigame' GROUP BY user_id
ORDER BY val DESC LIMIT 10`);
			return result;
		},
		format: num => `${num} Mini-Minigames`
	},
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
			const result = await prisma.$queryRawUnsafe<{ id: string; points: number; raids_total_kc: number }[]>(`SELECT "users"."id", "user_stats".total_cox_points AS points, "minigames"."raids" + "minigames"."raids_challenge_mode" AS raids_total_kc
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
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT users.id, gotr_rift_searches AS val
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
		items: evilChickenOutfit,
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
		name: 'Clue Scrolls',
		items: clueItemsOnlyDroppedInOneTier,
		run: async ({ ironmanOnly, item }) => {
			const clueTierWithItem = ClueTiers.filter(t => t.allItems.includes(item.id));
			if (clueTierWithItem.length !== 1) {
				return 'You can only check items which are dropped by only 1 clue scroll tier.';
			}
			const clueTier = clueTierWithItem[0];
			const result = await prisma.$queryRawUnsafe<
				{ id: string; opens: number }[]
			>(`SELECT id, (openable_scores->>'${clueTier.id}')::int AS opens
FROM users
INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
WHERE "collectionLogBank"->>'${item.id}' IS NULL
AND openable_scores->>'${clueTier.id}' IS NOT NULL
AND (openable_scores->>'${clueTier.id}')::int > 100
${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
ORDER BY opens DESC
LIMIT 10;`);
			return result.map(i => ({
				id: i.id,
				val: `${i.opens} ${clueTierWithItem[0].name} Casket Opens`
			}));
		},
		format: num => `${num.toLocaleString()}`
	},
	{
		name: 'Superior Slayer Creatures',
		items: resolveItems(['Imbued heart', 'Eternal gem']),
		run: async ({ ironmanOnly, item }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; slayer_superior_count: number }[]>(`SELECT id, slayer_superior_count
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

async function dryStreakCommand(monsterName: string, itemName: string, ironmanOnly: boolean) {
	const item = getItem(itemName);
	if (!item) return 'Invalid item.';
	const entity = dryStreakEntities.find(i => stringMatches(i.name, monsterName));
	if (entity) {
		if (!entity.items.includes(item.id)) {
			return `That's not a valid item dropped for this thing, valid items are: ${entity.items
				.map(itemNameFromID)
				.join(', ')}.`;
		}

		const result = await entity.run({ item, ironmanOnly });
		if (result.length === 0) return 'No results found.';
		if (typeof result === 'string') return result;

		return `**Dry Streaks for ${item.name} from ${entity.name}:**\n${result
			.map(({ id, val }) => `${getUsername(id)}: ${entity.format(val || -1)}`)
			.join('\n')}`;
	}

	const mon = effectiveMonsters.find(mon => mon.aliases.some(alias => stringMatches(alias, monsterName)));
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

	return `**Dry Streaks for ${item.name} from ${mon.name}:**\n${result
		.map(({ id, KC }) => `${getUsername(id) as string}: ${Number.parseInt(KC).toLocaleString()}`)
		.join('\n')}`;
}

async function mostDrops(user: MUser, itemName: string, filter: string) {
	const item = getItem(itemName);
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

	return `**Most '${item.name}' received:**\n${result
		.map(
			({ id, qty }) =>
				`${result.length < 10 ? '(Anonymous)' : getUsername(id)}: ${Number.parseInt(qty).toLocaleString()}`
		)
		.join('\n')}`;
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
		.map(convertStoredActivityToFlatActivity)
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
		})
		.sort((a, b) => (a![0] < b![0] ? -1 : a![0] > b![0] ? 1 : 0))
		.map(m => m![1])
		.join('\n');
	return `**Masses in this server:**
${massStr}`.slice(0, 1999);
}

function calcTime(perkTier: PerkTier | 0) {
	for (const [bit, dur] of [
		[PerkTier.Seven, Time.Minute * 90],
		[PerkTier.Six, Time.Minute * 40],
		[PerkTier.Five, Time.Minute * 20]
	] as const) {
		if (perkTier === bit) return dur;
	}
	throw new Error('User is not a Tier 4+ Patron');
}

export const PATRON_DOUBLE_LOOT_COOLDOWN = Time.Day * 31;
async function patronTriggerDoubleLoot(user: MUser) {
	const perkTier = getUsersPerkTier(user);
	if (perkTier < PerkTier.Five) {
		return 'Only T4, T5 or T6 patrons can use this command.';
	}
	if (!isPrimaryPatron(user)) {
		return 'You can only do this from your primary account.';
	}

	const lastTime = user.user.last_patron_double_time_trigger;
	const differenceSinceLastUsage = lastTime ? Date.now() - lastTime.getTime() : null;
	if (differenceSinceLastUsage && differenceSinceLastUsage < PATRON_DOUBLE_LOOT_COOLDOWN) {
		return `This command is still on cooldown, you can use it again in: ${formatDuration(
			PATRON_DOUBLE_LOOT_COOLDOWN - differenceSinceLastUsage
		)}.`;
	}

	const time = calcTime(perkTier);
	await mahojiUserSettingsUpdate(user.id, {
		last_patron_double_time_trigger: new Date()
	});
	await addToDoubleLootTimer(
		time,
		`${userMention(user.id)} used their monthly Tier ${perkTier - 1} double loot time`
	);
	return `Added ${formatDuration(time)} of double loot.`;
}

export const toolsCommand: OSBMahojiCommand = {
	name: 'tools',
	description: 'Various tools and miscellaneous commands.',
	options: [
		{
			name: 'patron',
			description: 'Tools that only patrons can use.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'clue_gains',
					description: "Show's who has the highest clue scroll completions for a given time period.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week', 'month'].map(i => ({ name: i, value: i }))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'The tier of clue scroll.',
							required: false,
							autocomplete: async value => {
								return [...ClueTiers.map(i => ({ name: i.name, value: i }))]
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'kc_gains',
					description: "Show's who has the highest KC gains for a given time period.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week', 'month'].map(i => ({ name: i, value: i }))
						},
						monsterOption,
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'xp_gains',
					description: "Show's who has the highest XP gains for a given time period.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week', 'month'].map(i => ({ name: i, value: i }))
						},
						skillOption,
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'drystreak',
					description: "Show's the biggest drystreaks for certain drops from a certain monster.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'monster',
							description: 'The monster you want to pick.',
							required: true,
							autocomplete: async value => {
								return [
									...dryStreakEntities.map(i => ({ name: i.name, value: i })),
									...effectiveMonsters
								]
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.name }));
							}
						},
						{
							...itemOption(item => [...allCLItems, ...spookyTable.allItems].includes(item.id)),
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'mostdrops',
					description:
						"Show's which players have received the most drops of an item, based on their collection log.",
					options: [
						{
							...itemOption(),
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'filter',
							description: 'Filter by account type.',
							required: false,
							choices: ['Both', 'Irons Only', 'Mains Only'].map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'sacrificed_bank',
					description: 'Shows an image containing all your sacrificed items.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'cl_bank',
					description: 'Shows a bank image containing all items in your collection log.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'format',
							description: 'Bank Image or Json format?',
							required: false,
							choices: ['bank', 'json'].map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'minion_stats',
					description: 'Shows statistics about your minion.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'give_box',
					description: 'Allows you to give a mystery box to a friend.',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user you want to give a box too.',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'spawnlamp',
					description: 'Allows you to spawn a lamp.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'spawnbox',
					description: 'Allows you to spawn a mystery box.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'activity_export',
					description: 'Export all your activities (For advanced users).'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check various stats.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'stat',
							description: 'The stat you want to check',
							autocomplete: async (value: string) => {
								return dataPoints
									.map(i => i.name)
									.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({
										name: i,
										value: i
									}));
							},
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'doubleloot',
					description: 'Add double loot time.'
				}
			]
		},
		{
			name: 'user',
			description: 'Various tools for yourself.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'mypets',
					description: 'See the chat pets you have.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'temp_cl',
					description: 'Manage and view your temporary CL.',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'reset',
							description: 'Reset your temporary CL.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'checkmasses',
					description: 'Check the masses going on in the server.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'fixbank',
					description: 'Fix broken items in your bank/gear/etc.'
				}
			]
		},
		{
			name: 'stash_units',
			description: 'Build and fill your treasure trails S.T.A.S.H units.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'view',
					description: 'View your STASH units.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
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
							type: ApplicationCommandOptionType.Boolean,
							name: 'not_filled',
							description: 'View all STASH units that you have not filled/built.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'build_all',
					description: 'Automatically build all the STASH units that you can.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'fill_all',
					description: 'Automatically fill all the STASH units that you can.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'unfill',
					description: 'Remove the items from a specific stash.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'unit',
							description: 'The specific unit you want to unfill.',
							required: true,
							autocomplete: async (value, user) => {
								return (await getParsedStashUnits(user.id))
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
	run: async ({
		options,
		userID,
		interaction,
		channelID,
		guildID
	}: CommandRunOptions<{
		patron?: {
			clue_gains?: {
				time: 'day' | 'week' | 'month';
				tier?: string;
				ironman?: boolean;
			};
			kc_gains?: {
				time: 'day' | 'week' | 'month';
				monster: string;
				ironman?: boolean;
			};
			xp_gains?: {
				time: 'day' | 'week' | 'month';
				skill?: string;
				ironman?: boolean;
			};
			drystreak?: {
				monster: string;
				item: string;
				ironman?: boolean;
			};
			mostdrops?: {
				item: string;
				filter?: string;
			};
			sacrificed_bank?: {};
			cl_bank?: {
				format?: 'bank' | 'json';
			};
			minion_stats?: {};
			give_box?: {
				user: MahojiUserOption;
			};
			activity_export?: {};
			spawnlamp?: {};
			spawnbox?: {};
			stats?: { stat: string };
			doubleloot?: {};
		};
		user?: { mypets?: {}; temp_cl: { reset?: boolean }; checkmasses?: {}; fixbank?: {} };
		stash_units?: {
			view?: { unit?: string; not_filled?: boolean };
			build_all?: {};
			fill_all?: {};
			unfill?: { unit: string };
		};
	}>) => {
		if (interaction) await deferInteraction(interaction);
		const mahojiUser = await mUserFetch(userID);

		if (options.patron) {
			const { patron } = options;
			if (patron.clue_gains) {
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return clueGains(patron.clue_gains.time, patron.clue_gains.tier, Boolean(patron.clue_gains.ironman));
			}
			if (patron.kc_gains) {
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return kcGains(patron.kc_gains.time, patron.kc_gains.monster, Boolean(patron.kc_gains.ironman));
			}
			if (patron.xp_gains) {
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return xpGains(patron.xp_gains.time, patron.xp_gains.skill, patron.xp_gains.ironman);
			}
			if (patron.drystreak) {
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return dryStreakCommand(
					patron.drystreak.monster,
					patron.drystreak.item,
					Boolean(patron.drystreak.ironman)
				);
			}
			if (patron.mostdrops) {
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return mostDrops(mahojiUser, patron.mostdrops.item, String(patron.mostdrops.filter));
			}
			if (patron.sacrificed_bank) {
				if (mahojiUser.perkTier() < PerkTier.Two) return patronMsg(PerkTier.Two);
				const sacBank = await mahojiUser.fetchStats({ sacrificed_bank: true });
				const image = await makeBankImage({
					bank: new Bank(sacBank.sacrificed_bank as ItemBank),
					title: 'Your Sacrificed Items'
				});
				return {
					files: [image.file]
				};
			}
			if (patron.cl_bank) {
				if (mahojiUser.perkTier() < PerkTier.Two) return patronMsg(PerkTier.Two);
				const clBank = mahojiUser.cl;
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
				await deferInteraction(interaction);
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				return minionStats(mahojiUser.user);
			}
			if (patron.give_box) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Two) return patronMsg(PerkTier.Two);
				return giveBox(mahojiUser, patron.give_box.user);
			}
			if (patron.activity_export) {
				if (mahojiUser.perkTier() < PerkTier.Four) return patronMsg(PerkTier.Four);
				const promise = activityExport(mahojiUser.user);
				await handleMahojiConfirmation(
					interaction,
					'I will send a file containing ALL of your activities, intended for advanced users who want to use the data. Anyone in this channel will be able to see and download the file, are you sure you want to do this?'
				);
				const result = await promise;
				return result;
			}
			if (patron.spawnlamp) {
				return spawnLampCommand(mahojiUser, channelID);
			}
			if (patron.spawnbox) return spawnBoxCommand(mahojiUser, channelID);
			if (patron.stats) {
				return statsCommand(mahojiUser, patron.stats.stat);
			}
			if (patron.doubleloot) {
				return patronTriggerDoubleLoot(mahojiUser);
			}
		}
		if (options.user) {
			if (options.user.mypets) {
				const b = new Bank();
				for (const [pet, qty] of Object.entries(mahojiUser.user.pets as ItemBank)) {
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
				return stashUnitViewCommand(
					mahojiUser.user,
					options.stash_units.view.unit,
					options.stash_units.view.not_filled
				);
			}
			if (options.stash_units.build_all) return stashUnitBuildAllCommand(mahojiUser);
			if (options.stash_units.fill_all) return stashUnitFillAllCommand(mahojiUser, mahojiUser.user);
			if (options.stash_units.unfill) {
				return stashUnitUnfillCommand(mahojiUser, options.stash_units.unfill.unit);
			}
		}
		if (options.user?.temp_cl) {
			if (options.user.temp_cl.reset === true) {
				await handleMahojiConfirmation(
					interaction,
					'Are you sure you want to reset your temporary CL? If you are participating in a Bingo, this will reset your progress.'
				);
				await mahojiUser.update({
					temp_cl: {},
					last_temp_cl_reset: new Date()
				});
				return 'Reset your temporary CL.';
			}
			const lastReset = await prisma.user.findUnique({
				where: {
					id: mahojiUser.id
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
		if (options.user?.fixbank) {
			return (await repairBrokenItemsFromUser(mahojiUser))[0];
		}
		return 'Invalid command!';
	}
};
