import { MessageEmbed } from 'discord.js';
import { sleep } from 'e';
import { Command, CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { Activity, Color, Emoji, Events, SupportServer, Time } from '../../lib/constants';
import { effectiveMonsters, NightmareMonster } from '../../lib/minions/data/killableMonsters';
import forceMainServer from '../../lib/minions/decorators/forceMainServer';
import ironsCantUse from '../../lib/minions/decorators/ironsCantUse';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { KillableMonster } from '../../lib/minions/types';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	GroupMonsterActivityTaskOptions,
	NightmareActivityTaskOptions,
	RaidsTaskOptions
} from '../../lib/types/minions';
import { channelIsSendable, formatDuration, noOp, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Timeout = NodeJS.Timeout;
import { requiresMinion } from '../../lib/minions/decorators';

interface UserSentFrom {
	guild: string | undefined;
	channel: string;
}

interface QueueState {
	locked: boolean;
	users: Record<string, KlasaUser>;
	userSentFrom: Record<string, UserSentFrom>;
	firstUserJoinDate?: Date;
	lastUserJoinDate?: Date;
	startDate?: Date;
}

interface QueueProperties {
	uniqueID: number;
	name: string;
	aliases: string[];
	activeTaskType: GroupMonsterActivityTaskOptions | NightmareActivityTaskOptions | RaidsTaskOptions;
	command: Command;
	extraParams?: Record<string, any>;
	thumbnail: string;
	monster?: KillableMonster;
	minQueueSize: number;
	maxQueueSize: number;
}

export function prepareLFGMessage(
	activityName: string,
	qty: number,
	channels: Record<string, string[]> | false | undefined
) {
	const toReturn: Record<string, string> = {};
	if (!channels) return toReturn;
	for (const channel of Object.keys(channels)) {
		toReturn[channel] = `LFG mass of ${qty}x ${activityName} has returned! Here are the spoils:\n\n`;
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
		const channel = client.channels.cache.get(_channel);
		if (channelIsSendable(channel)) {
			await channel.send(lootString[_channel]);
		}
	}
	return lootString;
}

function getMonster(monsterId: number): KillableMonster {
	return <KillableMonster>effectiveMonsters.find(m => m.id === monsterId);
}

export default class extends BotCommand {
	QueueList: Record<number, QueueState> = {};
	MIN_USERS = 1;
	MAX_USERS = 20;
	WAIT_TIME = 10 * Time.Second;
	DEFAULT_MASS_CHANNEL = '858141860900110366'; // #testing-2

	availableQueues: QueueProperties[] = [
		{
			uniqueID: 1,
			name: Monsters.KrilTsutsaroth.name,
			aliases: Monsters.KrilTsutsaroth.aliases,
			activeTaskType: <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling },
			command: this.client.commands.get('groupkill')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/2/2f/K%27ril_Tsutsaroth.png',
			monster: getMonster(Monsters.KrilTsutsaroth.id),
			minQueueSize: this.MIN_USERS,
			maxQueueSize: this.MAX_USERS
		},
		{
			uniqueID: 2,
			name: Monsters.GeneralGraardor.name,
			aliases: Monsters.GeneralGraardor.aliases,
			activeTaskType: <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling },
			command: this.client.commands.get('groupkill')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/b/b8/General_Graardor.png',
			monster: getMonster(Monsters.GeneralGraardor.id),
			minQueueSize: this.MIN_USERS,
			maxQueueSize: this.MAX_USERS
		},
		{
			uniqueID: 3,
			name: Monsters.Kreearra.name,
			aliases: Monsters.Kreearra.aliases,
			activeTaskType: <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling },
			command: this.client.commands.get('groupkill')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/f/fd/Kree%27arra.png',
			monster: getMonster(Monsters.Kreearra.id),
			minQueueSize: this.MIN_USERS,
			maxQueueSize: this.MAX_USERS
		},
		{
			uniqueID: 4,
			name: Monsters.CommanderZilyana.name,
			aliases: Monsters.CommanderZilyana.aliases,
			activeTaskType: <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling },
			command: this.client.commands.get('groupkill')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/f/fb/Commander_Zilyana.png',
			monster: getMonster(Monsters.CommanderZilyana.id),
			minQueueSize: this.MIN_USERS,
			maxQueueSize: this.MAX_USERS
		},
		{
			uniqueID: 5,
			name: Monsters.CorporealBeast.name,
			aliases: Monsters.CorporealBeast.aliases,
			activeTaskType: <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling },
			command: this.client.commands.get('groupkill')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/5/5c/Corporeal_Beast.png',
			monster: getMonster(Monsters.CorporealBeast.id),
			minQueueSize: this.MIN_USERS,
			maxQueueSize: this.MAX_USERS
		},
		{
			uniqueID: 6,
			name: NightmareMonster.name,
			aliases: NightmareMonster.aliases,
			activeTaskType: <NightmareActivityTaskOptions>{ type: Activity.Nightmare },
			command: this.client.commands.get('nightmare')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
			monster: getMonster(NightmareMonster.id),
			minQueueSize: this.MIN_USERS,
			maxQueueSize: this.MAX_USERS
		},
		{
			uniqueID: 7,
			name: `${NightmareMonster.name} Small Team`,
			aliases: ['nightmare small'],
			activeTaskType: <NightmareActivityTaskOptions>{ type: Activity.Nightmare },
			command: this.client.commands.get('nightmare')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
			monster: getMonster(NightmareMonster.id),
			minQueueSize: 1,
			maxQueueSize: 5
		},
		{
			uniqueID: 8,
			name: 'The Chambers of Xeric',
			aliases: ['raids', 'chambers of xeric', 'the chambers of xeric', 'olm', 'raid1', 'cox'],
			activeTaskType: <RaidsTaskOptions>{ type: Activity.Raids },
			command: this.client.commands.get('raid')!,
			thumbnail: 'https://oldschool.runescape.wiki/images/0/04/Chambers_of_Xeric_logo.png?34a98',
			minQueueSize: 1,
			maxQueueSize: 50
		},
		{
			uniqueID: 9,
			name: 'The Chambers of Xeric (CM)',
			aliases: ['raids cm', 'chambers of xeric cm', 'the chambers of xeric cm', 'olm cm', 'raid1 cm', 'cox cm'],
			activeTaskType: <RaidsTaskOptions>{ type: Activity.Raids },
			command: this.client.commands.get('raid')!,
			extraParams: { challengeMode: true },
			thumbnail: 'https://oldschool.runescape.wiki/images/0/04/Chambers_of_Xeric_logo.png?34a98',
			minQueueSize: 1,
			maxQueueSize: 50
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
			reasons.push("You don't have a minion.");
		}

		if (user.minionIsBusy) {
			reasons.push("You are busy right now and can't join!");
		}

		if (user.isIronman) {
			reasons.push('You are an ironman! LFG is not for you.');
		}

		const [hasReqs, reason] = user.hasMonsterRequirements(monster);
		if (!hasReqs) {
			reasons.push(`${reason}`);
		}

		if (!hasEnoughFoodForMonster(monster, user, 2)) {
			throw `You don't have enough food. You need at least ${
				monster.healAmountNeeded! * 2
			} HP in food to participate.`;
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
		if (this.QueueList[queueID]) {
			const selectedQueue = this.availableQueues.find(m => m.uniqueID === queueID);
			if (selectedQueue) {
				delete this.QueueList[queueID].users[user.id];
				delete this.QueueList[queueID].userSentFrom[user.id];
				if (
					cancelTimeout &&
					Object.values(this.QueueList[queueID].users).length < (selectedQueue.minQueueSize ?? this.MIN_USERS)
				) {
					clearTimeout(queueID);
				}
			}
		}
	}

	removeUserFromAllQueues(user: KlasaUser) {
		for (const [id, data] of Object.entries(this.QueueList)) {
			if (data && data.users[user.id]) {
				this.removeUserFromQueue(user, Number(id));
			}
		}
	}

	clearTimeout(id: number) {
		clearTimeout(this.twoMinutesCheck[id]!);
		this.twoMinutesCheck[id] = null;
	}

	async handleStart(selectedQueue: QueueProperties, skipChecks = false) {
		const queue = this.QueueList[selectedQueue.uniqueID];
		let doNotClear = false;
		// Check if we can start
		if (Object.values(queue.users).length >= (selectedQueue.minQueueSize ?? this.MIN_USERS) || skipChecks) {
			// If users >= MAX_USERS (should never be higher), remove the timeout check and it now
			if (Object.values(queue.users).length >= (selectedQueue.maxQueueSize ?? this.MAX_USERS)) {
				if (this.twoMinutesCheck[selectedQueue.uniqueID] !== null) {
					this.clearTimeout(selectedQueue.uniqueID);
				}
			} else if (!this.twoMinutesCheck[selectedQueue.uniqueID]) {
				this.client.emit(
					Events.Log,
					`Starting LFG [${selectedQueue.uniqueID}] ${this.WAIT_TIME.toLocaleString()}ms countdown`
				);
				this.twoMinutesCheck[selectedQueue.uniqueID] = setTimeout(
					() => this.handleStart(selectedQueue, true),
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
					`Locking LFG [${selectedQueue.uniqueID}] usersLength[${Object.values(queue.users).length}]`
				);
				this.QueueList[selectedQueue.uniqueID].locked = true;
				// Init some vars
				const finalUsers: KlasaUser[] = [];
				// Sort users by maxTripLength to use that as the base for this LFG
				const sortedUsers = Object.values(queue.users).sort(
					(a, b) =>
						b.maxTripLength(selectedQueue.activeTaskType.type) -
						a.maxTripLength(selectedQueue.activeTaskType.type)
				);
				// Remove invalid users
				for (const user of sortedUsers) {
					// TODO create some sort of standard for all group activities to follow so the requirements
					//  can be validated
					const { allowed, reasons } = await this.validateUserReqs(user, selectedQueue.monster!);
					if (allowed) {
						finalUsers.push(user);
					} else {
						this.removeUserFromAllQueues(user);
						await user.send(
							`You were removed from the **${
								selectedQueue.name
							} LFG** as it was about to start due to the following reasons:\n - ${reasons.join('\n - ')}`
						);
						await sleep(250);
					}
				}

				// Detect if there are any person left
				if (finalUsers.length < (selectedQueue.minQueueSize ? selectedQueue.minQueueSize : this.MIN_USERS)) {
					doNotClear = true;
					this.client.emit(
						Events.Log,
						`LFG Canceled [${selectedQueue.uniqueID}] Not enough users left after validation`
					);
					return;
				}

				// Get the leader for the LFG
				const leader = finalUsers[0];

				// TODO create some sort of standard for all group activities to follow so we can easily calculate the
				//  number of activities during this trip, the duration and time per activity
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const [activitiesThisTrip, durationOfTrip, timePerActivity] = await selectedQueue.command.calcDurQty({
					users: finalUsers,
					quantity: undefined,
					lookingForGroup: selectedQueue
				});

				// Remove required items from everyone
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				await selectedQueue.command.removeItems({
					users: finalUsers,
					quantity: undefined,
					lookingForGroup: selectedQueue
				});

				const guilds: Record<string, string> = {};
				const channelsToSend: Record<string, string[]> = {};
				channelsToSend[this.DEFAULT_MASS_CHANNEL] = [];
				for (const user of finalUsers) {
					// Verifying channels to send
					const { channel } = this.QueueList[selectedQueue.uniqueID].userSentFrom[user.id];
					const { guild } = this.QueueList[selectedQueue.uniqueID].userSentFrom[user.id];
					let toSendChannel = null;
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

				await addSubTaskToActivityTask(<typeof selectedQueue.activeTaskType>{
					monsterID: selectedQueue.uniqueID,
					userID: leader.id,
					channelID: this.DEFAULT_MASS_CHANNEL,
					quantity: activitiesThisTrip,
					duration: durationOfTrip,
					type: selectedQueue.activeTaskType.type || Activity.GroupMonsterKilling,
					leader: leader.id,
					users: finalUsers.map(u => u.id),
					lookingForGroup: channelsToSend
				});

				for (const user of finalUsers) {
					// await user.incrementMinionDailyDuration(duration);
					this.removeUserFromAllQueues(user);
				}

				const endDate = new Date(Date.now() + Number(durationOfTrip));
				const embed = new MessageEmbed()
					.setColor('#ec3f3f')
					.setTitle(`${selectedQueue.name} LFG Mass has started!`)
					.addField('Duration', formatDuration(durationOfTrip), true)
					.addField('Quantity being killed', activitiesThisTrip.toLocaleString(), true)
					.addField(
						'Returning time',
						`${String(endDate.getDate()).padStart(2, '0')}/${String(endDate.getMonth() + 1).padStart(
							2,
							'0'
						)}/${String(endDate.getFullYear()).padStart(4, '0')} ${String(endDate.getHours()).padStart(
							2,
							'0'
						)}:${String(endDate.getMinutes()).padStart(2, '0')}`,
						true
					)
					.addField('Time per kill', formatDuration(timePerActivity), true)
					.addField('Original time per kill', formatDuration(selectedQueue.monster!.timeToFinish), true)
					.addField('Kills per player', `${(activitiesThisTrip / finalUsers.length).toFixed(2)}~`, true)
					.addField('Users: ', finalUsers.map(u => u.username).join(', '));

				if (selectedQueue.thumbnail) {
					embed.setThumbnail(selectedQueue.thumbnail);
				}

				for (const _channel of [...Object.keys(channelsToSend)]) {
					const channel = this.client.channels.cache.get(_channel);
					if (channelIsSendable(channel)) {
						await channel.sendEmbed(embed);
						await sleep(250);
					}
				}
			} finally {
				this.client.emit(Events.Log, `Unlocking LFG [${selectedQueue.uniqueID}]`);
				this.clearTimeout(selectedQueue.uniqueID);
				// Allows canceled mass to keep the user here
				if (!doNotClear) {
					this.QueueList[selectedQueue.uniqueID].users = {};
					this.QueueList[selectedQueue.uniqueID].userSentFrom = {};
				}
				this.QueueList[selectedQueue.uniqueID].locked = false;
				this.QueueList[selectedQueue.uniqueID].lastUserJoinDate = undefined;
				this.QueueList[selectedQueue.uniqueID].firstUserJoinDate = undefined;
				this.QueueList[selectedQueue.uniqueID].startDate = undefined;
			}
		}
	}

	@forceMainServer
	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async run(msg: KlasaMessage) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle('Currently open LFG!')
			.setDescription(
				'Below is a description of all queues that can be done in groups and how many users are on the queue.' +
					'\nEach queue has a minimum and maximum size.' +
					`\nWhen the queue reaches the minimum size, it'll wait ${formatDuration(
						this.WAIT_TIME
					)} before starting.` +
					"\n**WARNING**: Do not be busy when the activity is about to start or you'll be removed from it!"
			);
		for (const _queue of this.availableQueues) {
			const smallestAlias = _queue.aliases.sort((a, b) => a.length - b.length)[0] ?? _queue.name;
			const joined = this.QueueList[_queue.uniqueID] && this.QueueList[_queue.uniqueID].users[msg.author.id];
			const title = _queue.name + (joined ? ' [JOINED]' : '');
			embed.addField(
				title,
				`On queue: ${
					this.QueueList[_queue.uniqueID] ? Object.values(this.QueueList[_queue.uniqueID].users).length : 0
				}` +
					`\n\`${prefix}lfg ${joined ? 'leave' : 'join'} ${smallestAlias}\`` +
					`\nStarts in: ${this.getTimeLeft(
						this.QueueList[_queue.uniqueID] ? this.QueueList[_queue.uniqueID].startDate : undefined
					)}` +
					`\nMin/Max users: ${_queue.minQueueSize ?? this.MIN_USERS}/${
						_queue.maxQueueSize ?? this.MAX_USERS
					}`,
				true
			);
		}
		for (let i = 0; i < Math.ceil(this.availableQueues.length / 3) * 3 - this.availableQueues.length; i++) {
			embed.addField('\u200b', '\u200b', true);
		}
		// large footer to allow max embeed size
		embed.setFooter(`${'\u3000'.repeat(200 /* any big number works too*/)}`);
		await msg.channel.send(embed);
	}

	@forceMainServer
	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async join(msg: KlasaMessage, [queue = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const selectedQueue = this.availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);

		if (!selectedQueue) {
			return msg.channel.send(`This is not a LFG monster. Run \`${prefix}lfg\` for more information.`);
		}

		if (!this.QueueList[selectedQueue.uniqueID]) {
			// Init
			this.QueueList[selectedQueue.uniqueID] = {
				locked: false,
				users: {},
				userSentFrom: {}
			};
		}

		if (this.QueueList[selectedQueue.uniqueID].locked) {
			return msg.channel.send(
				"You can' join this mass at this moment as it is already starting Try again in a few moments."
			);
		}

		if (this.QueueList[selectedQueue.uniqueID].users[msg.author.id]) {
			return msg.channel.send('You are already on this LFG.');
		}

		// Validate if user can actually join this LFG

		// TODO create some sort of standard for all group activities to follow so the requirements
		//  can be validated
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const { allowed, reasons } = selectedQueue.command.checkReqs({
			users: [msg.author],
			lookingForGroup: selectedQueue,
			quantity: 2
		});
		if (!allowed) {
			if (!channelIsSendable(msg.author.dmChannel!)) {
				return msg.channel.send(
					`:RSSad:\nYou do not meet one or more requisites to join this LFG:\n - ${reasons}`
				);
			}
			return msg.author.send(`:RSSad:\nYou do not meet one or more requisites to join this LFG:\n - ${reasons}`);
		}

		// If no users, set the join dates
		if (Object.values(this.QueueList[selectedQueue.uniqueID].users).length === 0) {
			this.QueueList[selectedQueue.uniqueID].firstUserJoinDate = new Date();
			this.QueueList[selectedQueue.uniqueID].lastUserJoinDate = new Date();
		}

		// Add user
		this.QueueList[selectedQueue.uniqueID].users[msg.author.id] = msg.author;
		this.QueueList[selectedQueue.uniqueID].userSentFrom[msg.author.id] = {
			channel: msg.channel.id,
			guild: msg.guild?.id
		};

		await msg.channel.send(
			`You joined the ${selectedQueue.name} LFG. To leave, type \`${prefix}lfg leave ${queue}\` or \`${prefix}lfg leave all\``
		);
		return this.handleStart(selectedQueue);
	}

	@forceMainServer
	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async leave(msg: KlasaMessage, [queue = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const selectedQueue = this.availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);

		if (!selectedQueue) {
			// Allows the user to leave all queues
			if (queue === 'all') {
				this.removeUserFromAllQueues(msg.author);
				return msg.channel.send('You left all LFG queues.');
			}
			return msg.channel.send(`This is not a LFG valid queue. Run \`${prefix}lfg\` for more information.`);
		}

		const user = this.QueueList[selectedQueue.uniqueID]
			? this.QueueList[selectedQueue.uniqueID].users[msg.author.id]
			: false;
		if (user) {
			this.removeUserFromQueue(msg.author, selectedQueue.uniqueID, true);
			await msg.channel.send(`You left the ${selectedQueue.name} LFG.`);
		} else {
			return msg.channel.send('You are not in this LFG group!');
		}
	}
}
