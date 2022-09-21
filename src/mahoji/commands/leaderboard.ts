import { Embed } from '@discordjs/builders';
import { chunk } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions, MessageFlags } from 'mahoji';

import { badges, Emoji, usernameCache } from '../../lib/constants';
import { allClNames, getCollectionItems } from '../../lib/data/Collections';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { allOpenables } from '../../lib/openables';
import { Minigames } from '../../lib/settings/minigames';
import { prisma } from '../../lib/settings/prisma';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	channelIsSendable,
	convertXPtoLVL,
	formatDuration,
	getUsername,
	makePaginatedMessage,
	stringMatches,
	stripEmojis,
	toTitleCase
} from '../../lib/util';
import { sendToChannelID } from '../../lib/util/webhook';
import { OSBMahojiCommand } from '../lib/util';

const LB_PAGE_SIZE = 10;

function lbMsg(str: string, ironmanOnly?: boolean) {
	return {
		content: `Showing you the ${str} leaderboard, click the buttons to change pages.${
			ironmanOnly ? ' Showing only ironmen.' : ''
		}`,
		flags: MessageFlags.Ephemeral
	};
}

export function getPos(page: number, record: number) {
	return `${page * LB_PAGE_SIZE + 1 + record}. `;
}

export async function doMenu(user: MUser, channelID: string, pages: string[], title: string) {
	if (pages.length === 0) {
		sendToChannelID(channelID.toString(), { content: 'Nobody is on this leaderboard.' });
	}
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return;

	makePaginatedMessage(
		channel,
		pages.map(p => ({ embeds: [new Embed().setTitle(title).setDescription(p)] })),
		user.id
	);
}

async function kcLb(user: MUser, channelID: string, name: string, ironmanOnly: boolean) {
	const monster = effectiveMonsters.find(mon => [mon.name, ...mon.aliases].some(alias => stringMatches(alias, name)));
	if (!monster) return "That's not a valid monster!";
	let list = await prisma.$queryRawUnsafe<{ id: string; kc: number }[]>(
		`SELECT id, CAST("monsterScores"->>'${monster.id}' AS INTEGER) as kc
		 FROM users
		 WHERE CAST("monsterScores"->>'${monster.id}' AS INTEGER) > 5
		 ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
		 ORDER BY kc DESC
		 LIMIT 2000;`
	);

	doMenu(
		user,
		channelID,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((user, j) => `${getPos(i, j)}**${getUsername(user.id)}:** ${user.kc.toLocaleString()}`)
				.join('\n')
		),
		`KC Leaderboard for ${monster.name}`
	);

	return lbMsg(`${monster.name} KC `, ironmanOnly);
}

async function farmingContractLb(user: MUser, channelID: string, ironmanOnly: boolean) {
	let list = await prisma.$queryRawUnsafe<{ id: string; count: number }[]>(
		`SELECT id, CAST("minion.farmingContract"->>'contractsCompleted' AS INTEGER) as count
		 FROM users
		 WHERE "minion.farmingContract" is not null and CAST ("minion.farmingContract"->>'contractsCompleted' AS INTEGER) >= 1
		 ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
		 ORDER BY count DESC
		 LIMIT 2000;`
	);

	doMenu(
		user,
		channelID,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => {
					return `${getPos(i, j)}**${getUsername(id)}:** ${count.toLocaleString()}`;
				})
				.join('\n')
		),
		'Farming Contracts Leaderboard'
	);
	return lbMsg('Farming Contract');
}

async function infernoLb() {
	const res = await prisma.$queryRawUnsafe<{ user_id: string; duration: number }[]>(`SELECT user_id, duration
FROM activity
WHERE type = 'Inferno'
AND data->>'deathTime' IS NULL
AND completed = true
ORDER BY duration ASC
LIMIT 10;`);

	if (res.length === 0) {
		return 'No results.';
	}

	return `**Inferno Records**\n\n${res
		.map((e, i) => `${i + 1}. **${getUsername(e.user_id)}:** ${formatDuration(e.duration)}`)
		.join('\n')}`;
}

