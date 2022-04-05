import { Embed } from '@discordjs/builders';
import { User } from '@prisma/client';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { client } from '../..';
import LeaderboardCommand from '../../commands/Minion/leaderboard';
import { BitField, PerkTier } from '../../lib/constants';
import { allDroppedItems } from '../../lib/data/Collections';
import killableMonsters, { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { stringMatches } from '../../lib/util';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { OSBMahojiCommand } from '../lib/util';
import { itemOption, mahojiUsersSettingsFetch, monsterOption, patronMsg } from '../mahojiSettings';

const TimeIntervals = ['day', 'week'] as const;

async function kcGains(user: User, interval: string, monsterName: string): CommandResponse {
	if (getUsersPerkTier(user.bitfield) < PerkTier.Four) return patronMsg(PerkTier.Four);
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

	const res = await client.query<{ user_id: string; qty: number }[]>(query);

	if (res.length === 0) {
		return 'No results found.';
	}

	const command = client.commands.get('leaderboard') as LeaderboardCommand;

	let place = 0;
	const embed = new Embed()
		.setTitle(`Highest ${monster.name} KC gains in the past ${interval}`)
		.setDescription(
			res
				.map(
					(i: any) =>
						`${++place}. **${command.getUsername(i.user, res.length)}**: ${Number(i.qty).toLocaleString()}`
				)
				.join('\n')
		);

	return { embeds: [embed] };
}

async function dryStreakCommand(user: User, monsterName: string, itemName: string, ironmanOnly: boolean) {
	if (getUsersPerkTier(user.bitfield) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const mon = effectiveMonsters.find(mon => mon.aliases.some(alias => stringMatches(alias, monsterName)));
	if (!mon) {
		return "That's not a valid monster or minigame.";
	}

	const item = getOSItem(itemName);

	const ironmanPart = ironmanOnly ? 'AND "minion.ironman" = true' : '';
	const key = 'monsterScores';
	const { id } = mon;
	const query = `SELECT "id", "${key}"->>'${id}' AS "KC" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NULL AND "${key}"->>'${id}' IS NOT NULL ${ironmanPart} ORDER BY ("${key}"->>'${id}')::int DESC LIMIT 10;`;

	const result = await client.query<
		{
			id: string;
			KC: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	const command = client.commands.get('leaderboard') as LeaderboardCommand;

	return `**Dry Streaks for ${item.name} from ${mon.name}:**\n${result
		.map(({ id, KC }) => `${command.getUsername(id) as string}: ${parseInt(KC).toLocaleString()}`)
		.join('\n')}`;
}

async function mostDrops(user: User, itemName: string) {
	if (getUsersPerkTier(user.bitfield) < PerkTier.Four) return patronMsg(PerkTier.Four);
	const item = getItem(itemName);
	if (!item) return "That's not a valid item.";
	if (!allDroppedItems.includes(item.id) && !user.bitfield.includes(BitField.isModerator)) {
		return "You can't check this item, because it's not on any collection log.";
	}

	const query = `SELECT "id", "collectionLogBank"->>'${item.id}' AS "qty" FROM users WHERE "collectionLogBank"->>'${item.id}' IS NOT NULL ORDER BY ("collectionLogBank"->>'${item.id}')::int DESC LIMIT 10;`;

	const result = await client.query<
		{
			id: string;
			qty: string;
		}[]
	>(query);

	if (result.length === 0) return 'No results found.';

	const command = client.commands.get('leaderboard') as LeaderboardCommand;

	return `**Most '${item.name}' received:**\n${result
		.map(
			({ id, qty }) =>
				`${result.length < 10 ? '(Anonymous)' : command.getUsername(id)}: ${parseInt(qty).toLocaleString()}`
		)
		.join('\n')}`;
}

export const testPotatoCommand: OSBMahojiCommand = {
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
					name: 'drystreak',
					description: "Show's the biggest drystreaks for certain drops from a certain monster.",
					options: [
						monsterOption,
						{
							...itemOption,
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
							...itemOption,
							required: true
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
					description: 'Shows a bank image containing all items in your collection log.'
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		patron?: {
			kc_gains?: {
				time: 'day' | 'week';
				monster: string;
			};
			drystreak?: {
				monster: string;
				item: string;
				ironman?: boolean;
			};
			mostdrops?: {
				item: string;
			};
			sacrificed_bank?: {};
			cl_bank?: {};
		};
	}>) => {
		interaction.deferReply();
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

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
				return mostDrops(mahojiUser, patron.mostdrops.item);
			}
			if (patron.sacrificed_bank) {
				if (getUsersPerkTier(mahojiUser.bitfield) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const image = await makeBankImage({
					bank: new Bank(mahojiUser.sacrificedBank as ItemBank),
					title: 'Your Sacrificed Items'
				});
				return {
					attachments: [image.file]
				};
			}
			if (patron.cl_bank) {
				if (getUsersPerkTier(mahojiUser.bitfield) < PerkTier.Two) return patronMsg(PerkTier.Two);
				const image = await makeBankImage({
					bank: new Bank(mahojiUser.collectionLogBank as ItemBank),
					title: 'Your Entire Collection Log'
				});
				return {
					attachments: [image.file]
				};
			}
		}
		return 'Invalid command!';
	}
};
