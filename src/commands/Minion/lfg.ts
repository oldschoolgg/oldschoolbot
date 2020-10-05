import { MessageEmbed } from 'discord.js';
import { sleep } from 'e';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser, TaskOptions } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Color, Emoji, Events, SupportServer, Tasks, Time } from '../../lib/constants';
import killableMonsters, { NightmareMonster } from '../../lib/minions/data/killableMonsters';
import ironsCantUse from '../../lib/minions/decorators/ironsCantUse';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { formatDuration, noOp, queuedMessageSend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
// eslint-disable-next-line no-undef
import Timeout = NodeJS.Timeout;
import { Monsters } from 'oldschooljs';

import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';

interface UserSentFrom {
	guild: string | undefined;
	channel: string;
}

interface LFGMonster {
	locked: boolean;
	users: Record<string, KlasaUser>;
	userSentFrom: Record<string, UserSentFrom>;
	firstUserJoinDate?: Date;
	lastUserJoinDate?: Date;
	startDate?: Date;
}

interface MonterCustomProperties {
	taskName?: Tasks;
	activityName?: Activity;
	uniqueID?: number;
	taskOptions?: TaskOptions;
	minQueueSize?: number;
	maxQueueSize?: number;
	thumbnail?: string;
}

interface AllowedMonsters extends KillableMonster, MonterCustomProperties {
	calcDurQty?: (users: KlasaUser[]) => [number, number, number];
}

export function prepareLFGMessage(
	activityName: string,
	qty: number,
	channels: Record<string, string[]> | false | undefined
) {
	const toReturn: Record<string, string> = {};
	if (!channels) return toReturn;
	for (const channel of Object.keys(channels)) {
		toReturn[
			channel
		] = `LFG mass of ${qty}x ${activityName} has returned! Here are the spoils:\n\n`;
	}
	return toReturn;
}

export function addLFGLoot(
	lootString: Record<string, string>,
	isPurple: boolean,
	user: KlasaUser,
	readableList: string,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += `${isPurple ? Emoji.Purple : ''} **${
			channel[1].includes(user.id) ? user : user.username
		} received:** ||${readableList}||\n`;
	}
	return lootString;
}

export function addLFGText(
	lootString: Record<string, string>,
	text: string,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += text;
	}
	return lootString;
}

export async function addLFGNoDrops(
	lootString: Record<string, string>,
	client: KlasaClient,
	users: string[],
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return lootString;
	const klasaUsers: KlasaUser[] = [];
	for (const u of users) {
		const _u = await client.users.fetch(u).catch(noOp);
		if (_u) klasaUsers.push(_u);
	}
	for (const channel of Object.entries(channels)) {
		lootString[channel[0]] += `${klasaUsers
			.map(user => (channel[1].includes(user.id) ? `<@${user.id}>` : user.username))
			.join(', ')} - Got no loot, sad!`;
	}
	return lootString;
}

export async function sendLFGMessages(
	lootString: Record<string, string>,
	client: KlasaClient,
	channels: Record<string, string[]> | false | undefined
) {
	if (!channels) return false;
	for (const _channel of Object.keys(channels)) {
		const channel = client.channels.get(_channel);
		if (channelIsSendable(channel)) {
			await queuedMessageSend(client, channel.id, lootString[_channel]);
		}
	}
	return lootString;
}

export default class extends BotCommand {
	LFGList: Record<number, LFGMonster> = {};
	MIN_USERS = 20;
	MAX_USERS = 50;
	WAIT_TIME = 2 * Time.Minute;
	DEFAULT_MASS_CHANNEL = '755074115978657894'; // #testing-2

