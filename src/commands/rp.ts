import { codeBlock, inlineCode } from '@discordjs/builders';
import { Prisma, User } from '@prisma/client';
import { Duration, Time } from '@sapphire/time-utilities';
import { Type } from '@sapphire/type';
import { MessageAttachment, MessageOptions, TextChannel, Util } from 'discord.js';
import { notEmpty, uniqueArr } from 'e';
import { CommandStore, KlasaMessage, KlasaUser, Stopwatch, util } from 'klasa';
import { bulkUpdateCommands } from 'mahoji/dist/lib/util';
import { inspect } from 'node:util';
import fetch from 'node-fetch';
import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { CLIENT_ID, production } from '../config';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS, syncBlacklists } from '../lib/blacklists';
import { embTable, tmbTable, umbTable } from '../lib/bsoOpenables';
import {
	badges,
	BitField,
	BitFieldData,
	Channel,
	DefaultPingableRoles,
	DISABLED_COMMANDS,
	Emoji,
	Roles,
	SupportServer,
	userTimers
} from '../lib/constants';
import { getSimilarItems } from '../lib/data/similarItems';
import { addPatronLootTime, addToDoubleLootTimer } from '../lib/doubleLoot';
import { evalMathExpression } from '../lib/expressionParser';
import { GearSetup, GearSetupTypes } from '../lib/gear';
import { convertStoredActivityToFlatActivity, countUsersWithItemInCl, prisma } from '../lib/settings/prisma';
import { cancelTask, minionActivityCache, minionActivityCacheDelete } from '../lib/settings/settings';
import { ClientSettings } from '../lib/settings/types/ClientSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { BotCommand } from '../lib/structures/BotCommand';
import { ItemBank } from '../lib/types';
import {
	bankValueWithMarketPrices,
	calcPerHour,
	convertBankToPerHourStats,
	formatDuration,
	getSupportGuild,
	getUsername,
	isGroupActivity,
	isNexActivity,
	isRaidsActivity,
	isSuperUntradeable,
	isTobActivity,
	itemNameFromID,
	moidLink,
	stringMatches,
	toKMB
} from '../lib/util';
import getOSItem from '../lib/util/getOSItem';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';
import { logError } from '../lib/util/logError';
import { makeBankImage, makeBankImageKlasa } from '../lib/util/makeBankImage';
import { sendToChannelID } from '../lib/util/webhook';
import { Cooldowns } from '../mahoji/lib/Cooldowns';
import { allAbstractCommands } from '../mahoji/lib/util';
import { mahojiParseNumber, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';
import PatreonTask from '../tasks/patreon';

export async function repairBrokenItemsFromUser(user: User | KlasaUser): Promise<[string] | [string, any[]]> {
	const changes: Prisma.UserUpdateArgs['data'] = {};
	const rawBank = user instanceof KlasaUser ? user.settings.get(UserSettings.Bank) : (user.bank as ItemBank);
	const rawCL =
		user instanceof KlasaUser
			? user.settings.get(UserSettings.CollectionLogBank)
			: (user.collectionLogBank as ItemBank);
	const rawTempCL = user instanceof KlasaUser ? user.settings.get(UserSettings.TempCL) : (user.temp_cl as ItemBank);
	const rawSB =
		user instanceof KlasaUser ? user.settings.get(UserSettings.SacrificedBank) : (user.sacrificedBank as ItemBank);
	const favorites = user instanceof KlasaUser ? user.settings.get(UserSettings.FavoriteItems) : user.favoriteItems;

	const rawAllGear = GearSetupTypes.map(i =>
		user instanceof KlasaUser ? user.settings.get(`gear.${i}`) : user[`gear_${i}`]
	);
	const allGearItemIDs = rawAllGear
		.filter(notEmpty)
		.map((b: any) =>
			Object.values(b)
				.filter(notEmpty)
				.map((i: any) => i.item)
		)
		.flat(Infinity);

	const brokenBank: number[] = [];
	const allItemsToCheck = [
		['bank', Object.keys(rawBank)],
		['cl', Object.keys(rawCL)],
		['tempcl', Object.keys(rawTempCL)],
		['sacbank', Object.keys(rawSB)],
		['favs', favorites],
		['gear', allGearItemIDs]
	] as const;

	for (const [, ids] of allItemsToCheck) {
		for (const id of ids.map(i => Number(i))) {
			const item = Items.get(id);
			if (!item) {
				brokenBank.push(id);
			}
		}
	}

	const newFavs = favorites.filter(i => !brokenBank.includes(i));

	const newBank = { ...rawBank };
	const newCL = { ...rawCL };
	const newTempCL = { ...rawTempCL };
	const newSB = { ...rawSB };
	for (const id of brokenBank) {
		delete newBank[id];
		delete newCL[id];
		delete newTempCL[id];
		delete newSB[id];
	}

	for (const setupType of GearSetupTypes) {
		const _gear = (
			user instanceof KlasaUser ? user.settings.get(`gear.${setupType}`) : user[`gear_${setupType}`]
		) as GearSetup | null;
		if (_gear === null) continue;
		const gear = { ..._gear };
		for (const [key, value] of Object.entries(gear)) {
			if (value === null) continue;
			if (brokenBank.includes(value.item)) {
				delete gear[key as keyof GearSetup];
			}
		}
		// @ts-ignore ???
		changes[`gear_${setupType}`] = gear;
	}

	if (brokenBank.length > 0) {
		changes.favoriteItems = newFavs;
		changes.bank = newBank;
		changes.collectionLogBank = newCL;
		changes.temp_cl = newTempCL;
		changes.sacrificedBank = newSB;
		if (newFavs.includes(NaN) || [newBank, newCL, newTempCL, newSB].some(i => Boolean(i['NaN']))) {
			return ['Oopsie...'];
		}

		await mahojiUserSettingsUpdate(user.id, changes);

		return [
			`You had ${
				brokenBank.length
			} broken items in your bank/collection log/sacrifices/favorites/gear, they were removed. ${moidLink(
				brokenBank
			).slice(0, 500)}`,
			Object.keys(brokenBank)
		];
	}

	return ['You have no broken items on your account!'];
}

async function generateReadyThings(user: KlasaUser) {
	const readyThings = [];
	for (const [cooldown, setting, name] of userTimers) {
		const lastTime: number = user.settings.get(setting) as number;
		const difference = Date.now() - lastTime;

		const cd = typeof cooldown === 'number' ? cooldown : cooldown(await mahojiUsersSettingsFetch(user.id));

		readyThings.push(
			`**${name}:** ${difference < cd ? `*${formatDuration(Date.now() - (lastTime + cd), true)}*` : 'ready'}`
		);
	}
	return readyThings;
}
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
			} ${!isSuperUntradeable(item) ? 'Tradeable' : 'Not_Tradeable'} ${
				item.incomplete ? 'Incomplete' : 'Not_Incomplete'
			} ${gettedItem!.id === item.id ? '**' : ''} <${item.wiki_url}>`
		)
		.join('\n')}`;

	if (items.length > 5) {
		str += `\n...and ${items.length - 5} others`;
	}

	return msg.channel.send(str);
}