async function sacrificeLb(user: MUser, channelID: string, type: 'value' | 'unique', ironmanOnly: boolean) {
	if (type === 'value') {
		const list = (
			await prisma.$queryRawUnsafe<{ id: string; amount: number }[]>(
				`SELECT "id", "sacrificedValue"
					   FROM users
					   WHERE "sacrificedValue" > 0
					   ${ironmanOnly ? 'AND "minion.ironman" = true' : ''}
					   ORDER BY "sacrificedValue"
					   DESC LIMIT 2000;`
			)
		).map((res: any) => ({ ...res, amount: parseInt(res.sacrificedValue) }));

		doMenu(
			user,
			channelID,
			chunk(list, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map(({ id, amount }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${amount.toLocaleString()} GP `)
					.join('\n')
			),
			'Sacrifice Leaderboard'
		);

		return lbMsg('Most Value Sacrificed');
	}

	const mostUniques: { id: string; sacbanklength: number }[] =
		await prisma.$queryRaw`SELECT u.id, u.sacbanklength FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("sacrificedBank")) sacbanklength, id FROM users
) u
ORDER BY u.sacbanklength DESC LIMIT 10;`;
	doMenu(
		user,
		channelID,
		chunk(mostUniques, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, sacbanklength }, j) =>
						`${getPos(i, j)}**${getUsername(id)}:** ${sacbanklength.toLocaleString()} Unique Sac's`
				)
				.join('\n')
		),
		'Unique Sacrifice Leaderboard'
	);
	return lbMsg('Unique Sacrifice');
}

async function minigamesLb(user: MUser, channelID: string, name: string) {
	const minigame = Minigames.find(m => stringMatches(m.name, name) || m.aliases.some(a => stringMatches(a, name)));
	if (!minigame) {
		return `That's not a valid minigame. Valid minigames are: ${Minigames.map(m => m.name).join(', ')}.`;
	}

	const res = await prisma.minigame.findMany({
		where: {
			[minigame.column]: {
				gt: minigame.column === 'champions_challenge' ? 1 : 10
			}
		},
		orderBy: {
			[minigame.column]: 'desc'
		},
		take: 10
	});

	doMenu(
		user,
		channelID,
		chunk(res, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((u, j) => `${getPos(i, j)}**${getUsername(u.user_id)}:** ${u[minigame.column].toLocaleString()}`)
				.join('\n')
		),
		`${minigame.name} Leaderboard`
	);
	return lbMsg(`${minigame.name} Leaderboard`);
}

async function clLb(user: MUser, channelID: string, inputType: string, ironmenOnly: boolean) {
	const items = getCollectionItems(inputType, false);
	if (!items || items.length === 0) {
		return "That's not a valid collection log category. Check +cl for all possible logs.";
	}
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(`
SELECT id, (cardinality(u.cl_keys) - u.inverse_length) as qty
				  FROM (
  SELECT array(SELECT * FROM jsonb_object_keys("collectionLogBank")) "cl_keys",
  				id, "collectionLogBank",
			    cardinality(array(SELECT * FROM jsonb_object_keys("collectionLogBank" - array[${items
					.map(i => `'${i}'`)
					.join(', ')}]))) "inverse_length"
  FROM users
  WHERE "collectionLogBank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
  ${ironmenOnly ? 'AND "minion.ironman" = true' : ''}
) u
ORDER BY qty DESC
LIMIT 50;
`)
	).filter(i => i.qty > 0);

	inputType = toTitleCase(inputType.toLowerCase());
	doMenu(
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList.map(({ id, qty }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${qty.toLocaleString()}`).join('\n')
		),
		`${inputType} Collection Log Leaderboard (${items.length} slots)`
	);
	return lbMsg(`${inputType} Collection Log Leaderboard`, ironmenOnly);
}

async function creaturesLb(user: MUser, channelID: string, creatureName: string) {
	const creature = Hunter.Creatures.find(creature =>
		creature.aliases.some(
			alias => stringMatches(alias, creatureName) || stringMatches(alias.split(' ')[0], creatureName)
		)
	);

	if (!creature) return 'Thats not a valid creature.';

	const query = `SELECT id, ("creatureScores"->>'${creature.id}')::int as count
				   FROM users WHERE "creatureScores"->>'${creature.id}' IS NOT NULL
				   ORDER BY count DESC LIMIT 50;`;
	const data: { id: string; count: number }[] = await prisma.$queryRawUnsafe(query);
	doMenu(
		user,
		channelID,
		chunk(data, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${count.toLocaleString()}`)
				.join('\n')
		),
		`Catch Leaderboard for ${creature.name}`
	);
	return lbMsg(`${creature.name} Catch Leaderboard`);
}

