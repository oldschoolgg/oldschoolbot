import { Task, KlasaMessage } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { SkillsEnum } from '../../lib/skilling/types';
import { Events, Time, Emoji, PerkTier } from '../../lib/constants';
import { noOp, saidYes, roll, addBanks } from '../../lib/util';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { Monsters } from 'oldschooljs';
import clueTiers from '../../lib/minions/data/clueTiers';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import MinionCommand from '../../commands/Minion/minion';
import announceLoot from '../../lib/minions/functions/announceLoot';
import streakPoints from '../../lib/skilling/skills/slayer/slayerFunctions/streakPoints';
import slayerMasters from '../../lib/skilling/skills/slayer/slayerMasters';

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity, duration }: MonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		const currentMonsterData = Monsters.find(mon => mon.id === monsterID)?.data;

		user.incrementMinionDailyDuration(duration);

		const logInfo = `MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		// Checks if part of current slayer task
		const slayerInfo = user.settings.get(UserSettings.Slayer.SlayerInfo);
		const unlockList = user.settings.get(UserSettings.Slayer.UnlockedList);
		const currentLevel = user.skillLevel(SkillsEnum.Slayer);
		let onSlayer = false;
		let completedTask = null;
		let xpReceived = 0;
		let slayerPointsReceived = 0;
		let superiorQuantity = 0;
		let newLevel = 0;
		let alsoSlayerTask = false;

		// Checking for alternative monsters on current task.
		if (slayerInfo.hasTask) {
			for (const tempMonstID of slayerInfo.currentTask?.Id!) {
				if (tempMonstID === monsterID) {
					alsoSlayerTask = true;
					break;
				}
			}
		}

		if (
			slayerInfo.hasTask &&
			(monster.name.toLowerCase() === slayerInfo.currentTask?.name.toLowerCase() ||
				alsoSlayerTask)
		) {
			onSlayer = true;
			// Handle Double trouble unlock
			let doubleTrouble = 0;
			if (monster.name.toLowerCase() === 'grotesque guardians') {
				for (const unlock of unlockList) {
					if (unlock.name.toLowerCase() === 'double trouble') {
						doubleTrouble = quantity;
						break;
					}
				}
			}
			const quantityLeft = slayerInfo.remainingQuantity! - quantity - doubleTrouble;

			xpReceived = quantity * currentMonsterData!.slayerXP;
			await user.addXP(SkillsEnum.Slayer, xpReceived);
			newLevel = user.skillLevel(SkillsEnum.Slayer);

			// Checks if current monster got superior version
			if (monster.superiorTable) {
				// Checks if the user got the superiors unlocked and rolls according to quantity left on task
				for (const unlock of unlockList) {
					if (unlock.name.toLowerCase() === 'bigger and badder') {
						if (quantityLeft <= 0) {
							for (let i = 0; i < slayerInfo.remainingQuantity!; i++) {
								if (roll(200)) {
									superiorQuantity++;
								}
							}
						} else {
							for (let i = 0; i < quantity; i++) {
								if (roll(200)) {
									superiorQuantity++;
								}
							}
						}
						break;
					}
				}
			}

			if (quantityLeft > 0) {
				const newSlayerInfo = {
					...slayerInfo,
					remainingQuantity: quantityLeft
				};
				await user.settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
					arrayAction: 'overwrite'
				});
			} else {
				xpReceived = slayerInfo.remainingQuantity! * currentMonsterData!.slayerXP;
				completedTask = slayerInfo.currentTask;
				if (slayerInfo.currentMaster === 2) {
					const currentSlayerMaster = slayerMasters.find(master => master.masterId === 2);
					slayerPointsReceived = streakPoints(
						slayerInfo.wildyStreak,
						currentSlayerMaster!
					);
					const newSlayerInfo = {
						...slayerInfo,
						hasTask: false,
						currentTask: null,
						quantityTask: null,
						remainingQuantity: null,
						currentMaster: null,
						slayerPoints: slayerInfo.slayerPoints + slayerPointsReceived,
						wildyStreak: slayerInfo.wildyStreak + 1
					};
					await user.settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
						arrayAction: 'overwrite'
					});
				} else {
					const currentSlayerMaster = slayerMasters.find(
						master => master.masterId === slayerInfo.currentMaster
					);
					slayerPointsReceived = streakPoints(slayerInfo.streak, currentSlayerMaster!);
					const newSlayerInfo = {
						...slayerInfo,
						hasTask: false,
						currentTask: null,
						quantityTask: null,
						remainingQuantity: null,
						currentMaster: null,
						slayerPoints: slayerInfo.slayerPoints + slayerPointsReceived,
						streak: slayerInfo.streak + 1
					};
					await user.settings.update(UserSettings.Slayer.SlayerInfo, newSlayerInfo, {
						arrayAction: 'overwrite'
					});
				}
			}
		}

		let loot = monster.table.kill(quantity - superiorQuantity);

		if (monster.superiorTable) {
			loot = addBanks([monster.superiorTable.kill(superiorQuantity), loot]);
		}

		announceLoot(this.client, user, monster, quantity, loot);

		await user.addItemsToBank(loot, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user
			);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received Minion Loot - ${logInfo}`
		);
		// Track amount of superior versions recieved?
		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) +
			quantity}, You also got ${superiorQuantity} superiors. ${
			user.minionName
		} asks if you'd like them to do another trip of ${quantity} ${monster.name}.`;

		if (onSlayer) {
			str += `\n\n You also received ${xpReceived.toLocaleString()} Slayer XP!`;
			if (slayerInfo.remainingQuantity! - quantity > 0) {
				str += `  You still need to kill ${slayerInfo.remainingQuantity! -
					quantity} more to complete your task.`;
			}
			if (newLevel > currentLevel) {
				str += `\n\n${user.minionName}'s Slayer level is now ${newLevel}!`;
			}
			if (completedTask !== null) {
				str += `\n\n${user.minionName} also completed the task ${
					completedTask.name
				} and received ${slayerPointsReceived.toLocaleString()} Slayer points! You now got ${slayerInfo.slayerPoints! +
					slayerPointsReceived} Slayer points in total.`;
				// Add milestones for streaks? and leaderboard for longest streak?
				if (slayerInfo.currentMaster === 2) {
					str += ` You are on a ${slayerInfo.wildyStreak + 1} wildy task streak!`;
				} else {
					str += ` You are on a ${slayerInfo.streak + 1} task streak!`;
				}
			}
		}

		const clueTiersReceived = clueTiers.filter(tier => loot[tier.scrollID] > 0);

		if (clueTiersReceived.length > 0) {
			str += `\n ${Emoji.Casket} You got clue scrolls in your loot (${clueTiersReceived
				.map(tier => tier.name)
				.join(', ')}).`;
			if (getUsersPerkTier(user) > PerkTier.One) {
				str += `\n\nSay "C" if you want to complete this ${clueTiersReceived[0].name} clue now.`;
			} else {
				str += `\n\nYou can get your minion to complete them using \`+minion clue easy/medium/etc \``;
			}
		}

		user.incrementMonsterScore(monsterID, quantity);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str, new MessageAttachment(image));
			channel
				.awaitMessages(
					(msg: KlasaMessage) => {
						if (msg.author !== user) return false;
						return (
							(getUsersPerkTier(user) > PerkTier.One &&
								msg.content.toLowerCase() === 'c') ||
							saidYes(msg.content)
						);
					},
					{
						time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
						max: 1
					}
				)
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;

						if (
							getUsersPerkTier(user) > PerkTier.One &&
							response.content.toLowerCase() === 'c'
						) {
							(this.client.commands.get(
								'minion'
							) as MinionCommand).clue(response as KlasaMessage, [
								1,
								clueTiersReceived[0].name
							]);
							return;
						}

						user.log(`continued trip of ${quantity}x ${monster.name}[${monster.id}]`);

						this.client.commands
							.get('minion')!
							.kill(response as KlasaMessage, [quantity, monster.name]);
					}
				})
				.catch(noOp);
		});
	}
}