async function unsafeEval({
	code,
	flags,
	// @ts-ignore Makes it accessible in eval
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	msg
}: {
	code: string;
	flags: Record<string, string>;
	msg: KlasaMessage;
}): Promise<MessageOptions & { rawOutput: string }> {
	code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
	const stopwatch = new Stopwatch();
	let syncTime = '?';
	let asyncTime = '?';
	let result = null;
	let thenable = false;
	// eslint-disable-next-line @typescript-eslint/init-declarations
	let type!: Type;
	try {
		code = `\nconst {Bank} = require('oldschooljs');\n${code}`;
		if (flags.async) code = `(async () => {\n${code}\n})();`;
		else if (flags.bk) code = `(async () => {\nreturn ${code}\n})();`;
		// eslint-disable-next-line no-eval
		result = eval(code);
		syncTime = stopwatch.toString();
		type = new Type(result);
		if (util.isThenable(result)) {
			thenable = true;
			stopwatch.restart();
			result = await result;
			asyncTime = stopwatch.toString();
		}
	} catch (error: any) {
		if (!syncTime) syncTime = stopwatch.toString();
		if (!type) type = new Type(error);
		if (thenable && !asyncTime) asyncTime = stopwatch.toString();
		if (error && error.stack) logError(error);
		result = error;
	}

	stopwatch.stop();
	if (flags.bk || result instanceof Bank) {
		const image = await makeBankImage({
			bank: result
		});
		return { files: [new MessageAttachment(image.file.buffer)], rawOutput: result };
	}

	if (Buffer.isBuffer(result)) {
		return {
			content: 'The result was a buffer.',
			rawOutput: 'Buffer'
		};
	}

	if (typeof result !== 'string') {
		result = inspect(result, {
			depth: flags.depth ? parseInt(flags.depth) || 1 : 1,
			showHidden: false
		});
	}

	return {
		content: `${codeBlock(Util.escapeCodeBlock(result))}
**Type:** ${inlineCode(type.toString())}
**Time:** ${asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`}
`,
		rawOutput: result
	};
}

async function evalCommand(msg: KlasaMessage, code: string) {
	try {
		if (!globalClient.owners.has(msg.author)) {
			return "You don't have permission to use this command.";
		}
		const res = await unsafeEval({ code, flags: msg.flagArgs, msg });
		if ('silent' in msg.flagArgs) return null;

		// Handle too-long-messages
		if (res.content && res.content.length > 2000) {
			return msg.channel.send({
				files: [new MessageAttachment(Buffer.from(res.rawOutput), 'output.txt')]
			});
		}

		// If it's a message that can be sent correctly, send it
		return msg.channel.send(res);
	} catch (err) {
		logError(err);
	}
}

export const emoji = () => getSupportGuild()?.emojis.cache.random()?.toString();

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
		const isContributor = msg.author.settings.get(UserSettings.BitField).includes(BitField.isContributor);
		const isOwner = this.client.owners.has(msg.author);

		switch (cmd.toLowerCase()) {
			case 'inboxes': {
				if (typeof input !== 'string') return;
				const item = getOSItem(input);
				return msg.channel.send(`
Is ${item.name} dropped by boxes?

TMB: ${tmbTable.includes(item.id)}
UMB: ${umbTable.includes(item.id)}
EMB: ${embTable.includes(item.id)}`);
			}
			case 'setmp': {
				if (production && (!msg.guild || msg.guild.id !== SupportServer)) return;
				if (
					production &&
					(!msg.member ||
						[Roles.BSOMassHoster, Roles.Moderator, Roles.MassHoster, Roles.PatronTier3].every(
							r => !msg.member!.roles.cache.has(r)
						))
				) {
					return;
				}
				const { market_prices: currentMarketPrices } = (await prisma.clientStorage.findFirst({
					select: {
						market_prices: true
					},
					where: {
						id: CLIENT_ID
					}
				}))!;
				if (!input || typeof input !== 'string') return;
				if (input === 'list') {
					return msg.channel.send({
						files: [
							new MessageAttachment(
								Buffer.from(
									Object.entries(currentMarketPrices as ItemBank)
										.map(ent => {
											const itemName = itemNameFromID(parseInt(ent[0]));
											return `${itemName}\t${ent[1]}\t${toKMB(ent[1])}`;
										})
										.join('\n')
								),
								'output.txt'
							)
						]
					});
				}
				const [itemName, _price] = input.split(',');
				const item = getOSItem(itemName);
				const price = mahojiParseNumber({ input: _price, min: 1, max: 100_000_000_000 });
				if (!price) return msg.channel.send('Invalid price.');
				await msg.confirm(
					`Are you sure you want to set the *market value* of ${item.name} to ${toKMB(
						price
					)}? This must be a reasonable price that the item is sold/bought at. If you put misleading, incorrect, or unnecessary values, you will be banned.`
				);

				const newMarketPrices: ItemBank = {
					...(currentMarketPrices as ItemBank),
					[item.id]: price
				};

				const { market_prices: updatedMarketPrices } = await prisma.clientStorage.update({
					data: {
						market_prices: newMarketPrices
					},
					where: {
						id: CLIENT_ID
					},
					select: {
						market_prices: true
					}
				});
				return msg.channel.send(
					`You set the price of ${item.name} to ${(updatedMarketPrices as ItemBank)[
						item.id
					].toLocaleString()}.`
				);
			}
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
			case 'pingbsomass': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!msg.member) return;
				if (!msg.member.roles.cache.has(Roles.BSOMassHoster) && !msg.member.roles.cache.has(Roles.Moderator)) {
					return;
				}
				return msg.channel.send(
					`<@&${DefaultPingableRoles.BSOMass}> - *Note: You can type \`.roles bso-mass\` to remove, or add, this role to yourself.`
				);
			}
			case 'checkbank': {
				return msg.channel.send(
					(await repairBrokenItemsFromUser(await mahojiUsersSettingsFetch(msg.author.id)))[0]
				);
			}
			case 'givetgb': {
				if (!(input instanceof KlasaUser)) return;
				if (!isMod && !isContributor) return;
				if (input.id === msg.author.id) {
					return msg.channel.send("You can't give boxes to yourself!");
				}
				await input.addItemsToBank({ items: new Bank().add('Tester gift box'), collectionLog: true });
				return msg.channel.send(`Gave 1x Tester gift box to ${input.username}.`);
			}
			case 'pingmass':
			case 'pm': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!msg.member) return;
				if (!(msg.channel instanceof TextChannel)) return;
				if (!msg.member.roles.cache.has(Roles.BSOMassHoster) && !msg.member.roles.cache.has(Roles.Moderator)) {
					return;
				}

				return msg.channel.send(`<@&${DefaultPingableRoles.BSOMass}>`);
			}
			case 'check':
			case 'c': {
				let u = input;
				if ((!isMod && !isOwner) || !u) {
					u = msg.author;
				}
				if (!(u instanceof KlasaUser)) return;
				await u.settings.sync(true);

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

				let str = `**${getUsername(u.id)}**
${(await generateReadyThings(u)).join('\n')}
**Perk Tier:** ${getUsersPerkTier(u)}
**Bitfields:** ${bitfields}
**Badges:** ${userBadges}
**Current Task:** ${taskText}
**Blacklisted:** ${isBlacklisted ? 'Yes' : 'No'}
**Patreon/Github:** ${u.settings.get(UserSettings.PatreonID) ? 'Yes' : 'None'}/${
					u.settings.get(UserSettings.GithubID) ? 'Yes' : 'None'
				}
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
`;

				return msg.channel.send(str);
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
			case 'doubletime': {
				const diff = this.client.settings.get(ClientSettings.DoubleLootFinishTime) - Date.now();
				if (diff < 0) {
					return msg.channel.send(`Double loot is finished. It finished ${formatDuration(diff)} ago.`);
				}
				return msg.channel.send(`Time Remaining: ${formatDuration(diff)}`);
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
			case 'canceltask': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!input || !(input instanceof KlasaUser)) return;
				await cancelTask(input.id);
				this.client.oneCommandAtATimeCache.delete(input.id);
				this.client.secondaryUserBusyCache.delete(input.id);
				Cooldowns.delete(input.id);
				minionActivityCacheDelete(input.id);

				return msg.react(Emoji.Tick);
			}
			case 'bl':
			case 'blacklist': {
				await syncBlacklists();
				return msg.channel.send(`Users Blacklisted: ${BLACKLISTED_USERS.size}
Guilds Blacklisted: ${BLACKLISTED_GUILDS.size}`);
			}
			case 'setgh': {
				if (!input || !(input instanceof KlasaUser)) return;
				if (!str || typeof str !== 'string') return;
				const res = (await fetch(`https://api.github.com/users/${encodeURIComponent(str)}`)
					.then(res => res.json())
					.catch(() => null)) as Record<string, string> | null;
				if (!res || !res.id) {
					return msg.channel.send('Could not find user in github API. Is the username written properly?');
				}
				const alreadyHasName = await this.client.query<{ github_id: string }[]>(
					`SELECT github_id FROM users WHERE github_id = '${res.id}'`
				);
				if (alreadyHasName.length > 0) {
					return msg.channel.send('Someone already has this Github account connected.');
				}
				await input.settings.update(UserSettings.GithubID, parseInt(res.id));
				if (!msg.flagArgs.nosync) {
					await (this.client.tasks.get('patreon') as PatreonTask).syncGithub();
				}
				return msg.channel.send(`Set ${res.login}[${res.id}] as ${input.username}'s Github account.`);
			}
			case 'giveperm': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!input || !(input instanceof KlasaUser)) return;
				await input.settings.update(
					UserSettings.BitField,
					[
						...input.settings.get(UserSettings.BitField),
						BitField.HasPermanentTierOne,
						BitField.HasPermanentEventBackgrounds
					],
					{ arrayAction: 'overwrite' }
				);
				sendToChannelID(Channel.ErrorLogs, {
					content: `${msg.author.username} gave permanent t1/bgs to ${input.username}`
				});
				return msg.channel.send(`Gave permanent perks to ${input.username}.`);
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
			case 'bank': {
				if (!msg.guild || msg.guild.id !== SupportServer) return;
				if (!input || !(input instanceof KlasaUser)) return;
				return msg.channel.send(await makeBankImageKlasa({ bank: input.allItemsOwned() }));
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
			case 'dtp': {
				if (!input || !(input instanceof KlasaUser)) return;
				addPatronLootTime(input.perkTier, input);
				return msg.channel.send('Done.');
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
			case 'debugpatreon': {
				const result = await (this.client.tasks.get('patreon') as PatreonTask).fetchPatrons();
				return msg.channel.send({
					files: [new MessageAttachment(Buffer.from(JSON.stringify(result, null, 4)), 'patreon.txt')]
				});
			}
			case 'adddoubleloottime': {
				if (typeof input !== 'string' || input.length < 2) return;
				const duration = new Duration(input);
				const ms = duration.offset;
				addToDoubleLootTimer(ms, 'added by RP command');
				return msg.channel.send(`Added ${formatDuration(ms)} to the double loot timer.`);
			}
			case 'resetdoubletime': {
				await this.client.settings.update(ClientSettings.DoubleLootFinishTime, 0);
				return msg.channel.send('Reset the double loot timer.');
			}
			case 'reboot': {
				await msg.channel.send('Rebooting...');
				await Promise.all(this.client.providers.map(provider => provider.shutdown()));
				process.exit();
			}
			case 'owned': {
				if (typeof input !== 'string') return;
				const item = getOSItem(input);
				const result: any = await prisma.$queryRawUnsafe(`SELECT SUM((bank->>'${item.id}')::int) as qty
FROM users
WHERE bank->>'${item.id}' IS NOT NULL;`);
				return msg.channel.send(`There are ${result[0].qty.toLocaleString()} ${item.name} owned by everyone.`);
			}
			case 'incl': {
				if (typeof input !== 'string') return;
				const item = getOSItem(input);
				const isIron = Boolean(msg.flagArgs.iron);
				return msg.channel.send(
					`There are ${await countUsersWithItemInCl(item.id, isIron)} ${
						isIron ? 'ironmen' : 'people'
					} with atleast 1 ${item.name} in their collection log.`
				);
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
			case 'eval': {
				if (!input || typeof input !== 'string') return;
				return evalCommand(msg, input);
			}
			case 'localmahojisync': {
				await msg.channel.send('Syncing commands locally...');
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: globalClient.mahojiClient.commands.values,
					guildID: msg.guild!.id
				});
				return msg.channel.send('Locally synced slash commands.');
			}
			case 'globalcommandnuke': {
				await msg.channel.send('Syncing commands...');
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: [],
					guildID: null
				});
				return msg.channel.send('Globally nuked slash commands.');
			}
			case 'globalmahojisync': {
				await msg.channel.send('Syncing commands...');
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: globalClient.mahojiClient.commands.values,
					guildID: null
				});
				return msg.channel.send('Globally synced slash commands.');
			}
			case 'ltc': {
				let str = '';
				const results = await prisma.lootTrack.findMany();

				str += `${['id', 'cost_h', 'cost', 'loot_h', 'loot', 'per_hour_h', 'per_hour', 'ratio'].join('\t')}\n`;
				for (const res of results) {
					if (!res.total_duration || !res.total_kc) continue;
					if (Object.keys({ ...(res.cost as ItemBank), ...(res.loot as ItemBank) }).length === 0) continue;

					const marketValueCost = Math.round(
						await bankValueWithMarketPrices(prisma, new Bank(res.cost as ItemBank))
					);
					const marketValueLoot = Math.round(
						await bankValueWithMarketPrices(prisma, new Bank(res.loot as ItemBank))
					);
					const ratio = marketValueLoot / marketValueCost;

					if (!marketValueCost || !marketValueLoot || ratio === Infinity) continue;

					str += `${[
						res.id,
						toKMB(marketValueCost),
						marketValueCost,
						toKMB(marketValueLoot),
						marketValueLoot,
						toKMB(calcPerHour(marketValueLoot, res.total_duration * Time.Minute)),
						calcPerHour(marketValueLoot, res.total_duration * Time.Minute),
						ratio
					].join('\t')}\n`;
				}

				return msg.channel.send({
					files: [new MessageAttachment(Buffer.from(str), 'output.txt')]
				});
			}
			case 'blacklistsync': {
				const blacklistedUsers = globalClient.settings.get(ClientSettings.UserBlacklist);
				const blacklistedGuilds = globalClient.settings.get(ClientSettings.GuildBlacklist);
				await syncBlacklists();
				let usersAdded = 0;
				let guildsAdded = 0;
				for (const user of blacklistedUsers) {
					if (!BLACKLISTED_USERS.has(user)) {
						try {
							await roboChimpClient.blacklistedEntity.create({
								data: {
									id: BigInt(user),
									type: 'user'
								}
							});
							usersAdded++;
						} catch {}
					}
				}
				for (const guild of blacklistedGuilds) {
					if (!BLACKLISTED_GUILDS.has(guild)) {
						try {
							await roboChimpClient.blacklistedEntity.create({
								data: {
									id: BigInt(guild),
									type: 'guild'
								}
							});
							guildsAdded++;
						} catch {}
					}
				}
				return msg.channel.send(`${usersAdded} users, ${guildsAdded} guilds`);
			}
		}
	}
}