async function lapsLb(user: MUser, channelID: string, courseName: string) {
	const course = Agility.Courses.find(course => course.aliases.some(alias => stringMatches(alias, courseName)));

	if (!course) return 'Thats not a valid agility course.';

	const data: { id: string; count: number }[] = await prisma.$queryRawUnsafe(
		`SELECT id, ("lapsScores"->>'${course.id}')::int as count
			 FROM users
			 WHERE "lapsScores"->>'${course.id}' IS NOT NULL
			 ORDER BY count DESC LIMIT 50;`
	);
	doMenu(
		user,
		channelID,
		chunk(data, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, count }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${count.toLocaleString()}`)
				.join('\n')
		),
		`${course.name} Laps Leaderboard`
	);
	return lbMsg(`${course.name} Laps`);
}

async function openLb(user: MUser, channelID: string, name: string, ironmanOnly: boolean) {
	name = name.trim();

	let entityID = -1;
	let key = '';
	let openableName = '';

	const openable = !name
		? undefined
		: allOpenables.find(
				item => stringMatches(item.name, name) || item.name.toLowerCase().includes(name.toLowerCase())
		  );
	if (openable) {
		entityID = openable.id;
		key = 'openable_scores';
		openableName = openable.name;
	}

	if (entityID === -1) {
		return `That's not a valid openable item! You can check: ${allOpenables.map(i => i.name).join(', ')}.`;
	}

	let list = await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(
		`SELECT id, ("${key}"->>'${entityID}')::int as qty FROM users
			WHERE ("${key}"->>'${entityID}')::int > 3
			${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
			ORDER BY qty DESC LIMIT 30;`
	);

	doMenu(
		user,
		channelID,
		chunk(list, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((user, j) => `${getPos(i, j)}**${getUsername(user.id)}:** ${user.qty.toLocaleString()}`)
				.join('\n')
		),
		`Open Leaderboard for ${openableName}`
	);
	return lbMsg(`${openableName} Opening`);
}

async function gpLb(user: MUser, channelID: string, ironmanOnly: boolean) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; GP: number }[]>(
			`SELECT "id", "GP"
					   FROM users
					   WHERE "GP" > 1000000
					   ${ironmanOnly ? ' AND "minion.ironman" = true ' : ''}
					   ORDER BY "GP" DESC
					   LIMIT 500;`
		)
	).map(res => ({ ...res, GP: Number(res.GP) }));

	doMenu(
		user,
		channelID,
		chunk(users, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(({ id, GP }, j) => `${getPos(i, j)}**${getUsername(id)}:** ${GP.toLocaleString()} GP`)
				.join('\n')
		),
		'GP Leaderboard'
	);
	return lbMsg('GP Leaderboard', ironmanOnly);
}

