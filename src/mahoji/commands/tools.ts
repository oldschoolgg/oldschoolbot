import { Embed, userMention } from '@discordjs/builders';
import { Activity, User } from '@prisma/client';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, Monsters } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { production } from '../../config';
import { MysteryBoxes } from '../../lib/bsoOpenables';
import { BitField, Channel, Emoji, giveBoxResetTime, PerkTier, spawnLampResetTime } from '../../lib/constants';
import { allDroppedItems } from '../../lib/data/Collections';
import pets from '../../lib/data/pets';
import backgroundImages from '../../lib/minions/data/bankBackgrounds';
import ClueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters, { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { dataPoints } from '../../lib/minions/functions/dataCommand';
import { prisma } from '../../lib/settings/prisma';
import Skills from '../../lib/skilling/skills';
import {
	asyncGzip,
	formatDuration,
	generateXPLevelQuestion,
	getUsername,
	itemID,
	roll,
	stringMatches
} from '../../lib/util';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import getUsersPerkTier, { isPrimaryPatron } from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { LampTable } from '../../lib/xpLamps';
import { buttonUserPicker } from '../lib/buttonUserPicker';
import { Cooldowns } from '../lib/Cooldowns';
import { itemOption, monsterOption, skillOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import {
	handleMahojiConfirmation,
	MahojiUserOption,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch,
	patronMsg
} from '../mahojiSettings';

const TimeIntervals = ['day', 'week'] as const;
const skillsVals = Object.values(Skills);

function dateDiff(first: number, second: number) {
	return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

async function giveBox(mahojiUser: User, user: KlasaUser, _recipient: MahojiUserOption) {
	const recipient = await globalClient.fetchUser(_recipient.user.id);
	if (!isPrimaryPatron(user)) {
		return 'Shared-perk accounts cannot use this.';
	}

	const currentDate = Date.now();
	const lastDate = Number(mahojiUser.lastGivenBoxx);
	const difference = currentDate - lastDate;
	const isOwner = globalClient.owners.has(user);

	// If no user or not an owner and can not send one yet, show time till next box.
	if (!user || (difference < giveBoxResetTime && !isOwner)) {
		if (difference >= giveBoxResetTime || isOwner) {
			return 'You can give another box!';
		}
		return `You can give another box in ${formatDuration(giveBoxResetTime - difference)}`;
	}

	if (recipient.id === user.id) return "You can't give boxes to yourself!";
	if (recipient.isIronman) return "You can't give boxes to ironmen!";
	await mahojiUserSettingsUpdate(user.id, {
		lastGivenBoxx: currentDate
	});

	const boxToReceive = new Bank().add(roll(10) ? MysteryBoxes.roll() : itemID('Mystery box'));

	await recipient.addItemsToBank({ items: boxToReceive, collectionLog: false });

	return `Gave **${boxToReceive}** to ${recipient}.`;
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
		attachments: [{ fileName: 'activity-export.txt.gz', buffer: zipped }]
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

async function xpGains(interval: string, skill?: string) {
	if (!TimeIntervals.includes(interval as any)) return 'Invalid time.';
	const skillObj = skill
		? skillsVals.find(_skill => _skill.aliases.some(name => stringMatches(name, skill)))
		: undefined;

	const res: any =
		await prisma.$queryRawUnsafe(`SELECT user_id::text AS user, sum(xp) AS total_xp, max(date) AS lastDate
FROM xp_gains
WHERE date > now() - INTERVAL '1 ${interval.toLowerCase() === 'day' ? 'day' : 'week'}'
${skillObj ? `AND skill = '${skillObj.id}'` : ''}
GROUP BY user_id
ORDER BY total_xp DESC, lastDate ASC
LIMIT 10;`);

	if (res.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${skillObj ? skillObj.name : 'Overall'} XP Gains in the past ${interval}`)
		.setDescription(
			res
				.map((i: any) => `${++place}. **${getUsername(i.user)}**: ${Number(i.total_xp).toLocaleString()} XP`)
				.join('\n')
		);

	return { embeds: [embed] };
}

async function kcGains(user: User, interval: string, monsterName: string): CommandResponse {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	if (!TimeIntervals.includes(interval as any)) return 'Invalid time interval.';
	const monster = killableMonsters.find(
		k => stringMatches(k.name, monsterName) || k.aliases.some(a => stringMatches(a, monsterName))
	);
	if (!monster) {
		return 'Invalid monster.';
	}

	const query = `SELECT user_id AS user, SUM(("data"->>'quantity')::int) AS qty, MAX(finish_date) AS lastDate FROM activity
WHERE type = 'MonsterKilling' AND ("data"->>'monsterID')::int = ${monster.id}
AND finish_date >= now() - interval '${interval === 'day' ? 1 : 7}' day AND completed = true
GROUP BY 1
ORDER BY qty DESC, lastDate ASC
LIMIT 10`;

	const res = await globalClient.query<{ user_id: string; qty: number }[]>(query);

	if (res.length === 0) {
		return 'No results found.';
	}

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${monster.name} KC gains in the past ${interval}`)
		.setDescription(
			res.map((i: any) => `${++place}. **${getUsername(i.user)}**: ${Number(i.qty).toLocaleString()}`).join('\n')
		);

	return { embeds: [embed] };
}

export function spawnLampIsReady(user: User, channelID: string): [true] | [false, string] {
	if (production && ![Channel.BSOChannel, Channel.General, Channel.BSOGeneral].includes(channelID)) {
		return [false, "You can't use spawnlamp in this channel."];
	}

	const perkTier = getUsersPerkTier(user, true);
	const isPatron = perkTier >= PerkTier.Four || user.bitfield.includes(BitField.HasPermanentSpawnLamp);
	if (!isPatron) {
		return [false, 'You need to be a T3 patron or higher to use this command.'];
	}
	const currentDate = Date.now();
	const lastDate = Number(user.lastSpawnLamp);
	const difference = currentDate - lastDate;

	const cooldown = spawnLampResetTime(user);

	if (difference < cooldown) {
		const duration = formatDuration(Date.now() - (lastDate + cooldown));
		return [false, `You can spawn another lamp in ${duration}.`];
	}
	return [true];
}
async function spawnLampCommand(user: User, channelID: bigint): CommandResponse {
	const [lampIsReady, reason] = spawnLampIsReady(user, channelID.toString());
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
		creator: BigInt(user.id)
	});
	if (!winnerID) return `Nobody got it. ${explainAnswer}`;
	const winner = await globalClient.fetchUser(winnerID);
	const loot = LampTable.roll();
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `${winner} got it, and won **${loot}**! ${explainAnswer}`;
}
async function spawnBoxCommand(user: User, channelID: bigint): CommandResponse {
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
		creator: BigInt(user.id)
	});
	if (!winnerID) return `Nobody got it. ${explainAnswer}`;
	const winner = await globalClient.fetchUser(winnerID);

	const loot = new Bank().add(MysteryBoxes.roll());
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `Congratulations, ${winner}! You received: **${loot}**. ${explainAnswer}`;
}

