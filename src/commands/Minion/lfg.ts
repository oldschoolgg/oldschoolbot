import { MessageAttachment, MessageEmbed, MessageOptions } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { getConnection } from 'typeorm';

import { Activity, Color, Emoji, Events, SupportServer } from '../../lib/constants';
import { LfgQueueState } from '../../lib/lfg/LfgInterface';
import {
	availableQueues,
	LFG_MAX_USERS,
	LFG_MIN_USERS,
	LFG_WAIT_TIME,
	sendLFGErrorMessage
} from '../../lib/lfg/LfgUtils';
import { requiresMinion } from '../../lib/minions/decorators';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { LfgStatusTable } from '../../lib/typeorm/LfgStatusTable.entity';
import { LfgActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable, formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';
import { strtr } from '../../lib/util/strtr';
import Timeout = NodeJS.Timeout;

const QUEUE_LIST: Record<number, LfgQueueState> = {};
const DEFAULT_MASS_CHANNEL = '858141860900110366' || /**/ '755074115978657894';
const DEFAULT_MASS_SERVER = '858140841809936434' || /**/ SupportServer;
const QUEUE_AUTO_START: Record<number, Timeout | null> = {};
const LFGSOLO_CMD = 'solo';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[join|leave|help|create|disband|start|info|stats] [name:...string]',
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
					this.clearTimeout(queueID);
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

	prefix(msg: KlasaMessage) {
		return msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
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

	async messageUser(msg: KlasaMessage, message: string | MessageEmbed, file?: MessageAttachment | undefined) {
		let toSend: MessageOptions = {};
		if (message instanceof MessageEmbed) {
			toSend = { embeds: [message] };
		} else {
			toSend = { content: message };
		}
		if (file) {
			toSend.files = [file];
		}
		try {
			await msg.author.send(toSend);
			// Check if the channel sent are the dms
			if (msg.author.dmChannel?.id !== msg.channel.id) {
				await msg.channel.send(`${msg.author.tag}, check your private messages.`);
			}
		} catch (e) {
			await msg.channel.send(toSend);
		}
	}

	async handleStart(queueID: number, skipChecks = false) {
		this.client.emit(Events.Log, `Checking LFG [${queueID}] if it can start`);
		// Check if there are any locked queues being checked. If so, postpone this checking
		if (Object.values(QUEUE_LIST).some(q => q.locked)) {
			this.clearTimeout(queueID);
			QUEUE_AUTO_START[queueID] = setTimeout(() => this.handleStart(queueID, false), Time.Second);
			this.client.emit(
				Events.Log,
				`LFG Lock - Postponing [${queueID}] as another queue is being handled at the moment`
			);
			return;
		}
		const queue = QUEUE_LIST[queueID];
		// If queue doesnt exists, it means it was already started
		if (!queue) {
			this.client.emit(Events.Log, `LFG Queue [${queueID}] does not exists anymore as everyone left it.`);
			return;
		}
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
			if (!queue.soloStart && !queue.forceStart) {
				// If users >= LFG_MAX_USERS (should never be higher), remove the timeout check and it now
				if (Object.values(queue.users).length >= (selectedQueue.maxQueueSize ?? LFG_MAX_USERS)) {
					if (QUEUE_AUTO_START[queueID] !== null) {
						this.clearTimeout(queueID);
					}
				} else if (!QUEUE_AUTO_START[queueID]) {
					this.client.emit(
						Events.Log,
						`Starting LFG [${queueID}] ${(
							selectedQueue.cooldown ?? LFG_WAIT_TIME
						).toLocaleString()}ms countdown`
					);
					QUEUE_AUTO_START[queueID] = setTimeout(
						() => this.handleStart(queueID, true),
						selectedQueue.cooldown ?? LFG_WAIT_TIME
					);
					queue.startDate = new Date(Date.now() + (selectedQueue.cooldown ?? LFG_WAIT_TIME));
					return;
				} else if (!skipChecks) {
					this.client.emit(
						Events.Log,
						`Cant start LFG [${queueID}] yet, not maximum users and has already started`
					);
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
				if (!queue.soloStart) {
					channelsToSend[DEFAULT_MASS_CHANNEL] = [];
				}
				for (const user of finalUsers) {
					// Verifying channels to send
					const { channel, guild } = queue.userSentFrom[user.id];
					let toSendChannel = null;
					// Not guild means DM'
					if (guild && guild === DEFAULT_MASS_SERVER && !queue.soloStart) {
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
						`LFG Canceled [${queueID}] This team doesnt have the necessary requirements to start this LFG`
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

				// Remove required items from users
				let failSafe: Record<string, Bank> = {};
				let itemsRemoved = [];
				try {
					for (const user of finalUsers) {
						const lootRemovedCost: Bank = new Bank();
						try {
							this.client.oneCommandAtATimeCache.add(user.id);
							const itemsToRemove = await selectedQueue.lfgClass.getItemToRemoveFromBank({
								solo: queue.soloStart,
								user,
								party: finalUsers,
								quantity: activitiesThisTrip,
								queue: selectedQueue
							});
							if (itemsToRemove.items().length > 0) {
								await user.removeItemsFromBank(itemsToRemove);
								lootRemovedCost.add(itemsToRemove);
								failSafe[user.id] = itemsToRemove;
								itemsRemoved.push(`**${user.username}**: ${itemsToRemove}`);
							}
						} finally {
							this.client.oneCommandAtATimeCache.delete(user.id);
						}
						if (selectedQueue.queueEconomyCost) {
							await selectedQueue.queueEconomyCost.map(async c => {
								return updateBankSetting(this.client, c, lootRemovedCost);
							});
						}
					}
				} catch (e) {
					// In case something terrible happened, let's give the items removed back to the players
					// before ending the activity
					console.log(e);
					this.client.emit(
						Events.Log,
						`Critical LFG Error [${queueID}] Could not remove items from everyone after all checks - Returning removed items to players affected and ending activity`
					);
					for (const user of finalUsers) {
						if (failSafe[user.id]) {
							await user.addItemsToBank(failSafe[user.id]);
						}
					}
					return sendLFGErrorMessage(
						`${Emoji.Warning} The queue **${selectedQueue.name}** was cancelled due to a critical error. Please, contact the Support Server for more information.`,
						this.client,
						channelsToSend
					);
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

				this.client.emit(Events.Log, `LFG [${queueID}] has started`);

				for (const user of finalUsers) {
					this.removeUserFromAllQueues(user);
				}

				const endDate = new Date(Date.now() + Number(durationOfTrip));
				const embed = new MessageEmbed().setColor(Color.DiscordRed);
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

				if (selectedQueue.monster && activitiesThisTrip > 1) {
					embed.addField('Quantity being killed', activitiesThisTrip.toLocaleString(), true);
					embed.addField('Time per kill', formatDuration(timePerActivity), true);
					if (selectedQueue.monster!.timeToFinish) {
						embed.addField(
							'Original time per kill',
							formatDuration(selectedQueue.monster!.timeToFinish),
							true
						);
					}
					embed.addField('Kills per player', `${(activitiesThisTrip / finalUsers.length).toFixed(2)}~`, true);
				}
				embed.addField('Users: ', finalUsers.map(u => u.username).join(', '));

				if (extraMessages.length > 0) {
					embed.addField('Extra', extraMessages.join(', '));
				}

				if (itemsRemoved.length > 0) {
					embed.addField('Items Removed', itemsRemoved.join(', '));
				}

				if (selectedQueue.thumbnail) {
					embed.setThumbnail(selectedQueue.thumbnail);
				}

				for (const _channel of [...Object.keys(channelsToSend)]) {
					const channel = this.client.channels.cache.get(_channel);
					if (channelIsSendable(channel)) {
						await channel.send({ embeds: [embed] });
					}
				}
			} finally {
				this.client.emit(Events.Log, `Unlocking LFG [${queueID}]`);
				this.clearTimeout(queueID);
				delete QUEUE_AUTO_START[queueID];
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
		} else {
			this.client.emit(Events.Log, `LFG [${queueID}] cannot start yet. Still waitning for timeout or max users.`);
		}
	}

	@requiresMinion
	async run(msg: KlasaMessage, [queue = '']) {
		if (queue) {
			return this.join(msg, [queue]);
		}
		let returnMessageByCategory: Record<string, string> = {};
		for (const _queue of availableQueues) {
			// Do not display private queues
			if (_queue.creator) continue;
			const smallestAlias = _queue.aliases.sort((a, b) => a.length - b.length)[0] ?? _queue.name;
			const joined =
				QUEUE_LIST[_queue.uniqueID] && QUEUE_LIST[_queue.uniqueID].users[msg.author.id] ? ' / Joined' : '';
			returnMessageByCategory[_queue.category] = `${returnMessageByCategory[_queue.category] ?? ''}**${
				_queue.name
			}${joined}** - ${
				_queue.extraParams?.joinBestQueue === true
					? ''
					: `On Queue: ${
							QUEUE_LIST[_queue.uniqueID] ? Object.values(QUEUE_LIST[_queue.uniqueID].users).length : 0
					  }, `
			}Alias: \`${smallestAlias}\`\n`;
		}
		let returnStr = '\u200B\n';
		Object.entries(returnMessageByCategory).map(s => (returnStr += `**${s[0]}**\n\n${s[1]}\n`));
		return this.messageUser(msg, returnStr);
	}

	@requiresMinion
	async info(msg: KlasaMessage, [queue = '']) {
		const selectedQueue = availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);
		if (!selectedQueue) {
			return msg.channel.send(
				`This is not a valid LFG activity. Check \`${this.prefix(msg)}lfg\` for all available activities.`
			);
		}

		const lfgStats = await LfgStatusTable.findOne(selectedQueue.uniqueID);

		const joined = QUEUE_LIST[selectedQueue.uniqueID] && QUEUE_LIST[selectedQueue.uniqueID].users[msg.author.id];
		const errors = await this.userHasReqToJoin(msg.author, selectedQueue.uniqueID, msg.commandText === LFGSOLO_CMD);
		const embed = new MessageEmbed();
		embed.setColor(Color.DiscordBlurple);
		embed.setTitle(`${selectedQueue.name}${joined ? ' | Joined' : ''}`);
		embed.addField('Aliases', `\`${selectedQueue.aliases.join('`,`')}\``);
		embed.addField(
			'Time after min. users joined',
			`${formatDuration(selectedQueue.cooldown ?? LFG_WAIT_TIME)}`,
			true
		);
		embed.addField('Minimum users to start', `${selectedQueue.minQueueSize}`, true);
		embed.addField('Maximum users to instantly start', `${selectedQueue.maxQueueSize}`, true);
		embed.addField('Soloable?', selectedQueue.allowSolo ? 'Yes' : 'No', true);
		embed.addField('Allows private?', selectedQueue.allowPrivate ? 'Yes' : 'No', true);
		embed.addField(
			'Meet requirements?',
			errors[0].length === 0 ? (errors[1].length === 0 ? 'Yes' : 'Partially') : 'No',
			true
		);
		if (errors[0].length > 0) {
			embed.addField('Critical requirements missing', errors[0].join('\n'));
		}
		if (errors[1].length > 0) {
			embed.addField('Team requirements missing (not required to join the activity)', errors[1].join('\n'));
		}

		if (selectedQueue.thumbnail) {
			// embed.setThumbnail(selectedQueue.thumbnail);
		}

		embed.addField('\u200B', '**Some All Time Statistics for this Activity**');
		embed.addField('Total users', `${lfgStats?.usersServed ?? 0}`, true);
		embed.addField(
			`${selectedQueue.monster ? 'Times Killed' : 'Number of Trips'}`,
			`${lfgStats?.qtyKilledDone ?? 0}`,
			true
		);
		embed.addField('Times Sent', `${lfgStats?.timesSent ?? 0}`, true);

		let attachment = undefined;

		// Check if loot is items of custom stuff (like points, tokens, etc)
		if (lfgStats && lfgStats.lootObtained && Object.keys(lfgStats.lootObtained).length > 0) {
			let validItems = new Bank();
			let invalidItems: string[] = [];
			Object.entries(lfgStats!.lootObtained).forEach(item => {
				try {
					let { id } = getOSItem(item[0]);
					validItems.add(id, item[1]);
				} catch (e) {
					invalidItems.push(`${item[1].toLocaleString()}x ${item[0]}`);
				}
			});
			embed.addField(
				'\u200B',
				`**Total drops this activity generated**${
					invalidItems.length > 0 ? `\n${invalidItems.join(', ')}` : '\u200B'
				}`,
				false
			);
			if (validItems.items().length !== 0) {
				const { image } = await this.client.tasks
					.get('bankImage')!
					.generateBankImage(validItems.bank, `${selectedQueue.name} All Time Drops`, true);
				attachment = new MessageAttachment(image!, 'queue_drops.png');
				embed.setImage('attachment://queue_drops.png');
			}
		}

		return this.messageUser(msg, embed, attachment);
	}

	@requiresMinion
	async help(msg: KlasaMessage) {
		const embed = new MessageEmbed()
			.setColor(Color.DiscordGreen)
			.setTitle('Looking for Group Activities')
			.setDescription(
				strtr(
					"If you run `{prefix}lfg`, you'll get a description of all activities that can be done in " +
						'groups and how many users are waitining for it to start. Each activity has a minimum and maximum ' +
						"size. When the activity reaches the minimum size, it'll wait {duration} before starting, unless " +
						"a different time is defined on the activity. If it reaches the maximum size, it'll start instantly." +
						'\n\n' +
						'You can use `{prefix}lfg [join] name|alias[,name2|alias2,name3|alias3,...]` to join the activity. ' +
						'You can also use `{prefix}{solo} name|alias` to start an activity alone, if the activity allows that.' +
						'\n\n' +
						'You can use `{prefix}lfg info name|alias` to show all the information about that activity, like ' +
						'all its aliases, people waiting for it to start, if it is soloable or allows private instances to ' +
						'be created and if you meet all the requirements. If not, the requirements you are missing will be shown. ' +
						'It will also show statistics about the activitie like, how many times it was done, how many users it served ' +
						'how many monsters or runs it killed/had and the total loot it generated in its lifetime!' +
						'\n\n' +
						'You can use `{prefix}lfg stats [--more]` to check how many activities are running and when they will be back. ' +
						'If you add the `--more` flag, it will show some all time data about all activities too.' +
						'\n\n' +
						'**WARNING**' +
						'\n\n' +
						"Do not be busy when the activity is about to start or you'll be removed from it and the activity " +
						"will start without you. If not, it'll DM you the requirements you are missing." +
						'\n\n' +
						'**PRIVATE ACTIVITIES**' +
						'\n\n' +
						'Activities that have `Allow Private` as `Yes`, can be done on a private group. To create a private ' +
						'group, do `{prefix}lfg create name|alias [--min] [--max] [--cooldown]`. You can only have **one** private activity created at any time. ' +
						'You can leave/disband your private activity by doing `{prefix}lfg disband` or by leaving your private activity.' +
						'\n\n' +
						'The optional flags on the create command defines the `--min`imum amount of users required to start the activity,' +
						' the `--max`imum amount of users allowed and the `--cooldown` to automatically start the queue when the ' +
						'minimum amount of users is reached.' +
						'\n\n' +
						'People will be able to join by doing `{prefix}lfg join YourDiscordHandler` (Example: AwesomeCreator#8493). ' +
						'@AwesomeCreator can also be used, but remeber that that will ping the user.' +
						'\n\n' +
						'You can force the start by running `{prefix}lfg start` as long the number of people joined are above ' +
						'or equal than the minumum set for the activity.' +
						'\n\n' +
						'**EXAMPLES**' +
						'\n\n' +
						'`{prefix}lfg help` - Display this message;\n' +
						'`{prefix}lfg` - Shows all the available activities, their lowest alias for quick join and the ' +
						'amount of users awaiting for it to start;\n' +
						'`{prefix}lfg nightmare` - Joins the nightmare group activity;\n' +
						'`{prefix}lfg join bandos,kree,kril,sara,corp` - Joins Bandos, Zamorak, Saradomin and Armadyl GWD group activity;\n' +
						'`{prefix}{solo} cox` - Starts the Chambers of Xerics as a solo activity;\n' +
						'`{prefix}lfg info coxcm` - Shows information about the Chambers of Xerics - Challenge Mode;\n' +
						'`{prefix}lfg stats` - Shows informations about the activities currently being done, as ' +
						'numbers of players, when they will be arriving and etc;\n' +
						'`{prefix}lfg stats --more` - Same as above, buth with extra information about all activities;\n' +
						'`{prefix}lfg create corp --min=10` - Create a private Corporeal Beast activity for others to ' +
						'join with a minimum user limit of 10;\n' +
						'`{prefix}lfg start` Will force start your private activity;\n' +
						'\n\n',
					{
						'{prefix}': this.prefix(msg),
						'{solo}': LFGSOLO_CMD,
						'{duration}': formatDuration(LFG_WAIT_TIME)
					}
				)
			);
		// large footer to allow max embeed size
		embed.setFooter(`${'\u3000'.repeat(200)}`);
		await this.messageUser(msg, embed);
	}

	@requiresMinion
	async create(msg: KlasaMessage, [queue = '']: [string]) {
		let { min, max, cooldown } = msg.flagArgs;

		if (msg.commandText === LFGSOLO_CMD) {
			return msg.channel.send("You can't create a private solo activity.");
		}
		const uid = `999${msg.author.id}`;
		// Check is user already has a queue created
		if (Boolean(availableQueues.find(m => m.creator === msg.author))) {
			return msg.channel.send(
				`You can only have one private queue craeted. Use \`${this.prefix(
					msg
				)}lfg disband\` to start a new queue.`
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
				`This is not a valid LFG activity. Check \`${this.prefix(msg)}lfg\` for all available activities.`
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

		// Detect if min/max queue sizes are correctly set
		if (!min) {
			min = String(selectedQueue.minQueueSize);
		} else if (Number(min) < selectedQueue.minQueueSize) {
			return msg.channel.send(`You can't set the minimum amount of users below ${selectedQueue.minQueueSize}`);
		}
		if (!max) {
			max = String(selectedQueue.maxQueueSize);
		} else if (Number(max) > selectedQueue.maxQueueSize) {
			return msg.channel.send(`You can't set the maximum amount of users above ${selectedQueue.maxQueueSize}`);
		}

		// Check if a new cooldown was set
		if (!cooldown) {
			cooldown = String(LFG_WAIT_TIME);
		} else {
			cooldown = String(Number(cooldown) * Time.Second);
		}

		const newPrivateQueue = {
			creator: msg.author,
			uniqueID: Number(uid),
			name: `${msg.author.username}\'s Private ${selectedQueue.name}`,
			aliases: [msg.author.tag, msg.author.id],
			allowSolo: false,
			monster: selectedQueue.monster,
			minQueueSize: Number(min),
			maxQueueSize: Number(max),
			lfgClass: selectedQueue.lfgClass,
			thumbnail: selectedQueue.thumbnail,
			extraParams: selectedQueue.extraParams,
			privateUniqueID: selectedQueue.uniqueID,
			allowPrivate: false,
			cooldown: Number(cooldown),
			category: selectedQueue.category
		};
		availableQueues.push(newPrivateQueue);

		await msg.channel.send(
			`You created private LFG activity queue ${
				newPrivateQueue.name
			}. People can join the queue typing \`${this.prefix(msg)}lfg join ${
				newPrivateQueue.aliases[0] ?? newPrivateQueue.name
			}\`. You can disband this queue by issuing \`${this.prefix(msg)}lfg disband\`.`
		);

		return this.join(msg, [`${msg.author.id}`]);
	}

	@requiresMinion
	async join(msg: KlasaMessage, [queue = '']: [string], sendMessage = true) {
		function returnMessage(message: string) {
			return sendMessage ? msg.channel.send(message) : message;
		}

		if (msg.commandText !== LFGSOLO_CMD && queue.includes(',')) {
			const queues = queue.split(',');
			const messages: string[] = [];
			await Promise.all(
				queues.map(async value => {
					let x = String(await this.join(msg, [value.trim()], false));
					messages.push(x);
				})
			);
			const resultMessage = `\u200b\n${messages.join('\n\n')}`;
			return resultMessage.length > 100 ? this.messageUser(msg, resultMessage) : msg.channel.send(resultMessage);
		}

		let selectedQueue = availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);

		if (!selectedQueue) {
			return returnMessage(
				`This is not a valid LFG activity. Run \`${this.prefix(msg)}lfg\` for more information.`
			);
		}

		// Check if this queue calculates the best user queue
		if (selectedQueue.extraParams?.joinBestQueue && selectedQueue.lfgClass.returnBestQueueForUser) {
			selectedQueue = availableQueues.find(
				q => q.uniqueID === selectedQueue!.lfgClass.returnBestQueueForUser!(msg.author)
			)!;
		}

		let skipChecks = false;
		let queueID = selectedQueue.uniqueID;
		if (msg.commandText === LFGSOLO_CMD) {
			if (selectedQueue.allowSolo) {
				queueID = Number(msg.author.id);
				skipChecks = true;
				// Remove the queue if it already exists, as the user will be soloing it
				if (QUEUE_LIST[queueID]) {
					delete QUEUE_LIST[queueID];
				}
			} else {
				return returnMessage("You can't solo this LFG activity.");
			}
		}

		try {
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
				return returnMessage(
					"You can't join this LFG at this moment as it is already starting Try again in a few moments."
				);
			}

			if (QUEUE_LIST[queueID].users[msg.author.id]) {
				return returnMessage(`You already joined the **${selectedQueue.name}** LFG.`);
			}

			// Validate if user can actually join this LFG
			const errors = await this.userHasReqToJoin(msg.author, queueID);
			if (errors[0].length > 0) {
				return returnMessage(
					`${Emoji.RedX} You do not meet one or more requisites to join **${
						selectedQueue.name
					}** LFG:\n - ${errors[0].join('\n - ')}`
				);
			}
			try {
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
					return returnMessage(
						`You joined the ${selectedQueue.name} LFG. To leave, type \`${this.prefix(msg)}lfg leave ${
							selectedQueue.aliases[0] ?? selectedQueue.name
						}\` or \`${this.prefix(msg)}lfg leave all\``
					);
				}
			} finally {
				await this.handleStart(queueID);
			}
		} catch (e) {
			console.log(e);
			return returnMessage(`It was not possible to join ${selectedQueue.name} at this time. Try again.`);
		}
	}

	@requiresMinion
	async leave(msg: KlasaMessage, [queue = '']: [string]) {
		const selectedQueue = availableQueues.find(
			m => stringMatches(m.name, queue) || (m.aliases && m.aliases.some(a => stringMatches(a, queue)))
		);

		if (!selectedQueue) {
			// Allows the user to leave all queues
			if (queue === 'all') {
				this.removeUserFromAllQueues(msg.author);
				return msg.channel.send('You left all LFG queues.');
			}
			return msg.channel.send(
				`This is not a LFG valid queue. Run \`${this.prefix(msg)}lfg\` for more information.`
			);
		}

		const user = QUEUE_LIST[selectedQueue.uniqueID]
			? QUEUE_LIST[selectedQueue.uniqueID].users[msg.author.id]
			: false;
		if (user) {
			this.removeUserFromQueue(msg.author, selectedQueue.uniqueID, true);
			return msg.channel.send(`You left the ${selectedQueue.name} LFG.`);
		}
		return msg.channel.send('You are not in this LFG group!');
	}

	@requiresMinion
	async disband(msg: KlasaMessage) {
		const selectedQueue = availableQueues.find(m => m.creator && m.creator === msg.author);
		if (!selectedQueue) {
			return msg.channel.send('You dont have any private activity to disband.');
		}
		this.removeUserFromQueue(msg.author, selectedQueue.uniqueID, true);
		return msg.channel.send('You disbanded your group!');
	}

	@requiresMinion
	async start(msg: KlasaMessage) {
		const selectedQueue = availableQueues.find(m => m.creator && m.creator === msg.author);
		if (!selectedQueue) {
			return msg.channel.send('You dont have any private activity to start.');
		}
		const queueID = Number(`999${msg.author.id}`);
		if (Object.values(QUEUE_LIST[queueID].users).length < selectedQueue.minQueueSize) {
			return msg.channel.send("You can't start the activity without the minimum amount of users required.");
		}
		QUEUE_LIST[queueID].forceStart = true;
		await this.handleStart(queueID, true);
	}

	@requiresMinion
	async stats(msg: KlasaMessage) {
		let lfgACtivities: any[] = await getConnection().query(
			`
				SELECT
					*
				FROM
					activity
				WHERE
					completed = false AND
					group_activity = true AND
					type = $1
				ORDER by
					finish_date ASC;`,
			[Activity.Lfg]
		);
		lfgACtivities = lfgACtivities.filter(m => m.data.users.length > 1);

		if (!msg.flagArgs.more && Object.values(lfgACtivities).length === 0) {
			return msg.channel.send('No LFG activities are running at the moment.');
		}

		const runningActivities: Record<number, any> = {};
		let runningText: string[] = [];
		const now = Date.now();
		Object.values(lfgACtivities).forEach(lfg => {
			const activity = availableQueues.find(a => a.uniqueID === lfg.data.queueId)!;
			runningText.push(
				`${lfg.data.quantity > 1 ? `${lfg.data.quantity}x ` : ''}${activity.name} with ${
					lfg.data.users.length
				} player${lfg.data.users.length > 1 ? 's' : ''} will return in ${formatDuration(
					lfg.finish_date.getTime() - now
				)}.`
			);
			runningActivities[lfg.data.queueId] = {
				users: Number(runningActivities[lfg.data.queueId]?.users ?? 0) + Number(lfg.data.users.length),
				killed: Number(runningActivities[lfg.data.queueId]?.killed ?? 0) + Number(lfg.data.quantity)
			};
		});

		const embed = new MessageEmbed().setColor(Color.DarkNavy).setTitle('Looking for Group Activities | Stats');

		if (runningText.length > 0) {
			embed.addField('The following activities are running', runningText.join('\n'));
		}
		if (msg.flagArgs.more) {
			const lfgStatsData = await LfgStatusTable.find();
			Object.values(availableQueues).forEach(queue => {
				const dataQueue = lfgStatsData.find(d => d.id === queue.uniqueID);
				embed.addField(
					queue.name,
					`Users now: ${runningActivities[queue.uniqueID]?.users ?? 0}\n` +
						`${queue.monster ? 'Killing' : 'Running'} now: ${
							runningActivities[queue.uniqueID]?.killed ?? 0
						}\n` +
						`[All Time] Sent: ${dataQueue?.timesSent ?? 0}\n` +
						`[All Time] Users: ${dataQueue?.usersServed ?? 0}\n` +
						`${
							queue.monster
								? `[All Time] Kills: ${dataQueue?.qtyKilledDone ?? 0}`
								: `[All Time] Runs: ${dataQueue?.qtyKilledDone ?? 0}`
						}`,
					true
				);
			});

			for (let i = 0; i < Math.ceil(availableQueues.length / 3) * 3 - availableQueues.length; i++) {
				embed.addField('\u200b', '\u200b', true);
			}
		}
		embed
			.addField(
				'\u200B',
				`Run \`${this.prefix(msg)}lfg help\` for more information.${'\u3000'.repeat(
					200 /* any big number works too*/
				)}`
			)
			.setTimestamp();

		if (msg.flagArgs.more) {
			return this.messageUser(msg, embed);
		}
		return msg.channel.send({ embeds: [embed] });
	}
}