async function skillsLb(
	user: MUser,
	channelID: string,
	inputSkill: string,
	type: 'xp' | 'level',
	ironmanOnly: boolean
) {
	let res = [];
	let overallUsers: Record<string, any>[] = [];

	const skillsVals = Object.values(Skills);

	const skill = skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, inputSkill)));

	if (inputSkill === 'overall') {
		const query = `SELECT
								u.id,
								${skillsVals.map(s => `"skills.${s.id}"`)},
								${skillsVals.map(s => `"skills.${s.id}"::int8`).join(' + ')} as totalxp,
								u."minion.ironman"
							FROM
								users u
							${ironmanOnly ? ' WHERE "minion.ironman" = true ' : ''}
							ORDER BY totalxp DESC
							LIMIT 2000;`;
		res = await prisma.$queryRawUnsafe<Record<string, any>[]>(query);
		overallUsers = res.map(user => {
			let totalLevel = 0;
			for (const skill of skillsVals) {
				totalLevel += convertXPtoLVL(Number(user[`skills.${skill.id}`]) as any);
			}
			return {
				id: user.id,
				totalLevel,
				ironman: user['minion.ironman'],
				totalXP: Number(user.totalxp!)
			};
		});
		if (type !== 'xp') {
			overallUsers.sort((a, b) => b.totalLevel - a.totalLevel);
		}
		overallUsers.slice(0, 100);
	} else {
		if (!skill) return "That's not a valid skill.";

		const query = `SELECT
								u."skills.${skill.id}", u.id, u."minion.ironman"
							FROM
								users u
							${ironmanOnly ? ' WHERE "minion.ironman" = true ' : ''}
							ORDER BY
								1 DESC
							LIMIT 2000;`;
		res = await prisma.$queryRawUnsafe<Record<string, any>[]>(query);
	}

	if (inputSkill === 'overall') {
		doMenu(
			user,
			channelID,
			chunk(overallUsers, LB_PAGE_SIZE).map((subList, i) =>
				subList
					.map((obj, j) => {
						return `${getPos(i, j)}**${getUsername(
							obj.id
						)}:** ${obj.totalLevel.toLocaleString()} (${obj.totalXP.toLocaleString()} XP)`;
					})
					.join('\n')
			),
			`Overall ${type} Leaderboard`
		);
		return lbMsg(`Overall ${type}`);
	}

	doMenu(
		user,
		channelID,
		chunk(res, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map((obj, j) => {
					const objKey = `skills.${skill?.id}`;
					const skillXP = Number(obj[objKey] ?? 0);

					return `${getPos(i, j)}**${getUsername(obj.id)}:** ${skillXP.toLocaleString()} XP (${convertXPtoLVL(
						skillXP
					)})`;
				})
				.join('\n')
		),
		`${skill ? toTitleCase(skill.id) : 'Overall'} Leaderboard`
	);
	return lbMsg(`Overall ${skill!.name} ${type}`);
}

export async function cacheUsernames() {
	const allNewUsers = await prisma.newUser.findMany({
		where: {
			username: {
				not: null
			}
		},
		select: {
			id: true,
			username: true
		}
	});

	const arrayOfIronmenAndBadges: { badges: number[]; id: string; ironman: boolean }[] = await prisma.$queryRawUnsafe(
		'SELECT "badges", "id", "minion.ironman" as "ironman" FROM users WHERE ARRAY_LENGTH(badges, 1) > 0 OR "minion.ironman" = true;'
	);

	for (const user of allNewUsers) {
		const badgeUser = arrayOfIronmenAndBadges.find(i => i.id === user.id);
		let name = stripEmojis(user.username!);
		if (badgeUser) {
			const rawBadges = badgeUser.badges.map(num => badges[num]);
			if (badgeUser.ironman) {
				rawBadges.push(Emoji.Ironman);
			}
			name = `${rawBadges.join(' ')} ${name}`;
		}
		usernameCache.set(user.id, name);
	}
}

const ironmanOnlyOption = {
	type: ApplicationCommandOptionType.Boolean,
	name: 'ironmen_only',
	description: 'Only include ironmen.',
	required: false
} as const;

