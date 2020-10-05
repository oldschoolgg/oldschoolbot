import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Color, Events, SupportServer, Tasks, Time } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import ironsCantUse from '../../lib/minions/decorators/ironsCantUse';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
// eslint-disable-next-line no-undef
import Timeout = NodeJS.Timeout;
import { sleep } from 'e';

import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import { channelIsSendable } from '../../lib/util/channelIsSendable';

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

export default class extends BotCommand {
	LFGList: Record<number, LFGMonster> = {};
	MIN_USERS = 2;
	MAX_USERS = 5;
	WAIT_TIME = 30 * Time.Second;
	DEFAULT_MASS_CHANNEL = '755074115978657894';

	private twoMinutesCheck: Record<number, Timeout | null> = {};

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
			throw `You don't have enough food. You need at least ${monster?.healAmountNeeded! *
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

	removeUserFromAllQueues(user: KlasaUser) {
		for (const [id, data] of Object.entries(this.LFGList)) {
			if (data && data.users[user.id]) {
				delete this.LFGList[Number(id)].users[user.id];
				delete this.LFGList[Number(id)].userSentFrom[user.id];
			}
		}
	}

	clearTimeout(id: number) {
		clearTimeout(this.twoMinutesCheck[id]!);
		this.twoMinutesCheck[id] = null;
	}

	async handleStart(monster: KillableMonster, skipChecks = false) {
		const queue = this.LFGList[monster.id];
		// Check if we can start
		if (Object.values(queue.users).length >= this.MIN_USERS || skipChecks) {
			// If users >= MAX_USERS (should never be higher), remove the timeout check and it now
			if (Object.values(queue.users).length >= this.MAX_USERS) {
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
				if (finalUsers.length === 0) {
					this.client.emit(
						Events.Log,
						`LFG Canceled [${monster.id}] No users left after validation`
					);
					return;
				}

				// Get the leader for the LFG
				const leader = finalUsers[0];

				const [quantity, duration, perKillTime] = calcDurQty(
					finalUsers,
					monster,
					undefined
				);

				const guilds: Record<string, string> = {};
				const channelsToSend: Record<string, string[]> = {};
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
						'Aprox. returning time',
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
						'Aprox. kills per player',
						(quantity / finalUsers.length).toFixed(2),
						true
					)
					.addField('Users: ', finalUsers.map(u => u.username).join(', '));

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
				this.LFGList[monster.id].users = {};
				this.LFGList[monster.id].userSentFrom = {};
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
		const groupKillMonsters = killableMonsters.filter(m => m.groupKillable);
		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle(`Currently open LFG!`)
			.setDescription(
				`Below is a description of all monsters that can be killed in groups and how many users are on the queue.` +
					`\nEach queue has a minimum queue size of ${this.MIN_USERS} and maximum of ${this.MAX_USERS}.` +
					` When the queue reaches the minimum size, it'll wait 2 minutes before starting.` +
					`\nBe cautious to not be busy when the activity is about to start or you'll be automatically removed from it!`
			);
		for (const _monster of groupKillMonsters) {
			const smallestAlias =
				_monster.aliases.sort((a, b) => a.length - b.length)[0] ?? _monster.name;
			const joined =
				this.LFGList[_monster.id] && this.LFGList[_monster.id].users[msg.author.id];
			const title = _monster.name + (joined ? ` [JOINED]` : ``);
			embed.addField(
				title,
				`Currently on queue: ${
					this.LFGList[_monster.id]
						? Object.values(this.LFGList[_monster.id]?.users).length
						: 0
				}` +
					`\n\`${prefix}lfg ${joined ? 'leave' : 'join'} ${smallestAlias}\`` +
					`\nTime till start: ${this.getTimeLeft(
						this.LFGList[_monster.id] ? this.LFGList[_monster.id].startDate : undefined
					)}`,
				true
			);
		}
		for (
			let i = 0;
			i < Math.ceil(groupKillMonsters.length / 3) * 3 - groupKillMonsters.length;
			i++
		) {
			embed.addBlankField(true);
		}
		await msg.channel.send(embed);
	}

	async join(msg: KlasaMessage, [monster = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const groupKillMonster = killableMonsters.find(
			m =>
				m.groupKillable &&
				(stringMatches(m.name, monster) ||
					(m.aliases && m.aliases.some(a => stringMatches(a, monster))))
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

	async leave(msg: KlasaMessage, [monster = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const groupKillMonster = killableMonsters.find(
			m =>
				m.groupKillable &&
				(stringMatches(m.name, monster) ||
					(m.aliases && m.aliases.some(a => stringMatches(a, monster))))
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
			delete this.LFGList[groupKillMonster.id].users[msg.author.id];
			delete this.LFGList[groupKillMonster.id].userSentFrom[msg.author.id];
			await msg.channel.send(`You left the ${groupKillMonster.name} LFG.`);
		} else {
			return msg.channel.send(`You are not in this LFG group!`);
		}
	}
}
