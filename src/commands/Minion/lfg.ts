import { DMChannel, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Color, Emoji, Events, SupportServer, Time } from '../../lib/constants';
import { LfgQueueState } from '../../lib/lfg/LfgInterface';
import { availableQueues, LFG_MAX_USERS, LFG_MIN_USERS, sendLFGErrorMessage } from '../../lib/lfg/LfgUtils';
import { requiresMinion } from '../../lib/minions/decorators';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { LfgActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable, formatDuration, sleep, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Timeout = NodeJS.Timeout;

const QUEUE_LIST: Record<number, LfgQueueState> = {};
const WAIT_TIME = 120 * Time.Second;
const DEFAULT_MASS_CHANNEL = '858141860900110366'; // #testing-2
const QUEUE_AUTO_START: Record<number, Timeout | null> = {};
const LFGSOLO_CMD = 'solo';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[join|leave|help|check|create|disband] [name:...string]',
			aliases: [LFGSOLO_CMD],
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
					Object.values(QUEUE_LIST[queueID].users).length < (selectedQueue.minQueueSize ?? LFG_MIN_USERS)
				) {
					clearTimeout(queueID);
				}
				if (Object.keys(QUEUE_LIST[queueID].users).length === 0 || selectedQueue.creator) {
					delete QUEUE_LIST[queueID];
					if (selectedQueue.creator) {
						availableQueues.splice(availableQueues.indexOf(selectedQueue), 1);
					}
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

	async userHasReqToJoin(user: KlasaUser, queueID: number, solo?: boolean) {
		let selectedQueue = availableQueues.find(q => q.uniqueID === queueID);
		let party = <KlasaUser[]>[];
		if (!solo) solo = false;
		if (QUEUE_LIST[queueID]) {
			selectedQueue = QUEUE_LIST[queueID].queueBase;
			party = Object.values(QUEUE_LIST[queueID].users);
			solo = QUEUE_LIST[queueID].soloStart;
		}
		// Creates a tempUser so it can add the current users in the queue + the user trying to join
		party.push(user);
		let { activitiesThisTrip } = await selectedQueue!.lfgClass.calculateDurationAndActivitiesPerTrip({
			leader: user,
			party,
			queue: selectedQueue!
		});
		return [
			await selectedQueue!.lfgClass.checkUserRequirements({
				solo,
				user,
				party,
				queue: selectedQueue!,
				quantity: activitiesThisTrip
			}),
			await selectedQueue!.lfgClass.checkTeamRequirements({
				quantity: activitiesThisTrip,
				solo,
				party,
				queue: selectedQueue
			})
		];
	}

	async messageUser(msg: KlasaMessage, message: string | MessageEmbed) {
		if (!channelIsSendable(msg.author.dmChannel!)) {
			return msg.channel.send(message);
		}
		if (!(msg.channel instanceof DMChannel)) {
			await msg.channel.send(`${msg.author.tag}, check your private messages.`);
		}
		await msg.author.send(message);
	}

	async handleStart(queueID: number, skipChecks = false) {
		const queue = QUEUE_LIST[queueID];
		const selectedQueue = queue.queueBase;
		let doNotClear = false;
		const channelsToSend: Record<string, string[]> = {};
		// Check if we can start
		if (
			Object.values(queue.users).length >= (selectedQueue.minQueueSize ?? LFG_MIN_USERS) ||
			skipChecks ||
			queue.soloStart
		) {
			// Skip queue checks for solo content
			if (!queue.soloStart) {
				// If users >= LFG_MAX_USERS (should never be higher), remove the timeout check and it now
				if (Object.values(queue.users).length >= (selectedQueue.maxQueueSize ?? LFG_MAX_USERS)) {
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
				const firstChecks = await selectedQueue.lfgClass.calculateDurationAndActivitiesPerTrip({
					leader: sortedUsers[0],
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
						quantity: firstChecks.activitiesThisTrip
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
					(queue.soloStart ? 1 : selectedQueue.minQueueSize ? selectedQueue.minQueueSize : LFG_MIN_USERS)
				) {
					doNotClear = true;
					this.client.emit(Events.Log, `LFG Canceled [${queueID}] Not enough users left after validation`);
					return;
				}

				// Prepare channels to send queue messages
				channelsToSend[DEFAULT_MASS_CHANNEL] = [];
				for (const user of finalUsers) {
					// Verifying channels to send
					const { channel, guild } = queue.userSentFrom[user.id];
					let toSendChannel = null;
					// Not guild means DM
					if (guild && guild === SupportServer) {
						toSendChannel = DEFAULT_MASS_CHANNEL;
					} else {
						toSendChannel = channel;
					}

					if (channelsToSend[toSendChannel] === undefined) {
						channelsToSend[toSendChannel] = [];
					}
					channelsToSend[toSendChannel].push(user.id);
				}

				// Get the leader for the LFG
				const leader = finalUsers[0];

				// Now, calculate the final values for this trip
				let { activitiesThisTrip, durationOfTrip, timePerActivity, extraMessages, extras } =
					await selectedQueue.lfgClass.calculateDurationAndActivitiesPerTrip({
						leader,
						party: finalUsers,
						queue: selectedQueue
					});

				if (!extraMessages) extraMessages = [];
				if (!timePerActivity) timePerActivity = durationOfTrip;

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
					if (queue.soloStart) {
						await sendLFGErrorMessage(
							`${
								Emoji.RedX
							} You do not meet one or more requisites to start this LFG activity:\n - ${teamRequirements.join(
								'\n - '
							)}`,
							this.client,
							channelsToSend
						);
					} else {
						await sendLFGErrorMessage(
							`${Emoji.Warning} The queue **${
								selectedQueue.name
							}** was cancelled because no one has the necessary requirements for it.${
								doNotClear
									? ' Waiting for someone with the requirements to join to start.'
									: ' You must join the queue again.'
							}`,
							this.client,
							channelsToSend
						);
					}
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
					this.client.emit(Events.Log, `LFG Canceled [${queueID}] Error removing required items from users`);
					return;
				}

				await addSubTaskToActivityTask(<LfgActivityTaskOptions>{
					queueId: selectedQueue.creator ? selectedQueue.privateUniqueID : selectedQueue.uniqueID,
					userID: leader.id,
					channelID: DEFAULT_MASS_CHANNEL,
					quantity: activitiesThisTrip,
					duration: durationOfTrip,
					type: Activity.Lfg,
					leader: leader.id,
					users: finalUsers.map(u => u.id),
					channels: channelsToSend,
					extras
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

	@requiresMinion
	async run(msg: KlasaMessage, [queue = '']) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const embed = new MessageEmbed().setColor(Color.Orange).setTitle('Looking for Group Activities');
		if (msg.commandText === LFGSOLO_CMD && queue) {
			return this.join(msg, [queue]);
		}
		for (const _queue of availableQueues) {
			// Do not display private queues
			if (_queue.creator) continue;
			const smallestAlias = _queue.aliases.sort((a, b) => a.length - b.length)[0] ?? _queue.name;
			const joined = QUEUE_LIST[_queue.uniqueID] && QUEUE_LIST[_queue.uniqueID].users[msg.author.id];
			const title = _queue.name + (joined ? ' [JOINED]' : '');
			const errors = await this.userHasReqToJoin(msg.author, _queue.uniqueID, msg.commandText === LFGSOLO_CMD);
			embed.addField(
				title,
				`Waiting: ${
					QUEUE_LIST[_queue.uniqueID] ? Object.values(QUEUE_LIST[_queue.uniqueID].users).length : 0
				}` +
					`\n\`${smallestAlias}\`` +
					`\nStarts in: ${this.getTimeLeft(
						QUEUE_LIST[_queue.uniqueID] ? QUEUE_LIST[_queue.uniqueID].startDate : undefined
					)}` +
					`\nMin/Max users: ${_queue.minQueueSize ?? LFG_MIN_USERS}/${_queue.maxQueueSize ?? LFG_MAX_USERS}` +
					`\nSoloable: ${_queue.allowSolo ? 'Yes' : Emoji.RedX}` +
					`\nMeet Requirements: ${
						errors[0].length === 0 ? (errors[1].length === 0 ? 'Yes' : Emoji.Warning) : Emoji.RedX
					}` +
					`\nAllow Private: ${_queue.allowPrivate ? 'Yes' : Emoji.RedX}`,
				true
			);
		}
		for (let i = 0; i < Math.ceil(availableQueues.length / 3) * 3 - availableQueues.length; i++) {
			embed.addField('\u200b', '\u200b', true);
		}
		embed
			.addField(
				'\u200B',
				`Run \`${prefix}lfg help\` for more information.${'\u3000'.repeat(200 /* any big number works too*/)}`
			)
			.setTimestamp();
		// large footer to allow max embeed size
		return this.messageUser(msg, embed);
	}

	@requiresMinion
	async help(msg: KlasaMessage) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setTitle('Looking for Group Activities')
			.setDescription(
				`If you run \`${prefix}lfg\`, you'll get a description of all activities that can be done in groups and ` +
					'how many users are waitining for it to start.' +
					' Each activity has a minimum and maximum size.' +
					` When the activity reaches the minimum size, it'll wait ${formatDuration(
						WAIT_TIME
					)} before starting. If it reaches the maximum size, it'll start instantly.\n\n You can ` +
					`use \`${prefix}lfg join name\` to join the activity. You can ` +
					`also use \`${prefix}${LFGSOLO_CMD} name\` to start an activity alone, if the activity allows that.` +
					`\n\n**${Emoji.Warning} WARNING**\n\nDo not be busy when the activity is about to start or you'll be ` +
					'removed from it and the activity will start without you.\n\n' +
					`You can use \`${prefix}lfg/${LFGSOLO_CMD} check name\` to verify if you have all the requirements the activity. ` +
					"If not, it'll DM you (or shown on the channel if you have DMs off), the requirements you are missing." +
					`\n\n**PRIVATE ACTIVITIES**\n\nYou can start private activities by doing \`${prefix}lfg create name\`. You'll be able` +
					` to create private activities of any of the activities shown in \`${prefix}lfg\` that has \`Allow Private\` as yes. ` +
					'Private activity will still obey the same time settings as a normal activity, when reaching the minimimum users.\n\n' +
					`You can disband your private activity by issuing \`${prefix}lfg disband\` or by leaving your own activity ` +
					`issuing \`${prefix}lfg leave name\` or issuing \`${prefix}lfg leave all\`` +
					`\n\n**ICONS AND THEIR MEANINGS**\n\nIf the activity \`Meet Requirements\` has this icon ${Emoji.RedX}, it means you dont have all ` +
					`the requirements to join the activity. If it has this icon ${Emoji.Warning}, it means you have all ` +
					'the necessary requirements to join the activity, but not not all the team requirements. The ' +
					'activity will not start until someone with those requires joins.' +
					`\n\nIf \`Soloable\` has this icon ${Emoji.RedX}, it means this activity can not be soloed.` +
					`\n\nIf \`Allow Private\` has this icon ${Emoji.RedX}, it means that you can not be privately done.`
			);
		// large footer to allow max embeed size
		embed.setFooter(`${'\u3000'.repeat(200)}`);
		await this.messageUser(msg, embed);
	}

	@requiresMinion
	async check(msg: KlasaMessage, [queue = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const selectedQueue = availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);
		if (!selectedQueue) {
			return msg.channel.send(
				`This is not a valid LFG activity. Check \`${prefix}lfg\` for all available activities.`
			);
		}
		const solo = msg.commandText === LFGSOLO_CMD;
		const errors = await this.userHasReqToJoin(msg.author, selectedQueue.uniqueID, solo);
		if (solo) {
			errors[0] = errors[0].concat(errors[1]);
		}
		let returnMessage = '';
		if (errors[0].length > 0) {
			returnMessage += `${
				Emoji.RedX
			} You do not meet one or more requisites to join this LFG:\n - ${errors[0].join('\n - ')}`;
		}
		if (!solo && errors[1].length > 0) {
			returnMessage += `\n\n${
				Emoji.Warning
			} As a team requirement, you do not meet one or more requisites for this LFG, **but you still can join it**:\n - ${errors[1].join(
				'\n - '
			)}`;
		}
		if (returnMessage) {
			return this.messageUser(msg, returnMessage);
		}
		return this.messageUser(msg, `${Emoji.Happy}\nYou meet all the requirements for this activity.`);
	}

	@requiresMinion
	async create(msg: KlasaMessage, [queue = '']: [string]) {
		const { min, max } = msg.flagArgs;
		if (msg.commandText === LFGSOLO_CMD) {
			return msg.channel.send("You can't create a private solo activity.");
		}
		const uid = `999${msg.author.id}`;
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		// Check is user already has a queue created
		if (Boolean(availableQueues.find(m => m.creator === msg.author))) {
			return msg.channel.send(
				`You can only have one private queue craeted. Use \`${prefix}lfg disband\` to start a new queue.`
			);
		}
		// Select the activity the user wants to create
		const selectedQueue = availableQueues.find(
			m =>
				!m.creator &&
				m.allowPrivate &&
				(stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue))))
		);
		if (!selectedQueue) {
			return msg.channel.send(
				`This is not a valid LFG activity. Check \`${prefix}lfg\` for all available activities.`
			);
		}
		// Check if the user can actually create this activity
		const errors = await this.userHasReqToJoin(msg.author, selectedQueue.uniqueID, false);
		let returnMessage = '';
		if (errors[0].length > 0) {
			returnMessage += `${
				Emoji.RedX
			} You do not meet one or more requisites to create this private LFG:\n - ${errors[0].join('\n - ')}`;
		}
		if (returnMessage) {
			return this.messageUser(msg, returnMessage);
		}

		const newPrivateQueue = {
			creator: msg.author,
			uniqueID: Number(uid),
			name: `${msg.author.username}\'s Private ${selectedQueue.name}`,
			aliases: [msg.author.tag, msg.author.id],
			allowSolo: false,
			monster: selectedQueue.monster,
			minQueueSize: min ? Number(min) : LFG_MIN_USERS,
			maxQueueSize: max ? Number(max) : LFG_MAX_USERS,
			lfgClass: selectedQueue.lfgClass,
			thumbnail: selectedQueue.thumbnail,
			extraParams: selectedQueue.extraParams,
			privateUniqueID: selectedQueue.uniqueID,
			allowPrivate: false
		};
		availableQueues.push(newPrivateQueue);

		await msg.channel.send(
			`You created private LFG activity queue ${
				newPrivateQueue.name
			}. People can join the queue typing \`${prefix}lfg join ${
				newPrivateQueue.aliases[0] ?? newPrivateQueue.name
			}\`. You can disband this queue by issuing \`${prefix}lfg disband\`.`
		);

		return this.join(msg, [`${msg.author.id}`]);
	}

	@requiresMinion
	async join(msg: KlasaMessage, [queue = '']: [string]) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		const selectedQueue = availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);

		if (!selectedQueue) {
			return msg.channel.send(`This is not a valid LFG activity. Run \`${prefix}lfg\` for more information.`);
		}

		let skipChecks = false;
		let queueID = selectedQueue.uniqueID;
		if (msg.commandText === LFGSOLO_CMD) {
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
		const errors = await this.userHasReqToJoin(msg.author, queueID);
		if (errors[0].length > 0) {
			await this.messageUser(
				msg,
				`${Emoji.RedX} You do not meet one or more requisites to join this LFG:\n - ${errors.join('\n - ')}`
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

		// Dont display this message for solos
		if (!QUEUE_LIST[queueID].soloStart && selectedQueue.creator !== msg.author) {
			await msg.channel.send(
				`You joined the ${selectedQueue.name} LFG. To leave, type \`${prefix}lfg leave ${
					selectedQueue.aliases[0] ?? selectedQueue.name
				}\` or \`${prefix}lfg leave all\``
			);
		}

		return this.handleStart(queueID);
	}

	@requiresMinion
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

	@requiresMinion
	async disband(msg: KlasaMessage) {
		const selectedQueue = availableQueues.find(m => m.creator && m.creator === msg.author);
		if (!selectedQueue) {
			return msg.channel.send("This private activity does not exists or you don't own it.");
		}
		this.removeUserFromQueue(msg.author, selectedQueue.uniqueID, true);
		return msg.channel.send('You disbanded your group!');
	}
}