export const leaderboardCommand: OSBMahojiCommand = {
	name: 'lb',
	description: 'Simulate killing monsters.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'kc',
			description: 'Check the kc leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'monster',
					description: 'The monster you want to check the leaderboard of.',
					required: true,
					autocomplete: async value => {
						return effectiveMonsters
							.filter(m => (!value ? true : m.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'farming_contracts',
			description: 'Check the farming contracts leaderboard.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'inferno',
			description: 'Check the inferno leaderboard.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sacrifice',
			description: 'Check the sacrifice leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The particular sacrifice leaderboard you want to check.',
					required: true,
					choices: [
						{ name: 'Most Value Sacrificed', value: 'value' },
						{ name: 'Unique Items Sacrificed', value: 'unique' }
					]
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'minigames',
			description: 'Check the minigames leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'minigame',
					description: 'The particular minigame leaderboard you want to check.',
					required: true,
					autocomplete: async (value: string) => {
						return Minigames.filter(i =>
							!value
								? true
								: [i.name, ...i.aliases].some(str => str.toLowerCase().includes(value.toLowerCase()))
						).map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hunter_catches',
			description: 'Check the hunter catch leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'creature',
					description: 'The particular creature you want to check.',
					required: true,
					autocomplete: async (value: string) => {
						return Hunter.Creatures.filter(i =>
							!value
								? true
								: [i.name, ...i.aliases].some(str => str.toLowerCase().includes(value.toLowerCase()))
						).map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'agility_laps',
			description: 'Check the agility laps leaderboard.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'course',
					description: 'The particular creature you want to check.',
					required: true,
					autocomplete: async (value: string) => {
						return Agility.Courses.filter(i =>
							!value
								? true
								: [i.name, ...i.aliases].some(str => str.toLowerCase().includes(value.toLowerCase()))
						).map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'gp',
			description: 'Check the GP leaderboard.',
			options: [ironmanOnlyOption]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'skills',
			description: 'Check the skills/xp/levels leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'skill',
					description: 'The skill you want to select.',
					required: true,
					choices: [
						{ name: 'Overall', value: 'overall' },
						...Object.values(SkillsEnum).map(i => ({ name: toTitleCase(i), value: i }))
					]
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'xp',
					description: 'Show XP instead of levels.',
					required: false
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'opens',
			description: 'Check the opening leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'openable',
					description: 'The openable you want to select.',
					required: true,
					autocomplete: async (value: string) => {
						return allOpenables
							.filter(i =>
								!value
									? true
									: [i.name, ...i.aliases].some(str =>
											str.toLowerCase().includes(value.toLowerCase())
									  )
							)
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				ironmanOnlyOption
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cl',
			description: 'Check the collection log leaderboards.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'cl',
					description: 'The cl you want to select.',
					required: true,
					autocomplete: async value => {
						return ['overall', ...allClNames.map(i => i)]
							.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: toTitleCase(i), value: i }));
					}
				},
				ironmanOnlyOption
			]
		}
	],
	run: async ({
		channelID,
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		kc?: { monster: string; ironmen_only?: boolean };
		farming_contracts?: { ironmen_only?: boolean };
		inferno?: {};
		sacrifice?: { type: 'value' | 'unique'; ironmen_only?: boolean };
		minigames?: { minigame: string; ironmen_only?: boolean };
		hunter_catches?: { creature: string };
		agility_laps?: { course: string };
		gp?: { ironmen_only?: boolean };
		skills?: { skill: string; ironmen_only?: boolean; xp?: boolean };
		opens?: { openable: string; ironmen_only?: boolean };
		cl?: { cl: string; ironmen_only?: boolean };
	}>) => {
		await interaction.deferReply();
		const user = await mUserFetch(userID);
		const {
			opens,
			kc,
			farming_contracts,
			inferno,
			sacrifice,
			minigames,
			hunter_catches,
			agility_laps,
			gp,
			skills,
			cl
		} = options;
		if (kc) return kcLb(user, channelID, kc.monster, Boolean(kc.ironmen_only));
		if (farming_contracts) return farmingContractLb(user, channelID, Boolean(farming_contracts.ironmen_only));
		if (inferno) return infernoLb();
		if (sacrifice) return sacrificeLb(user, channelID, sacrifice.type, Boolean(sacrifice.ironmen_only));
		if (minigames) return minigamesLb(user, channelID, minigames.minigame);
		if (hunter_catches) return creaturesLb(user, channelID, hunter_catches.creature);
		if (agility_laps) return lapsLb(user, channelID, agility_laps.course);
		if (gp) return gpLb(user, channelID, Boolean(gp.ironmen_only));
		if (skills) {
			return skillsLb(user, channelID, skills.skill, skills.xp ? 'xp' : 'level', Boolean(skills.ironmen_only));
		}
		if (opens) return openLb(user, channelID, opens.openable, Boolean(opens.ironmen_only));
		if (cl) return clLb(user, channelID, cl.cl, Boolean(cl.ironmen_only));
		return 'Invalid input.';
	}
};
