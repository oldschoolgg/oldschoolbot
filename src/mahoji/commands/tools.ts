import { type CommandResponse, type CommandRunOptions, PerkTier, asyncGzip } from '@oldschoolgg/toolkit';
import type { Activity, User } from '@prisma/client';
import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { Bank } from 'oldschooljs';
import type { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import { ToBUniqueTable } from 'oldschooljs/dist/simulation/misc/TheatreOfBlood';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { allStashUnitsFlat } from '../../lib/clues/stashUnits';
import {
	anglerOutfit,
	evilChickenOutfit,
	gnomeRestaurantCL,
	guardiansOfTheRiftCL,
	shadesOfMorttonCL,
	toaCL
} from '../../lib/data/CollectionsExport';
import { NightmareMonster } from '../../lib/minions/data/killableMonsters';
import type { MinigameName } from '../../lib/settings/minigames';
import { Minigames } from '../../lib/settings/minigames';
import { convertStoredActivityToFlatActivity } from '../../lib/settings/prisma';
import { formatDuration, isGroupActivity, isNexActivity, isRaidsActivity, isTOBOrTOAActivity } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { repairBrokenItemsFromUser } from '../../lib/util/repairBrokenItems';
import resolveItems from '../../lib/util/resolveItems';
import {
	getParsedStashUnits,
	stashUnitBuildAllCommand,
	stashUnitFillAllCommand,
	stashUnitUnfillCommand,
	stashUnitViewCommand
} from '../lib/abstracted_commands/stashUnitsCommand';
import { dataPoints } from '../lib/abstracted_commands/statCommand';
import type { OSBMahojiCommand } from '../lib/util';
import { patronMsg } from '../mahojiSettings';

function dateDiff(first: number, second: number) {
	return Math.round((second - first) / (1000 * 60 * 60 * 24));
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
		run: async ({ item }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT user_id::text AS id, COUNT(1) as val
FROM activity WHERE
user_id IN (SELECT id::bigint FROM users WHERE "collectionLogBank"->'${item.id}' IS NULL
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
		run: async ({ item }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; points: number; raids_total_kc: number }[]>(`SELECT "users"."id", "user_stats".total_cox_points AS points, "minigames"."raids" + "minigames"."raids_challenge_mode" AS raids_total_kc
FROM user_stats
INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text
INNER JOIN "minigames" on "minigames"."user_id" = "user_stats"."user_id"::text
WHERE "collectionLogBank"->>'${item.id}' IS NULL

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
		run: async ({ item }) => {
			const result = await prisma.$queryRawUnsafe<
				{ id: string; val: number }[]
			>(`SELECT "id", ("monster_scores"->>'${NightmareMonster.id}')::int AS val
		   FROM users
		   INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
		   WHERE "collectionLogBank"->>'${item.id}' IS NULL
		   AND "monster_scores"->>'${NightmareMonster.id}' IS NOT NULL
		  
		   ORDER BY ("monster_scores"->>'${NightmareMonster.id}')::int DESC
		   LIMIT 10;`);
			return result;
		},

		format: num => `${num.toLocaleString()} KC`
	},
	{
		name: 'Barbarian Assault (Pet penance queen)',
		items: resolveItems(['Pet penance queen']),
		run: async ({ item }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT "id", high_gambles AS val
				   FROM users
				   INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
				   WHERE "collectionLogBank"->>'${item.id}' IS NULL
				   AND high_gambles > 0
				  
				   ORDER BY high_gambles DESC
				   LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} Gambles`
	},
	{
		name: 'Guardians of the Rift',
		items: guardiansOfTheRiftCL,
		run: async ({ item }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT users.id, gotr_rift_searches AS val
            FROM users
            INNER JOIN "user_stats" "userstats" on "userstats"."user_id"::text = "users"."id"
            WHERE "collectionLogBank"->>'${item.id}' IS NULL
            
            ORDER BY gotr_rift_searches DESC
            LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} Rift Searches`
	},
	{
		name: 'Evil Chicken Outfit',
		items: evilChickenOutfit,
		run: async ({ item }) => {
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
		run: async () => {
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
		run: async ({ item }) => {
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
		run: async ({ item }) => {
			const result = await prisma.$queryRawUnsafe<{ id: string; slayer_superior_count: number }[]>(`SELECT id, slayer_superior_count
FROM users
INNER JOIN "user_stats" ON "user_stats"."user_id"::text = "users"."id"
WHERE "collectionLogBank"->>'${item.id}' IS NULL

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
		run: async ({ item }) => {
			const minigameObj = Minigames.find(i => i.column === minigame.key)!;
			const result = await prisma.$queryRawUnsafe<{ id: string; val: number }[]>(`SELECT users.id, "minigame"."${
				minigameObj.column
			}" AS val
FROM users
INNER JOIN "minigames" "minigame" on "minigame"."user_id" = "users"."id"::text
WHERE "collectionLogBank"->>'${item.id}' IS NULL

ORDER BY "minigame"."${minigameObj.column}" DESC
LIMIT 10;`);
			return result;
		},
		format: num => `${num.toLocaleString()} KC`
	});
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
		guildID
	}: CommandRunOptions<{
		patron?: {
			sacrificed_bank?: {};
			cl_bank?: {
				format?: 'bank' | 'json';
			};
			minion_stats?: {};
			activity_export?: {};
			stats?: { stat: string };
			doubleloot?: {};
		};
		user?: { checkmasses?: {}; fixbank?: {} };
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

		if (options.user?.checkmasses) {
			return checkMassesCommand(guildID);
		}
		if (options.user?.fixbank) {
			return (await repairBrokenItemsFromUser(mahojiUser))[0];
		}
		return 'Invalid command!';
	}
};
