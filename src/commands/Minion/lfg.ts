import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { Activity, Color, Events, SupportServer, Time } from '../../lib/constants';
import ChambersOfXeric from '../../lib/lfg/ChambersOfXeric';
import Default from '../../lib/lfg/Default';
import LfgInterface from '../../lib/lfg/LfgInterface';
import { getMonster, sendLFGErrorMessage } from '../../lib/lfg/LfgUtils';
import Nightmare from '../../lib/lfg/Nightmare';
import { NightmareMonster } from '../../lib/minions/data/killableMonsters';
import { requiresMinion } from '../../lib/minions/decorators';
import ironsCantUse from '../../lib/minions/decorators/ironsCantUse';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import { KillableMonster } from '../../lib/minions/types';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { LfgActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable, formatDuration, sleep, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Timeout = NodeJS.Timeout;

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
	queueBase: QueueProperties;
	soloStart: boolean;
}

export interface QueueProperties {
	uniqueID: number;
	name: string;
	aliases: string[];
	lfgClass: LfgInterface;
	extraParams?: Record<string, any>;
	thumbnail: string;
	monster?: KillableMonster;
	minQueueSize: number;
	maxQueueSize: number;
	private?: boolean;
	allowSolo: boolean;
}

const MIN_USERS = 2;
const MAX_USERS = 2;
const QUEUE_LIST: Record<number, QueueState> = {};
const WAIT_TIME = 10 * Time.Second;
const DEFAULT_MASS_CHANNEL = '858141860900110366'; // #testing-2
const QUEUE_AUTO_START: Record<number, Timeout | null> = {};

