import { Duration, Time } from '@sapphire/time-utilities';
import { TextChannel } from 'discord.js';
import { notEmpty, uniqueArr } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { bulkUpdateCommands } from 'mahoji/dist/lib/util';
import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { CLIENT_ID } from '../config';
import { BLACKLISTED_USERS } from '../lib/blacklists';
import {
	badges,
	BitField,
	BitFieldData,
	Channel,
	DISABLED_COMMANDS,
	Emoji,
	Roles,
	SupportServer
} from '../lib/constants';
import { getSimilarItems } from '../lib/data/similarItems';
import { evalMathExpression } from '../lib/expressionParser';
import { roboChimpUserFetch } from '../lib/roboChimp';
import { convertStoredActivityToFlatActivity, prisma } from '../lib/settings/prisma';
import { minionActivityCache } from '../lib/settings/settings';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { BotCommand } from '../lib/structures/BotCommand';
import {
	convertBankToPerHourStats,
	formatDuration,
	getUsername,
	isGroupActivity,
	isNexActivity,
	isRaidsActivity,
	isTobActivity,
	itemNameFromID,
	stringMatches
} from '../lib/util';
import getOSItem from '../lib/util/getOSItem';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';
import { logError } from '../lib/util/logError';
import { makeBankImageKlasa } from '../lib/util/makeBankImage';
import { sendToChannelID } from '../lib/util/webhook';
import { allAbstractCommands } from '../mahoji/lib/util';

async function checkMassesCommand(msg: KlasaMessage) {
	if (!msg.guild) return null;
	const channelIDs = msg.guild.channels.cache.filter(c => c.type === 'text').map(c => BigInt(c.id));

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
		.filter(m => (isRaidsActivity(m) || isGroupActivity(m) || isTobActivity(m)) && m.users.length > 1);

	if (masses.length === 0) {
		return msg.channel.send('There are no active masses in this server.');
	}
	const now = Date.now();
	const massStr = masses
		.map(m => {
			const remainingTime =
				isTobActivity(m) || isNexActivity(m)
					? m.finishDate - m.duration + m.fakeDuration - now
					: m.finishDate - now;
			if (isGroupActivity(m)) {
				return [
					remainingTime,
					`${m.type}${isRaidsActivity(m) && m.challengeMode ? ' CM' : ''}: ${
						m.users.length
					} users returning to <#${m.channelID}> in ${formatDuration(remainingTime)}`
				];
			}
		})
		.sort((a, b) => (a![0] < b![0] ? -1 : a![0] > b![0] ? 1 : 0))
		.map(m => m![1])
		.join('\n');
	return msg.channel.send(`**Masses in this server:**
${massStr}`);
}

function itemSearch(msg: KlasaMessage, name: string) {
	const items = Items.filter(i => {
		if (msg.flagArgs.includes) {
			return i.name.toLowerCase().includes(name.toLowerCase());
		}
		return [i.id.toString(), i.name.toLowerCase()].includes(name.toLowerCase());
	}).array();
	if (items.length === 0) return msg.channel.send('No results for that item.');

	const gettedItem = items[0];

	if (msg.flagArgs.raw) {
		return msg.channel.send(`\`\`\`\n${JSON.stringify(gettedItem, null, 4)}\n\`\`\``);
	}

	let str = `Found ${items.length} items:\n${(items as Item[])
		.slice(0, 5)
		.map(
			(item, index) => `${gettedItem!.id === item.id ? '**' : ''}
${index + 1}. ${item.name}[${item.id}] Price[${item.price}] ${
				item.tradeable_on_ge ? 'GE_Tradeable' : 'Not_GE_Tradeable'
			} ${item.tradeable ? 'Tradeable' : 'Not_Tradeable'} ${item.incomplete ? 'Incomplete' : 'Not_Incomplete'} ${
				gettedItem!.id === item.id ? '**' : ''
			} <${item.wiki_url}>`
		)
		.join('\n')}`;

	if (items.length > 5) {
		str += `\n...and ${items.length - 5} others`;
	}

	return msg.channel.send(str);
}