	override: Record<number, MonterCustomProperties> = {
		[Monsters.KrilTsutsaroth.id]: {
			thumbnail: 'https://oldschool.runescape.wiki/images/2/2f/K%27ril_Tsutsaroth.png'
		},
		[Monsters.GeneralGraardor.id]: {
			thumbnail: 'https://oldschool.runescape.wiki/images/b/b8/General_Graardor.png'
		},
		[Monsters.Kreearra.id]: {
			thumbnail: 'https://oldschool.runescape.wiki/images/f/fd/Kree%27arra.png'
		},
		[Monsters.CommanderZilyana.id]: {
			thumbnail: 'https://oldschool.runescape.wiki/images/f/fb/Commander_Zilyana.png'
		},
		[Monsters.CorporealBeast.id]: {
			thumbnail: 'https://oldschool.runescape.wiki/images/5/5c/Corporeal_Beast.png'
		},
		[NightmareMonster.id]: {
			thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
			taskName: Tasks.MinigameTicker,
			activityName: Activity.Nightmare,
			uniqueID: MinigameIDsEnum.Nightmare,
			minQueueSize: 2,
			maxQueueSize: 10
		}
	};

	allowedMonsters: AllowedMonsters[] = [
		...killableMonsters
			.filter(m => m.groupKillable)
			.map(m => {
				if (this.override[m.id]) {
					m = { ...m, ...this.override[m.id] };
				}
				return m;
			}),
		{
			...NightmareMonster,
			calcDurQty: (users: KlasaUser[]) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				return this.client.commands.get('nightmare')!.getQtyDurationPerKillTime(users);
			},
			...this.override[NightmareMonster.id]
		}
	];

	twoMinutesCheck: Record<number, Timeout | null> = {};

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[join|leave] [name:...string]',
			cooldown: 1,
			oneAtTime: true,
			usageDelim: ' ',
			subcommands: true
		});
		this.enabled = !this.client.production;
	}

	async validateUserReqs(user: KlasaUser, monster: KillableMonster) {
		const reasons: string[] = [];
		if (!user.hasMinion) {
			reasons.push(`You don't have a minion.`);
		}

		if (user.minionIsBusy) {
			reasons.push(`You are busy right now and can't join!`);
		}

		if (user.isIronman) {
			reasons.push(`You are an ironman! LFG is not for you.`);
		}

		const [hasReqs, reason] = user.hasMonsterRequirements(monster);
		if (!hasReqs) {
			reasons.push(`${reason}`);
		}

		if (!hasEnoughFoodForMonster(monster, user, 2)) {
			throw `You don't have enough food. You need at least ${monster.healAmountNeeded! *
				2} HP in food to participate.`;
		}
		return {
			allowed: reasons.length <= 0,
			reasons
		};
	}

	getTimeLeft(date: Date | undefined) {
		if (!date) return '-';
		return formatDuration(Date.now() - date.getTime());
	}

	removeUserFromQueue(user: KlasaUser, queueID: number, cancelTimeout = false) {
		if (this.LFGList[queueID]) {
			const monster = this.allowedMonsters.find(m => m.id === queueID);
			delete this.LFGList[queueID].users[user.id];
			delete this.LFGList[queueID].userSentFrom[user.id];
			if (
				cancelTimeout &&
				Object.values(this.LFGList[queueID].users).length <
					(monster?.minQueueSize ?? this.MIN_USERS)
			) {
				clearTimeout(queueID);
			}
		}
	}

	removeUserFromAllQueues(user: KlasaUser) {
		for (const [id, data] of Object.entries(this.LFGList)) {
			if (data && data.users[user.id]) {
				this.removeUserFromQueue(user, Number(id));
			}
		}
	}

	clearTimeout(id: number) {
		clearTimeout(this.twoMinutesCheck[id]!);
		this.twoMinutesCheck[id] = null;
	}

	async handleStart(monster: AllowedMonsters, skipChecks = false) {
		const queue = this.LFGList[monster.id];
		let doNotClear = false;
		// Check if we can start
		if (
			Object.values(queue.users).length >= (monster.minQueueSize ?? this.MIN_USERS) ||
			skipChecks
		) {
			// If users >= MAX_USERS (should never be higher), remove the timeout check and it now
			if (Object.values(queue.users).length >= (monster.maxQueueSize ?? this.MAX_USERS)) {
				if (this.twoMinutesCheck[monster.id] !== null) {
					this.clearTimeout(monster.id);
				}
			} else if (!this.twoMinutesCheck[monster.id]) {
				this.client.emit(
					Events.Log,
					`Starting LFG [${monster.id}] ${this.WAIT_TIME.toLocaleString()}ms countdown`
				);
				this.twoMinutesCheck[monster.id] = setTimeout(
					() => this.handleStart(monster, true),
					this.WAIT_TIME
				);
				queue.startDate = new Date(Date.now() + this.WAIT_TIME);
				return;
			} else if (!skipChecks) {
				return;
			}
			try {
				// Locks the LFG until all the preparations are done
				this.client.emit(
					Events.Log,
					`Locking LFG [${monster.id}] usersLength[${Object.values(queue.users).length}]`
				);
				this.LFGList[monster.id].locked = true;
				// Init some vars
				const finalUsers: KlasaUser[] = [];
				// Sort users by maxTripLength to use that as the base for this LFG
				const sortedUsers = Object.values(queue.users).sort(
					(a, b) => b.maxTripLength - a.maxTripLength
				);
				// Remove invalid users
				for (const user of sortedUsers) {
					const { allowed, reasons } = await this.validateUserReqs(user, monster);
					if (allowed) {
						finalUsers.push(user);
					} else {
						this.removeUserFromAllQueues(user);
						await user.send(
							`You were removed from the **${
								monster.name
							} LFG** as it was about to start due to the following reasons:\n - ${reasons.join(
								'\n - '
							)}`
						);
						await sleep(250);
					}
				}

				// Detect if there are any person left
				if (finalUsers.length < (monster.minQueueSize ? monster.minQueueSize : 2)) {
					doNotClear = true;
					this.client.emit(
						Events.Log,
						`LFG Canceled [${monster.id}] Not enough users left after validation`
					);
					return;
				}

				// Get the leader for the LFG
				const leader = finalUsers[0];

				const [quantity, duration, perKillTime] = monster.calcDurQty
					? monster.calcDurQty(finalUsers)
					: calcDurQty(finalUsers, monster, undefined);

				const guilds: Record<string, string> = {};
				const channelsToSend: Record<string, string[]> = {};
				channelsToSend[this.DEFAULT_MASS_CHANNEL] = [];
				for (const user of finalUsers) {
					// Verifying channels to send
					const { channel } = this.LFGList[monster.id].userSentFrom[user.id];
					const { guild } = this.LFGList[monster.id].userSentFrom[user.id];
					let toSendChannel;
					// Limits 1 message per server
					// Not guild means DM
					if (!guild) {
						toSendChannel = channel;
					} else if (guilds[guild]) {
						toSendChannel = guilds[guild];
					} else {
						// If sent on the support server, forces the result to be on the mass channel
						if (guild === SupportServer) {
							guilds[guild] = this.DEFAULT_MASS_CHANNEL;
						} else {
							guilds[guild] = channel;
						}
						toSendChannel = channel;
					}
					if (!channelsToSend[toSendChannel]) channelsToSend[toSendChannel] = [];
					channelsToSend[toSendChannel].push(user.id);
				}

				if (
					monster.taskName &&
					monster.activityName &&
					monster.uniqueID &&
					monster.taskName === Tasks.MinigameTicker
				) {
					await addSubTaskToActivityTask<MinigameActivityTaskOptions>(
						this.client,
						monster.taskName,
						{
							userID: leader.id,
							channelID: this.DEFAULT_MASS_CHANNEL,
							quantity,
							duration,
							type: monster.activityName,
							// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
							// @ts-ignore
							leader: leader.id,
							users: finalUsers.map(u => u.id),
							minigameID: monster.uniqueID,
							lfg: channelsToSend
						}
					);
				} else {
					await addSubTaskToActivityTask<GroupMonsterActivityTaskOptions>(
						this.client,
						Tasks.MonsterKillingTicker,
						{
							monsterID: monster.id,
							userID: leader.id,
							channelID: this.DEFAULT_MASS_CHANNEL,
							quantity,
							duration,
							type: Activity.GroupMonsterKilling,
							leader: leader.id,
							users: finalUsers.map(u => u.id),
							lfg: channelsToSend
						}
					);
				}

				for (const user of finalUsers) {
					await user.incrementMinionDailyDuration(duration);
					this.removeUserFromAllQueues(user);
				}

				const endDate = new Date(Date.now() + duration);
				const embed = new MessageEmbed()
					.setColor('#ec3f3f')
					.setTitle(`${monster.name} LFG Mass has started!`)
					.addField('Duration', formatDuration(duration), true)
					.addField('Quantity being killed', quantity.toLocaleString(), true)
					.addField(
						'Returning time',
						`${String(endDate.getDate()).padStart(2, '0')}/${String(
							endDate.getMonth() + 1
						).padStart(2, '0')}/${String(endDate.getFullYear()).padStart(
							4,
							'0'
						)} ${String(endDate.getHours()).padStart(2, '0')}:${String(
							endDate.getMinutes()
						).padStart(2, '0')}`,
						true
					)
					.addField('Time per kill', formatDuration(perKillTime), true)
					.addField('Original time per kill', formatDuration(monster.timeToFinish), true)
					.addField(
						'Kills per player',
						`${(quantity / finalUsers.length).toFixed(2)}~`,
						true
					)
					.addField('Users: ', finalUsers.map(u => u.username).join(', '));

				if (this.override[monster.id] && this.override[monster.id].thumbnail) {
					embed.setThumbnail(this.override[monster.id].thumbnail!);
				}

				for (const _channel of [...Object.keys(channelsToSend)]) {
					const channel = this.client.channels.get(_channel);
					if (channelIsSendable(channel)) {
						await channel.sendEmbed(embed);
						await sleep(250);
					}
				}
			} finally {
				this.client.emit(Events.Log, `Unlocking LFG [${monster.id}]`);
				this.clearTimeout(monster.id);
				// Allows canceled mass to keep the user here
				if (!doNotClear) {
					this.LFGList[monster.id].users = {};
					this.LFGList[monster.id].userSentFrom = {};
				}
				this.LFGList[monster.id].locked = false;
				this.LFGList[monster.id].lastUserJoinDate = undefined;
				this.LFGList[monster.id].firstUserJoinDate = undefined;
				this.LFGList[monster.id].startDate = undefined;
			}
		}
	}

	@ironsCantUse
	async run(msg: KlasaMessage) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle(`Currently open LFG!`)
			.setDescription(
				`Below is a description of all monsters that can be killed in groups and how many users are on the queue.` +
					`\nEach queue has a minimum and maximum queue size.` +
					`\nWhen the queue reaches the minimum size, it'll wait ${formatDuration(
						this.WAIT_TIME
					)} before starting.` +
					`\n**WARNING**: Do not be busy when the activity is about to start or you'll be removed from it!`
			)
			.setTimestamp();
		for (const _monster of this.allowedMonsters) {
			const smallestAlias =
				_monster.aliases.sort((a, b) => a.length - b.length)[0] ?? _monster.name;
			const joined =
				this.LFGList[_monster.id] && this.LFGList[_monster.id].users[msg.author.id];
			const title = _monster.name + (joined ? ` [JOINED]` : ``);
			embed.addField(
				title,
				`On queue: ${
					this.LFGList[_monster.id]
						? Object.values(this.LFGList[_monster.id]?.users).length
						: 0
				}` +
					`\n\`${prefix}lfg ${joined ? 'leave' : 'join'} ${smallestAlias}\`` +
					`\nStarts in: ${this.getTimeLeft(
						this.LFGList[_monster.id] ? this.LFGList[_monster.id].startDate : undefined
					)}` +
					`\nMin/Max users: ${_monster.minQueueSize ??
						this.MIN_USERS}/${_monster.maxQueueSize ?? this.MAX_USERS}`,
				true
			);
		}
		for (
			let i = 0;
			i < Math.ceil(this.allowedMonsters.length / 3) * 3 - this.allowedMonsters.length;
			i++
		) {
			embed.addBlankField(true);
		}
		await msg.channel.send(embed);
	}

	@minionNotBusy
	async join(msg: KlasaMessage, [monster = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const groupKillMonster = this.allowedMonsters.find(
			m =>
				stringMatches(m.name, monster) ||
				(m.aliases && m.aliases.some(a => stringMatches(a, monster)))
		);

		if (!groupKillMonster) {
			return msg.channel.send(
				`This is not a LFG monster. Run \`${prefix}lfg\` for more information.`
			);
		}

		if (!this.LFGList[groupKillMonster.id]) {
			// Init
			this.LFGList[groupKillMonster.id] = {
				locked: false,
				users: {},
				userSentFrom: {}
			};
		}

		if (this.LFGList[groupKillMonster.id].locked) {
			return msg.channel.send(
				`You can' join this mass at this moment as it is already starting Try again in a few moments.`
			);
		}

		if (this.LFGList[groupKillMonster.id].users[msg.author.id]) {
			return msg.channel.send(`You are already on this LFG.`);
		}

		// Validate if user can actually join this LFG
		const { allowed, reasons } = await this.validateUserReqs(msg.author, groupKillMonster);
		if (!allowed) {
			if (!channelIsSendable(msg.author.dmChannel)) {
				return msg.channel.send(
					`:RSSad:\nYou do not meet one or more requisites to join this LFG:\n - ${reasons.join(
						'\n - '
					)}`
				);
			}
			return msg.author.send(
				`:RSSad:\nYou do not meet one or more requisites to join this LFG:\n - ${reasons.join(
					'\n - '
				)}`
			);
		}

		// If no users, set the join dates
		if (Object.values(this.LFGList[groupKillMonster.id].users).length === 0) {
			this.LFGList[groupKillMonster.id].firstUserJoinDate = new Date();
			this.LFGList[groupKillMonster.id].lastUserJoinDate = new Date();
		}

		// Add user
		this.LFGList[groupKillMonster.id].users[msg.author.id] = msg.author;
		this.LFGList[groupKillMonster.id].userSentFrom[msg.author.id] = {
			channel: msg.channel.id,
			guild: msg.guild?.id
		};

		await msg.channel.send(
			`You joined the ${groupKillMonster.name} LFG. To leave, type \`${prefix}lfg leave ${monster}\` or \`${prefix}lfg leave all\``
		);
		return this.handleStart(groupKillMonster);
	}

	@minionNotBusy
	async leave(msg: KlasaMessage, [monster = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const groupKillMonster = this.allowedMonsters.find(
			m =>
				stringMatches(m.name, monster) ||
				(m.aliases && m.aliases.some(a => stringMatches(a, monster)))
		);

		if (!groupKillMonster) {
			// Allows the user to leave all queues
			if (monster === 'all') {
				this.removeUserFromAllQueues(msg.author);
				return msg.channel.send(`You left all PFG queues.`);
			}
			return msg.channel.send(
				`This is not a LFG monster. Run \`${prefix}lfg\` for more information.`
			);
		}

		const user = this.LFGList[groupKillMonster.id]
			? this.LFGList[groupKillMonster.id].users[msg.author.id]
			: false;
		if (user) {
			this.removeUserFromQueue(msg.author, groupKillMonster.id, true);
			await msg.channel.send(`You left the ${groupKillMonster.name} LFG.`);
		} else {
			return msg.channel.send(`You are not in this LFG group!`);
		}
	}
}