async function dryStreakCommand(user: User, monsterName: string, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const mon = effectiveMonsters.find(mon => mon.aliases.some(alias => stringMatches(alias, monsterName)));
	if (!mon) {
		return "That's not a valid monster or minigame.";
	}

	const item = getOSItem(itemName);

	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	const key = 'monsterScores';
	const { id } = mon;
	const query = `SELECT "id", "${key}"->>'${id}' AS "KC" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NULL AND "${key}"->>'${id}' IS NOT NULL ${ironmanPart} ORDER BY ("${key}"->>'${id}')::int DESC LIMIT 10;`;

	const result = await globalClient.query<
		{
			id: string;
			KC: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	return `**Dry Streaks for ${item.name} from ${mon.name}:**\n${result
		.map(({ id, KC }) => `${getUsername(id) as string}: ${parseInt(KC).toLocaleString()}`)
		.join('\n')}`;
}

async function mostDrops(user: User, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const item = getItem(itemName);
	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	if (!item) return "That's not a valid item.";
	if (!allDroppedItems.includes(item.id) && !user.bitfield.includes(BitField.isModerator)) {
		return "You can't check this item, because it's not on any collection log.";
	}

	const query = `SELECT "id", "collectionLogBank"->>'${item.id}' AS "qty" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NOT NULL ${ironmanPart} ORDER BY ("collectionLogBank"->>'${item.id}')::int DESC LIMIT 10;`;

	const result = await globalClient.query<
		{
			id: string;
			qty: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	return `**Most '${item.name}' received:**\n${result
		.map(
			({ id, qty }) =>
				`${result.length < 10 ? '(Anonymous)' : getUsername(id)}: ${parseInt(qty).toLocaleString()}`
		)
		.join('\n')}`;
}

const statsNames = ['servers', 'minions', 'ironmen', 'sacrificed', 'bankbg', 'monsters', 'clues', 'icons'] as const;
type Stat = typeof statsNames[number];
async function statsCommand(user: User, type: Stat): CommandResponse {
	const cooldown = Cooldowns.get(user.id, 'stats_command', Time.Second * 60);
	if (cooldown !== null) {
		return `This command is on cooldown, you can use it again in ${formatDuration(cooldown)}`;
	}
	const dataPoint = dataPoints.find(dp => stringMatches(dp.name, type));
	if (dataPoint) {
		if (getUsersPerkTier(user) < PerkTier.Four) {
			return 'Sorry, you need to be a Tier 3 Patron to use this command.';
		}
		return dataPoint.run(user);
	}

	switch (type) {
		case 'servers': {
			return `Old School Bot is in ${globalClient.guilds.cache.size} servers.`;
		}
		case 'minions': {
			const result = await prisma.$queryRawUnsafe<any>(
				'SELECT COUNT(*) FROM users WHERE "minion.hasBought" = true;'
			);
			return `There are ${result[0].count.toLocaleString()} minions!`;
		}
		case 'ironmen': {
			const result = await prisma.$queryRawUnsafe<any>(
				'SELECT COUNT(*) FROM users WHERE "minion.ironman" = true;'
			);
			return `There are ${parseInt(result[0].count).toLocaleString()} ironman minions!`;
		}
		case 'icons': {
			const result: { icon: string | null; qty: number }[] = await prisma.$queryRawUnsafe(
				'SELECT "minion.icon" as icon, COUNT(*) as qty FROM users WHERE "minion.icon" is not null group by "minion.icon" order by qty asc;'
			);
			return `**Current minion tiers and their number of users:**\n${Object.values(result)
				.map(row => `${row.icon ?? '<:minion:763743627092164658>'} : ${row.qty}`)
				.join('\n')}`;
		}
		case 'bankbg': {
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
		case 'sacrificed': {
			const result = await prisma.$queryRawUnsafe<any>('SELECT SUM ("sacrificedValue") AS total FROM users;');
			return `There has been ${parseInt(result[0].total).toLocaleString()} GP worth of items sacrificed!`;
		}
		case 'monsters': {
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
		case 'clues': {
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
	}
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
					name: 'kc_gains',
					description: "Show's who has the highest KC gains for a given time period.",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time period.',
							required: true,
							choices: ['day', 'week'].map(i => ({ name: i, value: i }))
						},
						monsterOption
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
							choices: ['day', 'week'].map(i => ({ name: i, value: i }))
						},
						skillOption
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'drystreak',
					description: "Show's the biggest drystreaks for certain drops from a certain monster.",
					options: [
						monsterOption,
						{
							...itemOption(),
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
							type: ApplicationCommandOptionType.Boolean,
							name: 'ironman',
							description: 'Only check ironmen accounts.',
							required: false
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
								return [...statsNames, ...dataPoints.map(i => i.name)]
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
					name: 'mypets',
					description: 'See the chat pets you have.',
					options: []
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction,
		channelID
	}: CommandRunOptions<{
		patron?: {
			kc_gains?: {
				time: 'day' | 'week';
				monster: string;
			};
			xp_gains?: {
				time: 'day' | 'week';
				skill?: string;
			};
			drystreak?: {
				monster: string;
				item: string;
				ironman?: boolean;
			};
			mostdrops?: {
				item: string;
				ironman?: boolean;
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
			stats?: { stat: Stat };
		};
		user?: { mypets?: {} };
	}>) => {
		if (interaction) interaction.deferReply();
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		const klasaUser = await globalClient.fetchUser(userID);

		if (options.patron) {
			const { patron } = options;
			if (patron.kc_gains) {
				return kcGains(mahojiUser, patron.kc_gains.time, patron.kc_gains.monster);
			}
			if (patron.drystreak) {
				return dryStreakCommand(
					mahojiUser,
					patron.drystreak.monster,
					patron.drystreak.item,
					Boolean(patron.drystreak.ironman)
				);
			}
			if (patron.mostdrops) {
				return mostDrops(mahojiUser, patron.mostdrops.item, Boolean(patron.mostdrops.ironman));
			}
			if (patron.sacrificed_bank) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const image = await makeBankImage({
					bank: new Bank(mahojiUser.sacrificedBank as ItemBank),
					title: 'Your Sacrificed Items'
				});
				return {
					attachments: [image.file]
				};
			}
			if (patron.cl_bank) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const clBank = new Bank(mahojiUser.collectionLogBank as ItemBank);
				if (patron.cl_bank.format === 'json') {
					const json = JSON.stringify(clBank);
					return {
						attachments: [{ buffer: Buffer.from(json), fileName: 'clbank.json' }]
					};
				}
				const image = await makeBankImage({
					bank: clBank,
					title: 'Your Entire Collection Log'
				});
				return {
					attachments: [image.file]
				};
			}
			if (patron.xp_gains) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				return xpGains(patron.xp_gains.time, patron.xp_gains.skill);
			}
			if (patron.minion_stats) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				return minionStats(mahojiUser);
			}
			if (patron.give_box) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.One) return patronMsg(PerkTier.One);
				return giveBox(mahojiUser, klasaUser, patron.give_box.user);
			}
			if (patron.activity_export) {
				if (getUsersPerkTier(mahojiUser) < PerkTier.Four) return patronMsg(PerkTier.Four);
				const promise = activityExport(mahojiUser);
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
		}
		if (options.user) {
			if (options.user.mypets) {
				let b = new Bank();
				for (const [pet, qty] of Object.entries(mahojiUser.pets as ItemBank)) {
					const petObj = pets.find(i => i.id === Number(pet));
					if (!petObj) continue;
					b.add(petObj.name, qty);
				}
				return {
					attachments: [(await makeBankImage({ bank: b, title: 'Your Chat Pets' })).file]
				};
			}
		}
		return 'Invalid command!';
	}
};