export const availableQueues: QueueProperties[] = [
	{
		uniqueID: 1,
		name: Monsters.KrilTsutsaroth.name,
		aliases: Monsters.KrilTsutsaroth.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/2/2f/K%27ril_Tsutsaroth.png',
		monster: getMonster(Monsters.KrilTsutsaroth.id),
		minQueueSize: MIN_USERS,
		maxQueueSize: MAX_USERS,
		allowSolo: true
	},
	{
		uniqueID: 2,
		name: Monsters.GeneralGraardor.name,
		aliases: Monsters.GeneralGraardor.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/b/b8/General_Graardor.png',
		monster: getMonster(Monsters.GeneralGraardor.id),
		minQueueSize: MIN_USERS,
		maxQueueSize: MAX_USERS,
		allowSolo: true
	},
	{
		uniqueID: 3,
		name: Monsters.Kreearra.name,
		aliases: Monsters.Kreearra.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/f/fd/Kree%27arra.png',
		monster: getMonster(Monsters.Kreearra.id),
		minQueueSize: MIN_USERS,
		maxQueueSize: MAX_USERS,
		allowSolo: true
	},
	{
		uniqueID: 4,
		name: Monsters.CommanderZilyana.name,
		aliases: Monsters.CommanderZilyana.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/f/fb/Commander_Zilyana.png',
		monster: getMonster(Monsters.CommanderZilyana.id),
		minQueueSize: MIN_USERS,
		maxQueueSize: MAX_USERS,
		allowSolo: true
	},
	{
		uniqueID: 5,
		name: Monsters.CorporealBeast.name,
		aliases: Monsters.CorporealBeast.aliases,
		lfgClass: new Default(),
		thumbnail: 'https://oldschool.runescape.wiki/images/5/5c/Corporeal_Beast.png',
		monster: getMonster(Monsters.CorporealBeast.id),
		minQueueSize: MIN_USERS,
		maxQueueSize: MAX_USERS,
		allowSolo: true
	},
	{
		uniqueID: 6,
		name: NightmareMonster.name,
		aliases: NightmareMonster.aliases,
		lfgClass: new Nightmare(),
		thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
		monster: getMonster(NightmareMonster.id),
		minQueueSize: 1,
		maxQueueSize: 10,
		allowSolo: true
	},
	{
		uniqueID: 7,
		name: `${NightmareMonster.name} (Small)`,
		aliases: ['nightmare small'],
		lfgClass: new Nightmare(),
		thumbnail: 'https://oldschool.runescape.wiki/images/7/7d/The_Nightmare.png',
		monster: getMonster(NightmareMonster.id),
		minQueueSize: 1,
		maxQueueSize: 5,
		allowSolo: false
	},
	{
		uniqueID: 8,
		name: 'The Chambers of Xeric',
		aliases: ['raids', 'chambers of xeric', 'the chambers of xeric', 'raid1', 'cox'],
		lfgClass: new ChambersOfXeric(),
		extraParams: { isChallengeMode: false },
		thumbnail: 'https://oldschool.runescape.wiki/images/0/04/Chambers_of_Xeric_logo.png?34a98',
		minQueueSize: 1,
		maxQueueSize: 15,
		allowSolo: true
	},
	{
		uniqueID: 9,
		name: 'The Chambers of Xeric (CM)',
		aliases: ['raids cm', 'chambers of xeric cm', 'the chambers of xeric cm', 'raid1 cm', 'cox cm'],
		lfgClass: new ChambersOfXeric(),
		extraParams: { isChallengeMode: true },
		thumbnail: 'https://imgur.com/Y3HroYR.png',
		minQueueSize: 1,
		maxQueueSize: 15,
		allowSolo: true
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[join|leave] [name:...string]',
			aliases: ['lfgsolo'],
			cooldown: 1,
			oneAtTime: true,
			usageDelim: ' ',
			subcommands: true
		});
		this.enabled = !this.client.production;
	}

	getTimeLeft(date: Date | undefined) {
		if (!date) return '-';
		return formatDuration(Date.now() - date.getTime());
	}

	removeUserFromQueue(user: KlasaUser, queueID: number, cancelTimeout = false) {
		if (QUEUE_LIST[queueID]) {
			const selectedQueue = QUEUE_LIST[queueID].queueBase;
			if (selectedQueue) {
				delete QUEUE_LIST[queueID].users[user.id];
				delete QUEUE_LIST[queueID].userSentFrom[user.id];
				if (
					cancelTimeout &&
					Object.values(QUEUE_LIST[queueID].users).length < (selectedQueue.minQueueSize ?? MIN_USERS)
				) {
					clearTimeout(queueID);
				}
			}
		}
	}

	removeUserFromAllQueues(user: KlasaUser) {
		for (const [id, data] of Object.entries(QUEUE_LIST)) {
			if (data && data.users[user.id]) {
				this.removeUserFromQueue(user, Number(id));
			}
		}
	}

	clearTimeout(id: number) {
		clearTimeout(QUEUE_AUTO_START[id]!);
		QUEUE_AUTO_START[id] = null;
	}

	async handleStart(queueID: number, skipChecks = false) {
		const queue = QUEUE_LIST[queueID];
		const selectedQueue = queue.queueBase;
		let doNotClear = false;
		const channelsToSend: Record<string, string[]> = {};
		// Check if we can start
		if (
			Object.values(queue.users).length >= (selectedQueue.minQueueSize ?? MIN_USERS) ||
			skipChecks ||
			queue.soloStart
		) {
			// Skip queue checks for solo content
			if (!queue.soloStart) {
				// If users >= MAX_USERS (should never be higher), remove the timeout check and it now
				if (Object.values(queue.users).length >= (selectedQueue.maxQueueSize ?? MAX_USERS)) {
					if (QUEUE_AUTO_START[queueID] !== null) {
						this.clearTimeout(queueID);
					}
				} else if (!QUEUE_AUTO_START[queueID]) {
					this.client.emit(Events.Log, `Starting LFG [${queueID}] ${WAIT_TIME.toLocaleString()}ms countdown`);
					QUEUE_AUTO_START[queueID] = setTimeout(() => this.handleStart(queueID, true), WAIT_TIME);
					queue.startDate = new Date(Date.now() + WAIT_TIME);
					return;
				} else if (!skipChecks) {
					return;
				}
			}
			try {
				// Locks the LFG until all the preparations are done
				this.client.emit(
					Events.Log,
					`Locking LFG [${queueID}] usersLength[${Object.values(queue.users).length}]`
				);
				queue.locked = true;

				// Checking is there any user on the queue (in case everyone left or started on another queue)
				if (Object.values(queue.users).length === 0) {
					this.client.emit(
						Events.Log,
						`Cancellin LFG [${queueID}] usersLength[${
							Object.values(queue.users).length
						}] No users left on queue`
					);
					return;
				}

				// Init some vars
				const finalUsers: KlasaUser[] = [];
				// Sort users by maxTripLength to use that as the base for this LFG
				const sortedUsers = Object.values(queue.users).sort(
					(a, b) =>
						b.maxTripLength(selectedQueue.lfgClass.activity.type) -
						a.maxTripLength(selectedQueue.lfgClass.activity.type)
				);

				// Get number of activities this trip could start with (if no one is removed from the queue)
				let [validationQuantity] = await selectedQueue.lfgClass.calculateDurationAndActivitiesPerTrip({
					party: sortedUsers,
					queue: selectedQueue
				});

				// Remove invalid users
				for (const user of sortedUsers) {
					const errors = await selectedQueue.lfgClass.checkUserRequirements({
						solo: queue.soloStart,
						user,
						party: sortedUsers,
						queue: selectedQueue,
						quantity: validationQuantity
					});
					if (errors.length === 0) {
						finalUsers.push(user);
					} else {
						this.removeUserFromAllQueues(user);
						await user.send(
							`You were removed from the **${
								selectedQueue.name
							} LFG** as it was about to start due to the following reasons:\n - ${errors.join('\n - ')}`
						);
						await sleep(250);
					}
				}

				// Detect if there are any person left
				if (
					finalUsers.length <
					(queue.soloStart ? 1 : selectedQueue.minQueueSize ? selectedQueue.minQueueSize : MIN_USERS)
				) {
					doNotClear = true;
					this.client.emit(Events.Log, `LFG Canceled [${queueID}] Not enough users left after validation`);
					return;
				}

				// Prepare channels to send queue messages
				const guilds: Record<string, string> = {};
				channelsToSend[DEFAULT_MASS_CHANNEL] = [];
				for (const user of finalUsers) {
					// Verifying channels to send
					const { channel } = queue.userSentFrom[user.id];
					const { guild } = queue.userSentFrom[user.id];
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
							guilds[guild] = DEFAULT_MASS_CHANNEL;
						} else {
							guilds[guild] = channel;
						}
						toSendChannel = channel;
					}
					if (!channelsToSend[toSendChannel]) channelsToSend[toSendChannel] = [];
					channelsToSend[toSendChannel].push(user.id);
				}

				// Get the leader for the LFG
				const leader = finalUsers[0];

				// Now, calculate the final values for this trip
				const [activitiesThisTrip, durationOfTrip, timePerActivity, extraMessages] =
					await selectedQueue.lfgClass.calculateDurationAndActivitiesPerTrip({
						party: finalUsers,
						queue: selectedQueue
					});

				// Check if this team os users meet all the requirements for this activity
				const teamRequirements = selectedQueue.lfgClass.checkTeamRequirements({
					quantity: activitiesThisTrip,
					solo: queue.soloStart,
					party: finalUsers,
					queue: selectedQueue
				});
				if (teamRequirements && teamRequirements.length > 0) {
					// still allows for other users to join if not at the max size
					if (
						finalUsers.length < selectedQueue.maxQueueSize &&
						finalUsers.length > selectedQueue.minQueueSize
					) {
						doNotClear = true;
					}
					this.client.emit(
						Events.Log,
						`LFG Canceled [${queueID}] This team doesnt have the necessary requirements to start this LFG.`
					);
					await sendLFGErrorMessage(
						`The queue **${
							selectedQueue.name
						}** was cancelled because no one has the necessary requirements for it.${
							doNotClear
								? ' Waiting for someone with the requirements to join to start.'
								: ' You must join the queue again.'
						}`,
						this.client,
						channelsToSend
					);
					return;
				}

				// Remove the required items from the users
				// You have to make sure this is checked on the checkUserRequirements so no errors happens here
				// --- Make sure the checkUserRequirements is validating the required items
				// --- Failing to do so will most likely result in item loss (food, pots, whatever is checked)!
				try {
					await selectedQueue.lfgClass.getItemToRemoveFromBank({
						solo: queue.soloStart,
						party: finalUsers,
						quantity: activitiesThisTrip,
						client: this.client,
						queue: selectedQueue
					});
				} catch (e) {
					console.log(e);
					this.client.emit(Events.Log, `LFG Canceled [${queueID}] Error removing required items from users`);
					return;
				}

				await addSubTaskToActivityTask(<LfgActivityTaskOptions>{
					queueId: selectedQueue.uniqueID,
					userID: leader.id,
					channelID: DEFAULT_MASS_CHANNEL,
					quantity: activitiesThisTrip,
					duration: durationOfTrip,
					type: Activity.Lfg,
					leader: leader.id,
					users: finalUsers.map(u => u.id),
					channels: channelsToSend
				});

				for (const user of sortedUsers) {
					this.removeUserFromAllQueues(user);
				}

				const endDate = new Date(Date.now() + Number(durationOfTrip));
				const embed = new MessageEmbed().setColor('#ec3f3f');
				embed.setTitle(`${selectedQueue.name} LFG has started!`);

				embed.addField('Duration', formatDuration(durationOfTrip), true);
				embed.addField(
					'Returning time',
					`${String(endDate.getDate()).padStart(2, '0')}/${String(endDate.getMonth() + 1).padStart(
						2,
						'0'
					)}/${String(endDate.getFullYear()).padStart(4, '0')} ${String(endDate.getHours()).padStart(
						2,
						'0'
					)}:${String(endDate.getMinutes()).padStart(2, '0')}`,
					true
				);

				if (selectedQueue.monster) {
					embed.addField('Quantity being killed', activitiesThisTrip.toLocaleString(), true);
					embed.addField('Time per kill', formatDuration(timePerActivity), true);
					embed.addField('Original time per kill', formatDuration(selectedQueue.monster!.timeToFinish), true);
					embed.addField('Kills per player', `${(activitiesThisTrip / finalUsers.length).toFixed(2)}~`, true);
				}
				embed.addField('Users: ', finalUsers.map(u => u.username).join(', '));

				if (extraMessages.length > 0) {
					embed.addField('Extra', extraMessages.join(', '));
				}

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
				this.client.emit(Events.Log, `Unlocking LFG [${queueID}]`);
				this.clearTimeout(queueID);
				if (queue.soloStart) {
					delete QUEUE_LIST[queueID];
				} else {
					// Allows canceled mass to keep the user here
					if (!doNotClear) {
						queue.users = {};
						queue.userSentFrom = {};
					}
					queue.locked = false;
					queue.lastUserJoinDate = undefined;
					queue.firstUserJoinDate = undefined;
					queue.startDate = undefined;
				}
			}
		}
	}

	// @forceMainServer
	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async run(msg: KlasaMessage) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle('Looking for Group Activities')
			.setDescription(
				'Below is a description of all activities that can be done in groups and how many users are waitining for it to start.' +
					' Each queue has a minimum and maximum size.' +
					` When the queue reaches the minimum size, it'll wait ${formatDuration(
						WAIT_TIME
					)} before starting.\nIf it reaches the maximum size, it'll start instantly.\n\n You can ` +
					`use \`${prefix}lfg join name/alias_of_the_activity\` to join the activity queue. You can ` +
					`also use \`${prefix}lfgsolo join name/alias_of_the_activity\` to start an activity alone, if the activity allows that.` +
					"\n\n**WARNING**: Do not be busy when the activity is about to start or you'll be " +
					'removed from it and the queue will start without you.\n'
			);
		for (const _queue of availableQueues) {
			const smallestAlias = _queue.aliases.sort((a, b) => a.length - b.length)[0] ?? _queue.name;
			const joined = QUEUE_LIST[_queue.uniqueID] && QUEUE_LIST[_queue.uniqueID].users[msg.author.id];
			const title = _queue.name + (joined ? ' [JOINED]' : '');
			embed.addField(
				title,
				`Waiting: ${
					QUEUE_LIST[_queue.uniqueID] ? Object.values(QUEUE_LIST[_queue.uniqueID].users).length : 0
				}` +
					`\n\`${smallestAlias}\`` +
					`\nStarts in: ${this.getTimeLeft(
						QUEUE_LIST[_queue.uniqueID] ? QUEUE_LIST[_queue.uniqueID].startDate : undefined
					)}` +
					`\nMin/Max users: ${_queue.minQueueSize ?? MIN_USERS}/${_queue.maxQueueSize ?? MAX_USERS}` +
					`\nSoloable: ${_queue.allowSolo ? 'Yes' : 'No'}`,
				true
			);
		}
		for (let i = 0; i < Math.ceil(availableQueues.length / 3) * 3 - availableQueues.length; i++) {
			embed.addField('\u200b', '\u200b', true);
		}
		// large footer to allow max embeed size
		embed.setFooter(`${'\u3000'.repeat(200 /* any big number works too*/)}`);
		await msg.channel.send(embed);
	}

	// @forceMainServer
	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async join(msg: KlasaMessage, [queue = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const selectedQueue = availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);

		if (!selectedQueue) {
			return msg.channel.send(`This is not a LFG monster. Run \`${prefix}lfg\` for more information.`);
		}

		let skipChecks = false;
		let queueID = selectedQueue.uniqueID;
		if (msg.commandText === 'lfgsolo') {
			if (selectedQueue.allowSolo) {
				queueID = Number(msg.author.id);
				skipChecks = true;
			} else {
				return msg.channel.send("You can't solo this LFG activity.");
			}
		}

		if (!QUEUE_LIST[queueID]) {
			// Init
			QUEUE_LIST[queueID] = {
				locked: false,
				users: {},
				userSentFrom: {},
				queueBase: selectedQueue,
				soloStart: skipChecks
			};
		}

		if (QUEUE_LIST[queueID].locked) {
			return msg.channel.send(
				"You can't join this LFG at this moment as it is already starting Try again in a few moments."
			);
		}

		if (QUEUE_LIST[queueID].users[msg.author.id]) {
			return msg.channel.send('You are already on this LFG.');
		}

		// Validate if user can actually join this LFG
		// Creates a tempUser so it can add the current users in the queue + the user trying to join
		const TempUsers = Object.values(QUEUE_LIST[queueID].users);
		TempUsers.push(msg.author);
		let [activitiesThisTrip] = await selectedQueue.lfgClass.calculateDurationAndActivitiesPerTrip({
			party: TempUsers,
			queue: selectedQueue
		});
		const errors = await selectedQueue.lfgClass.checkUserRequirements({
			solo: QUEUE_LIST[queueID].soloStart,
			user: msg.author,
			party: TempUsers,
			queue: selectedQueue,
			quantity: activitiesThisTrip
		});

		if (errors.length > 0) {
			if (!channelIsSendable(msg.author.dmChannel!)) {
				return msg.channel.send(
					`:RSSad:\nYou do not meet one or more requisites to join this LFG:\n - ${errors.join('\n - ')}`
				);
			}
			return msg.author.send(
				`:RSSad:\nYou do not meet one or more requisites to join this LFG:\n - ${errors.join('\n - ')}`
			);
		}

		// If no users, set the join dates
		if (Object.values(QUEUE_LIST[queueID].users).length === 0) {
			QUEUE_LIST[queueID].firstUserJoinDate = new Date();
			QUEUE_LIST[queueID].lastUserJoinDate = new Date();
		}

		// Add user
		QUEUE_LIST[queueID].users[msg.author.id] = msg.author;
		QUEUE_LIST[queueID].userSentFrom[msg.author.id] = {
			channel: msg.channel.id,
			guild: msg.guild?.id
		};

		await msg.channel.send(
			`You joined the ${selectedQueue.name} LFG. To leave, type \`${prefix}lfg leave ${queue}\` or \`${prefix}lfg leave all\``
		);

		return this.handleStart(queueID);
	}

	// @forceMainServer
	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async leave(msg: KlasaMessage, [queue = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const selectedQueue = availableQueues.find(
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

		const user = QUEUE_LIST[selectedQueue.uniqueID]
			? QUEUE_LIST[selectedQueue.uniqueID].users[msg.author.id]
			: false;
		if (user) {
			this.removeUserFromQueue(msg.author, selectedQueue.uniqueID, true);
			await msg.channel.send(`You left the ${selectedQueue.name} LFG.`);
		} else {
			return msg.channel.send('You are not in this LFG group!');
		}
	}
}