const statusMap = {
	'0': '🟢 Ready',
	'1': '🟠 Connecting',
	'2': '🟠 Reconnecting',
	'3': 'Idle',
	'4': 'Nearly',
	'5': '🔴 Disconnected',
	'6': 'Waiting For Guilds',
	'7': '🟠 Identifying',
	'8': '🟠 Resuming'
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			runIn: ['text'],
			usage: '<cmd:str> [user:user|str:...str] [user:user|str:...str]',
			usageDelim: ' '
		});
	}

	async run(
		msg: KlasaMessage,
		[cmd, input, str]: [string, KlasaUser | string | undefined, KlasaUser | string | undefined]
	) {
		const isMod = msg.author.settings.get(UserSettings.BitField).includes(BitField.isModerator);
		const isOwner = this.client.owners.has(msg.author);

		switch (cmd.toLowerCase()) {
			case 'ping': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!input || typeof input !== 'string') return;
				const roles = await prisma.pingableRole.findMany();
				const roleToPing = roles.find(i => i.id === Number(input) || stringMatches(i.name, input));
				if (!roleToPing) {
					return msg.channel.send('No role with that name found.');
				}
				if (!msg.member) return;
				if (!msg.member.roles.cache.has(Roles.MassHoster)) {
					return;
				}
				return msg.channel.send(
					`<@&${roleToPing.role_id}> You were pinged because you have this role, you can remove it using \`+roles ${roleToPing.name}\`.`
				);
			}
			case 'checkmasses': {
				return checkMassesCommand(msg);
			}
			case 'pingmass':
			case 'pm': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!msg.member) return;
				if (!(msg.channel instanceof TextChannel)) return;
				if (!msg.member.roles.cache.has(Roles.MassHoster) && !msg.member.roles.cache.has(Roles.Moderator)) {
					return;
				}
				if (msg.channel.id === Channel.BarbarianAssault) {
					return msg.channel.send(`<@&${Roles.BarbarianAssaultMass}>`);
				}
				if (msg.channel.parentID === Channel.ChambersOfXeric) {
					return msg.channel.send(`<@&${Roles.ChambersOfXericMass}>`);
				}
				return msg.channel.send(`<@&${Roles.Mass}>`);
			}
			case 'check':
			case 'c': {
				let u = input;
				if ((!isMod && !isOwner) || !u) {
					u = msg.author;
				}
				if (!(u instanceof KlasaUser)) return;
				await u.settings.sync(true);
				const roboChimpUser = await roboChimpUserFetch(BigInt(u.id));

				const bitfields = `${u.settings
					.get(UserSettings.BitField)
					.map(i => BitFieldData[i])
					.filter(notEmpty)
					.map(i => i.name)
					.join(', ')}`;

				const task = minionActivityCache.get(u.id);
				const taskText = task ? `${task.type}` : 'None';

				const userBadges = u.settings.get(UserSettings.Badges).map(i => badges[i]);
				const isBlacklisted = BLACKLISTED_USERS.has(u.id);

				const premiumDate = u.settings.get(UserSettings.PremiumBalanceExpiryDate);
				const premiumTier = u.settings.get(UserSettings.PremiumBalanceTier);

				return msg.channel.send(
					`**${u.username}**
**Perk Tier:** ${getUsersPerkTier(u)}
**Bitfields:** ${bitfields}
**Badges:** ${userBadges}
**Current Task:** ${taskText}
**Blacklisted:** ${isBlacklisted ? 'Yes' : 'No'}
**Patreon/Github:** ${roboChimpUser.patreon_id ? 'Yes' : 'None'}/${roboChimpUser.github_id ? 'Yes' : 'None'}
**Ironman:** ${u.isIronman ? 'Yes' : 'No'}
**Premium Balance:** ${premiumDate ? new Date(premiumDate).toLocaleString() : ''} ${
						premiumTier ? `Tier ${premiumTier}` : ''
					}

**Main Account:** ${
						u.settings.get(UserSettings.MainAccount) !== null
							? `${getUsername(u.settings.get(UserSettings.MainAccount)!)}[${u.settings.get(
									UserSettings.MainAccount
							  )}]`
							: 'None'
					}
**Ironman Alt Accounts:** ${u.settings.get(UserSettings.IronmanAlts).map(id => `${getUsername(id)}[${id}]`)}
`
				);
			}
			case 'itemsearch':
			case 'is': {
				if (typeof input !== 'string') return;
				return itemSearch(msg, input);
			}
			case 'hasequipped': {
				if (typeof input !== 'string') return;
				const item = getOSItem(input);
				const setupsWith = [];
				let res = `Does ${msg.author.username} have a ${item.name} (or similar items: ${getSimilarItems(item.id)
					.map(itemNameFromID)
					.join(', ')}) equipped?`;
				for (const [key, gear] of Object.entries(msg.author.rawGear())) {
					if (gear.hasEquipped([item.id], false, true)) {
						setupsWith.push(key);
						continue;
					}
				}
				return msg.channel.send(`${res}

${
	setupsWith.length === 0
		? "You don't have this item equipped anywhere."
		: `You have ${item.name} equipped in these setups: ${setupsWith.join(', ')}.`
}`);
			}
		}

		if (!isMod && !isOwner) return null;

		if (input && input instanceof KlasaUser) {
			await input.settings.sync(true);
		}

		// Mod commands
		switch (cmd.toLowerCase()) {
			case 'addimalt': {
				if (!input || !(input instanceof KlasaUser)) return;
				if (!str || !(str instanceof KlasaUser)) return;

				const mainAccount = input;
				const altAccount = str;
				if (mainAccount === altAccount) {
					return msg.channel.send("They're they same account.");
				}
				if (mainAccount.isIronman) {
					return msg.channel.send(`${mainAccount.username} is an ironman.`);
				}
				if (!altAccount.isIronman) {
					return msg.channel.send(`${altAccount.username} is not an ironman.`);
				}
				if (!altAccount.bitfield.includes(BitField.PermanentIronman)) {
					return msg.channel.send(`${altAccount.username} is not a *permanent* ironman.`);
				}

				await mainAccount.settings.sync(true);
				await altAccount.settings.sync(true);
				const peopleWithThisAltAlready = (
					await this.client.query<any>(`SELECT id FROM users WHERE '${altAccount.id}' = ANY(ironman_alts);`)
				).length;
				if (peopleWithThisAltAlready > 0) {
					return msg.channel.send(`Someone already has ${altAccount.username} as an ironman alt.`);
				}
				if (mainAccount.settings.get(UserSettings.MainAccount)) {
					return msg.channel.send(`${mainAccount.username} has a main account connected already.`);
				}
				if (altAccount.settings.get(UserSettings.MainAccount)) {
					return msg.channel.send(`${altAccount.username} has a main account connected already.`);
				}
				const mainAccountsAlts = mainAccount.settings.get(UserSettings.IronmanAlts);
				if (mainAccountsAlts.includes(altAccount.id)) {
					return msg.channel.send(`${mainAccount.username} already has ${altAccount.username} as an alt.`);
				}

				await msg.confirm(
					`Are you sure that \`${altAccount.username}\` is the alt account of \`${mainAccount.username}\`?`
				);
				await mainAccount.settings.update(UserSettings.IronmanAlts, altAccount.id);
				await altAccount.settings.update(UserSettings.MainAccount, mainAccount.id);
				return msg.channel.send(
					`You set \`${altAccount.username}\` as the alt account of \`${mainAccount.username}\`.`
				);
			}
			case 'setprice': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (typeof input !== 'string') return;
				const [itemName, rawPrice] = input.split(',');
				const item = getOSItem(itemName);
				const price = evalMathExpression(rawPrice);
				if (!price || price < 1 || price > 1_000_000_000) return;
				await msg.confirm(
					`Are you sure you want to set the price of \`${item.name}\`(ID: ${item.id}, Wiki: ${
						item.wiki_url
					}) to \`${price.toLocaleString()}\`?`
				);
				const current = this.client.settings.get(ClientSettings.CustomPrices);
				const newPrices = { ...current, [item.id]: price };
				await this.client.settings.update(ClientSettings.CustomPrices, newPrices);
				return msg.channel.send(`Set the price of \`${item.name}\` to \`${price.toLocaleString()}\`.`);
			}
			case 'status': {
				let counter: Record<string, number> = {};
				for (const key of Object.keys(statusMap)) {
					counter[key] = 0;
				}
				for (const shard of this.client.ws.shards.values()) {
					counter[shard.status]++;
				}

				let status = Object.entries(counter)
					.filter(ent => ent[1] !== 0)
					.map(ent => `${statusMap[ent[0] as keyof typeof statusMap]}: ${ent[1]}`)
					.join('\n');
				return msg.channel.send(status);
			}
			case 'bypassage': {
				if (!input || !(input instanceof KlasaUser)) return;
				await input.settings.sync(true);
				if (input.settings.get(UserSettings.BitField).includes(BitField.BypassAgeRestriction)) {
					return msg.channel.send('This user is already bypassed.');
				}
				await input.settings.update(UserSettings.BitField, BitField.BypassAgeRestriction, {
					arrayAction: 'add'
				});
				return msg.channel.send(`${Emoji.RottenPotato} Bypassed age restriction for ${input.username}.`);
			}
			case 'patreon': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				msg.channel.send('Running patreon task...');
				await this.client.tasks.get('patreon')?.run();
				return msg.channel.send('Finished syncing patrons.');
			}
			case 'roles': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				msg.channel.send('Running roles task...');
				try {
					const result = (await this.client.tasks.get('roles')?.run()) as string;
					return sendToChannelID(msg.channel.id, {
						content: result.slice(0, 2500)
					});
				} catch (err: any) {
					logError(err);
					return msg.channel.send(`Failed to run roles task. ${err.message}`);
				}
			}
			case 'bf': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!input || !str || !(input instanceof KlasaUser) || typeof str !== 'string') {
					return msg.channel.send(
						Object.entries(BitFieldData)
							.map(entry => `**${entry[0]}:** ${entry[1]?.name}`)
							.join('\n')
					);
				}
				const [action, _bit] = str.split(' ');

				const bit = Number(_bit);
				if (
					!bit ||
					!(BitFieldData as any)[bit] ||
					[7, 8].includes(bit) ||
					(action !== 'add' && action !== 'remove')
				) {
					return msg.channel.send('Invalid bitfield.');
				}

				let newBits = [...input.settings.get(UserSettings.BitField)];

				if (action === 'add') {
					if (newBits.includes(bit)) {
						return msg.channel.send("Already has this bit, so can't add.");
					}
					newBits.push(bit);
				} else {
					if (!newBits.includes(bit)) {
						return msg.channel.send("Doesn't have this bit, so can't remove.");
					}
					newBits = newBits.filter(i => i !== bit);
				}

				await input.settings.update(UserSettings.BitField, uniqueArr(newBits), {
					arrayAction: 'overwrite'
				});

				return msg.channel.send(
					`${action === 'add' ? 'Added' : 'Removed'} '${(BitFieldData as any)[bit].name}' bit to ${
						input.username
					}.`
				);
			}

			case 'badges': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!input || !str || !(input instanceof KlasaUser) || typeof str !== 'string') {
					return msg.channel.send(
						Object.entries(badges)
							.map(entry => `**${entry[1]}:** ${entry[0]}`)
							.join('\n')
					);
				}

				const badgesKeys = Object.keys(badges);

				const [action, _badge] = str.split(' ');
				const badge = Number(_badge);

				if (!badgesKeys.includes(_badge) || (action !== 'add' && action !== 'remove')) {
					return msg.channel.send('Invalid badge.');
				}

				let newBadges = [...input.settings.get(UserSettings.Badges)];

				if (action === 'add') {
					if (newBadges.includes(badge)) {
						return msg.channel.send("Already has this badge, so can't add.");
					}
					newBadges.push(badge);
				} else {
					if (!newBadges.includes(badge)) {
						return msg.channel.send("Doesn't have this badge, so can't remove.");
					}
					newBadges = newBadges.filter(i => i !== badge);
				}

				await input.settings.update(UserSettings.Badges, uniqueArr(newBadges), {
					arrayAction: 'overwrite'
				});

				return msg.channel.send(
					`${action === 'add' ? 'Added' : 'Removed'} ${badges[badge]} badge to ${input.username}.`
				);
			}

			case 'mostactive': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				const res = await this.client.query<{ num: number; username: string }[]>(`
SELECT sum(duration) as num, "new_user"."username", user_id
FROM activity
INNER JOIN "new_users" "new_user" on "new_user"."id" = "activity"."user_id"::text
WHERE start_date > now() - interval '2 days'
GROUP BY user_id, "new_user"."username"
ORDER BY num DESC
LIMIT 10;
`);
				return msg.channel.send(
					`Most Active Users in past 48h\n${res
						.map((i, ind) => `${ind + 1} ${i.username}: ${formatDuration(i.num)}`)
						.join('\n')}`
				);
			}
			case 'disable': {
				if (!input || input instanceof KlasaUser) {
					return msg.channel.send(`Disabled Commands: ${Array.from(DISABLED_COMMANDS).join(', ')}.`);
				}
				const command = allAbstractCommands(globalClient.mahojiClient).find(c => stringMatches(c.name, input));
				if (!command) return msg.channel.send("That's not a valid command.");
				const currentDisabledCommands = (await prisma.clientStorage.findFirst({
					where: { id: CLIENT_ID },
					select: { disabled_commands: true }
				}))!.disabled_commands;
				if (currentDisabledCommands.includes(command.name)) {
					return msg.channel.send('That command is already disabled.');
				}
				const newDisabled = [...currentDisabledCommands, command.name.toLowerCase()];
				await prisma.clientStorage.update({
					where: {
						id: CLIENT_ID
					},
					data: {
						disabled_commands: newDisabled
					}
				});
				DISABLED_COMMANDS.add(command.name);
				return msg.channel.send(`Disabled \`${command.name}\`.`);
			}
			case 'enable': {
				if (!input || input instanceof KlasaUser) return;
				const command = allAbstractCommands(globalClient.mahojiClient).find(c => stringMatches(c.name, input));
				if (!command) return msg.channel.send("That's not a valid command.");

				const currentDisabledCommands = (await prisma.clientStorage.findFirst({
					where: { id: CLIENT_ID },
					select: { disabled_commands: true }
				}))!.disabled_commands;
				if (!currentDisabledCommands.includes(command.name)) {
					return msg.channel.send('That command is not disabled.');
				}

				await prisma.clientStorage.update({
					where: {
						id: CLIENT_ID
					},
					data: {
						disabled_commands: currentDisabledCommands.filter(i => i !== command.name)
					}
				});
				DISABLED_COMMANDS.delete(command.name);
				return msg.channel.send(`Enabled \`${command.name}\`.`);
			}
			case 'addptime': {
				if (!input || !(input instanceof KlasaUser)) return;
				if (!str || typeof str !== 'string' || str.length < 2 || !str.includes(',')) return;
				const [_tier, _duration] = str.split(',');
				const tier = parseInt(_tier);
				if (![1, 2, 3, 4, 5].includes(tier)) return;
				const duration = new Duration(_duration);
				const ms = duration.offset;
				if (ms < Time.Second || ms > Time.Year * 3) return;

				const currentBalanceTier = input.settings.get(UserSettings.PremiumBalanceTier);
				const currentBalanceTime = input.settings.get(UserSettings.PremiumBalanceExpiryDate);

				const oldPerkTier = input.perkTier;
				if (oldPerkTier > 1 && !currentBalanceTier && oldPerkTier <= tier + 1) {
					return msg.channel.send(`${input.username} is already a patron of at least that tier.`);
				}
				if (currentBalanceTier !== null && currentBalanceTier !== tier) {
					await msg.confirm(
						`${input} already has ${formatDuration(
							currentBalanceTime!
						)} of Tier ${currentBalanceTier}; this will replace the existing balance entirely, are you sure?`
					);
				}
				await msg.confirm(
					`Are you sure you want to add ${formatDuration(ms)} of Tier ${tier} patron to ${input.username}?`
				);
				await input.settings.update(UserSettings.PremiumBalanceTier, tier);

				let newBalanceExpiryTime = 0;
				if (currentBalanceTime !== null && tier === currentBalanceTier) {
					newBalanceExpiryTime = currentBalanceTime + ms;
				} else {
					newBalanceExpiryTime = Date.now() + ms;
				}
				await input.settings.update(UserSettings.PremiumBalanceExpiryDate, newBalanceExpiryTime);

				return msg.channel.send(
					`Gave ${formatDuration(ms)} of Tier ${tier} patron to ${input.username}. They have ${formatDuration(
						newBalanceExpiryTime - Date.now()
					)} remaining.`
				);
			}
		}

		if (!isOwner) return null;

		// Owner commands
		switch (cmd.toLowerCase()) {
			case 'globalsync': {
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: globalClient.mahojiClient.commands.values,
					guildID: null
				});
				return 'Synced commands.';
			}
			case 'loottrack': {
				if (typeof input !== 'string') {
					const tracks = await prisma.lootTrack.findMany();
					return msg.channel.send(tracks.map(t => t.id).join(', '));
				}
				const loot = await prisma.lootTrack.findFirst({
					where: {
						id: input
					}
				});
				if (!loot) return msg.channel.send('Invalid');

				const durationMillis = loot.total_duration * Time.Minute;

				const arr = [
					['Cost', new Bank(loot.cost as any)],
					['Loot', new Bank(loot.loot as any)]
				] as const;

				for (const [name, bank] of arr) {
					msg.channel.send({
						content: convertBankToPerHourStats(bank, durationMillis).join(', '),
						...(await makeBankImageKlasa({ bank, title: name }))
					});
				}

				return msg.channel.send({
					content: `${loot.id} ${formatDuration(loot.total_duration * Time.Minute)} KC${loot.total_kc}`
				});
			}
		}
	}
}
