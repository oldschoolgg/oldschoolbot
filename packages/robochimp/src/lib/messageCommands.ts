import { isValidDiscordSnowflake } from '@oldschoolgg/toolkit/discord-util';
import { notEmpty } from '@oldschoolgg/toolkit/util';
import { type Message, time, userMention } from 'discord.js';

import { Bits, bitsDescriptions, fetchSupportServer, fetchUser, findGroupOfUser, tiers } from '../util.js';

const messageCommands = [
	{
		name: 'poll',
		delimiter: ',',
		run: async (message: Message, args: string[]) => {
			const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
			const reply = await message.reply({
				content: args
					.slice(0, 9)
					.map((arg, index) => `${emojis[index]} ${arg}`)
					.join('\n'),
				allowedMentions: {
					users: [],
					roles: [],
					parse: []
				}
			});

			for (let i = 0; i < args.length && i < 9; i++) {
				await reply.react(emojis[i]);
			}
		}
	}
];

export async function getInfoStrOfUser(target: string) {
	if (!isValidDiscordSnowflake(target)) {
		return 'Invalid user ID.';
	}
	const [djsUser, member] = await Promise.all([
		djsClient.users.fetch(target).catch(() => null),
		fetchSupportServer()
			.then(s => s.members.fetch(target))
			.catch(() => null)
	]);
	const roboChimpUser = await fetchUser(target);
	const linkedAccounts = await findGroupOfUser(roboChimpUser);
	let tier = roboChimpUser.perk_tier
		? `Tier ${tiers.find(t => t.perkTier === roboChimpUser.perk_tier)!.number}`
		: 'None';

	if (roboChimpUser.patreon_id) {
		tier += ' Patreon';
	}
	if (roboChimpUser.github_id) {
		tier += ' Github';
	}

	const isBlacklisted =
		(await roboChimpClient.blacklistedEntity.count({
			where: {
				id: BigInt(target),
				type: 'user'
			}
		})) > 0;

	const result: { name: string; value: string }[] = [
		{
			name: 'Linked Accounts',
			value: linkedAccounts.length === 1 ? 'None' : linkedAccounts.map(id => userMention(id)).join(' ')
		},
		{
			name: 'Perk Tier',
			value: tier
		},
		{
			name: 'RoboChimp Bitfield',
			value: roboChimpUser.bits.map(bit => bitsDescriptions[bit as Bits]!.description).join(', ')
		},
		{
			name: 'Account created at',
			value: !djsUser ? 'Unknown' : time(djsUser.createdAt, 'R')
		},
		{
			name: 'Joined this server at',
			value: !member ? 'Unknown' : time(member.joinedAt!, 'R')
		},
		{
			name: 'Roles',
			value: !member
				? 'Unknown'
				: member.roles.cache
						.filter(i => i.id !== member.roles.guild.id)
						.map(r => r.name)
						.join(', ')
		},
		{
			name: 'Blacklisted',
			value: isBlacklisted ? 'Yes' : 'No'
		}
	];

	const globalMastery =
		roboChimpUser.osb_mastery !== null && roboChimpUser.bso_mastery !== null
			? ((roboChimpUser.bso_mastery + roboChimpUser.osb_mastery) / 2).toFixed(1)
			: null;
	if (globalMastery) {
		result.push({
			name: 'Global OSBSO Mastery%',
			value: `${globalMastery}%`
		});
	}

	const globalCLPercent =
		roboChimpUser.osb_cl_percent !== null && roboChimpUser.bso_cl_percent !== null
			? ((roboChimpUser.osb_cl_percent + roboChimpUser.bso_cl_percent) / 2).toFixed(1)
			: null;
	if (globalCLPercent) {
		result.push({
			name: 'Global OSBSO CL%',
			value: `${globalCLPercent}%`
		});
	}

	return `${djsUser?.username} (${djsUser?.id})
${result.map(r => `**${r.name}:** ${r.value}`).join('\n')}`;
}

export async function handleCommands(message: Message) {
	const prefix = '.';
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift()?.toLowerCase();

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const foundCommand = messageCommands.find(cmd => cmd.name === command);

	if (foundCommand) {
		const delimitedArgs = args
			.join(' ')
			.split(foundCommand.delimiter)
			.map(arg => arg.trim())
			.filter(notEmpty)
			.filter(s => s.length > 0);
		return foundCommand.run(message, delimitedArgs);
	}

	const possibleID = message.content.replace('.', '');

	if (message.guild && possibleID && isValidDiscordSnowflake(possibleID)) {
		const commandRunner = await fetchUser(message.author.id);
		if (!commandRunner.bits.includes(Bits.Mod) && message.author.id !== possibleID) {
			return message.reply({
				content: 'You can only check your own information.',
				allowedMentions: {
					users: [],
					parse: []
				}
			});
		}
		return message.reply({
			content: await getInfoStrOfUser(possibleID),
			allowedMentions: {
				users: [],
				parse: []
			}
		});
	}
}
