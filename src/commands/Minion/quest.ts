import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, objectEntries, objectKeys, shuffleArr } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveBank } from 'oldschooljs/dist/util';
import { table } from 'table';

import { Activity, Emoji, MAX_TOTAL_LEVEL } from '../../lib/constants';
import { uniQuestRewardItems } from '../../lib/data/CollectionsExport';
import { ICustomRewardCollect, IQuest, MAXQP, QuestList, Quests } from '../../lib/data/QuestExports';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, isWeekend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

export function allSkills(xpOrLevel: number): Skills {
	const toReturn = <Partial<Skills>>{};
	objectKeys(SkillsEnum).map(s => {
		toReturn[s.toLowerCase() as SkillsEnum] = xpOrLevel;
	});
	return toReturn;
}

function meetQuestRequirements(quest: IQuest, user: KlasaUser) {
	// Check requirements
	const requirementsFailure: string[] = [];
	const skills: string[] = [];
	const quests: string[] = [];
	const iron: string[] = [];

	if (quest.requirements?.combatLevel && quest.requirements?.combatLevel > user.combatLevel) {
		skills.push(`${Emoji.CombatSword} ${quest.requirements?.combatLevel}`);
	}

	// Skills
	if (quest.requirements?.level) {
		for (const [skill, level] of objectEntries(quest.requirements.level)) {
			if (user.skillLevel(skill) < level!) {
				skills.push(`${formatSkillRequirements({ [skill]: level! })} (You are **${user.skillLevel(skill)}**)`);
			}
		}
	}

	// Ironman
	if (quest.requirements?.ironman) {
		loopIronmanReq: for (const ironRequirement of quest.requirements.ironman) {
			const thisReqSkill: string[] = [];
			const thisReqItem: string[] = [];
			if (ironRequirement.skill) {
				for (const skillReqs of ironRequirement.skill) {
					const SkilLReq: string[] = [];
					for (const [skill, level] of objectEntries(skillReqs)) {
						if (user.skillLevel(skill) < level!) {
							SkilLReq.push(
								`${formatSkillRequirements({ [skill]: level! })} (You are **${user.skillLevel(
									skill
								)}**)`
							);
						} else {
							continue loopIronmanReq;
						}
					}
					thisReqSkill.push(SkilLReq.join(' and '));
				}
			}
			if (ironRequirement.items) {
				for (const itemsReq of ironRequirement.items) {
					if (!user.bank({ withGP: true }).has(itemsReq)) {
						thisReqItem.push(itemsReq.map(i => getOSItem(i).name).join(', '));
					} else {
						continue loopIronmanReq;
					}
				}
			}
			iron.push(`${thisReqSkill.join(' OR ')} OR ${thisReqItem.join(' OR ')}`);
		}
	}

	// Quest Points
	const userQP = user.settings.get(UserSettings.QP);
	if (quest.requirements?.qp && userQP < quest.requirements?.qp) {
		skills.push(`${Emoji.QuestIcon} **${quest.requirements?.qp}** QP (You have **${userQP ?? 0}**)`);
	}

	if (skills.length > 0) {
		requirementsFailure.push('**Stats**: ');
		requirementsFailure.push(skills.join(', '));
	}

	// Quests
	if (quest.requirements?.quests) {
		let questsMissing: IQuest[] = [];
		for (const q of quest.requirements?.quests) {
			if (!user.hasQuest(q)) {
				questsMissing.push(QuestList.find(_q => _q.id === q)!);
			}
		}
		if (questsMissing.length > 0) {
			quests.push(`${questsMissing.map(q => q.name).join(', ')}`);
		}
	}

	if (quests.length > 0) {
		requirementsFailure.push('**Quests**: ');
		requirementsFailure.push(quests.join(', '));
	}

	if (iron.length > 0) {
		requirementsFailure.push(`**As an ${Emoji.Ironman} Ironman**: `);
		requirementsFailure.push(iron.join('\n'));
	}

	return requirementsFailure;
}

function getQuestChain(quest: Quests): Quests[] {
	const _q = QuestList.find(l => l.id === quest)!;
	let quests: Quests[] = [];
	quests.push(quest);
	if (_q.requirements && _q.requirements.quests) {
		for (const q of _q.requirements.quests) {
			quests.push(...getQuestChain(q));
		}
	}
	quests = [...new Set(quests)];
	return quests;
}

async function grandfatherUser(msg: KlasaMessage) {
	let tempQuestList = [...QuestList];
	let userNewQp = 0;
	let userMaxQp = msg.author.settings.get(UserSettings.QP);
	let questsDone: number[] = [];

	let xpToReceive: Skills = {};
	let itemsToReceive = new Bank();

	let DQ2SpecialSequence: Quests[] = [];
	let RFDSpecialSequence: Quests[] = [];
	if (userMaxQp >= 205) DQ2SpecialSequence = getQuestChain(Quests.DragonSlayerII);
	if (userMaxQp >= 176) RFDSpecialSequence = getQuestChain(Quests.RecipeforDisaster);

	while (userNewQp < userMaxQp) {
		let questAdded = false;
		tempQuestLoop: for (let _quest of tempQuestList) {
			let value: IQuest = _quest;
			// Force Dragon Quest 2 for users with 205+ qp
			if (DQ2SpecialSequence.length > 0) {
				let nextInLine = DQ2SpecialSequence.shift();
				value = tempQuestList.find(f => f.id === nextInLine)!;
				if (!value) continue;
			}
			// Force Recipe for Disaster for users with 176+ qp
			else if (RFDSpecialSequence.length > 0) {
				let nextInLine = RFDSpecialSequence.shift();
				value = tempQuestList.find(f => f.id === nextInLine)!;
				if (!value) continue;
			} else {
				if (value.requirements?.qp && userNewQp < value.requirements?.qp) continue;
				if (value.requirements?.quests) {
					for (const q of value.requirements?.quests) {
						if (!questsDone.includes(q)) continue tempQuestLoop;
					}
				}
			}

			if (userNewQp + value.rewards.qp > userMaxQp) continue;

			questAdded = true;
			questsDone.push(value.id);
			userNewQp += value.rewards.qp;

			// Get custom rewards
			if (value.rewards.customLogic) {
				for (const customReward of value.rewards.customLogic)
					if (customReward.type === 'collect_reward') {
						// Do not allow grandfathered players to collect lamp rewards from quests completed
						questsDone.push(value.id + customReward.id);
					} else {
						const reward = customReward.function();
						if (reward[0] === 'item') itemsToReceive.add(reward[1]);
						else {
							for (const [skill, xp] of objectEntries(reward[1]))
								xpToReceive[skill] = (xpToReceive[skill] ?? 0) + xp!;
						}
					}
			}
			// Get item rewarded
			if (value.rewards.items) itemsToReceive.add(resolveBank(value.rewards.items));
			// Get xp that were to be rewarded
			if (value.rewards.xp)
				for (const [skill, xp] of objectEntries(value.rewards.xp))
					xpToReceive[skill] = (xpToReceive[skill] ?? 0) + xp!;

			delete tempQuestList[tempQuestList.findIndex(f => f.id === value.id)];
			break;
		}
		tempQuestList = tempQuestList.filter(q => q !== undefined);
		if (!questAdded) break;
	}

	const totalQuestsDone = QuestList.filter(q => questsDone.includes(q.id)).length;

	let xpStr: string[] = [];
	// Give user direct XP rewards for the quest.
	for (const [skill, xp] of objectEntries(xpToReceive)) {
		if (xp! > 0) {
			xpStr.push(
				`${await msg.author.addXP({
					skillName: skill,
					amount: xp!,
					artificial: true,
					minimal: true
				})}`
			);
		}
	}
	await msg.author.addItemsToBank(itemsToReceive, true);

	await msg.author.settings.update(UserSettings.QP, 0);
	await msg.author.settings.update(UserSettings.Quests, questsDone, {
		arrayAction: 'overwrite'
	});

	return msg.channel.send(
		`You converted your current quest point is **${userMaxQp}** into ${userNewQp}, from a total of ${totalQuestsDone} quests.${
			xpStr.length > 0 ? `\nYou received the following XP rewards: ${xpStr.join(', ')}` : ''
		}`
	);
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[collect|log|recover] [quest:...string]',
			aliases: ['q'],
			usageDelim: ' ',
			subcommands: true,
			oneAtTime: true
		});
	}

	@requiresMinion
	async log(msg: KlasaMessage, [_cmd]: [string]) {
		await msg.author.settings.sync(true);
		const userQuests = msg.author.settings.get(UserSettings.Quests);
		const totalQuestsDone = QuestList.filter(q => userQuests.includes(q.id)).length;
		let quest = undefined;
		if (_cmd) quest = QuestList.find(q => stringMatches(q.name, _cmd) || q.id === Number(_cmd));

		const canDo = [];
		const logArray: string[][] = [];
		let row = [];
		for (let i = 0; i < QuestList.length; i++) {
			row.push((QuestList[i].id / 1000).toLocaleString());
			row.push(QuestList[i].name);
			if (userQuests.includes(QuestList[i].id)) {
				row.push('Completed');
			} else if (meetQuestRequirements(QuestList[i], msg.author).length === 0) {
				row.push('Not Started');
				canDo.push(QuestList[i].name);
			} else {
				row.push('Locked');
			}
			if (row.length === 9) {
				logArray.push(row);
				row = [];
			}
		}
		if (row.length > 0) {
			logArray.push(row);
		}

		if (quest) {
			const questInfo: string[] = [];
			questInfo.push(`**ID / Name**\n${quest.id / 1000} / ${quest.name}`);
			questInfo.push(`**Length/Duration**\n${formatDuration(quest.time)}`);
			const reqs = [];
			if (quest.requirements?.qp) reqs.push(`Quest Points: ${quest.requirements.qp} QP`);
			if (quest.requirements?.combatLevel) reqs.push(`Combat Level: ${quest.requirements.combatLevel}`);
			if (quest.requirements?.level) reqs.push(`Skills: ${formatSkillRequirements(quest.requirements.level)}`);
			if (quest.requirements?.quests) {
				const reqQuests = quest.requirements.quests;
				reqs.push(
					`Quests: ${QuestList.filter(q => {
						return reqQuests.includes(q.id);
					})
						.map(q => q.name)
						.join(', ')}`
				);
			}
			questInfo.push(`**Requirements**\n${reqs.length > 0 ? reqs.join('\n') : 'None'}`);
			const rewards: string[] = [];
			rewards.push(`Quest Points: ${quest.rewards.qp} QP`);
			if (quest.rewards.xp) rewards.push(`Experience: ${formatSkillRequirements(quest.rewards.xp)}`);
			if (quest.rewards.items) rewards.push(`Items: ${new Bank(quest.rewards.items).toString()}`);
			questInfo.push(`**Rewards**\n${rewards.join('\n')}`);
			return msg.channel.send({
				content: `You have ${msg.author
					.getQP()
					.toLocaleString()} QP.\nYou have completed ${totalQuestsDone} out of ${QuestList.length} quests.${
					canDo.length > 0
						? `\nHere are some quests you can do: ${shuffleArr(canDo).slice(0, 5).join(', ')}`
						: ''
				}\n\n${questInfo.join('\n')}`
			});
		}

		const normalTable = table([
			['#', 'Quest', 'Status', '#', 'Quest', 'Status', '#', 'Quest', 'Status'],
			...logArray
		]);
		return msg.channel.send({
			content: `You have ${msg.author
				.getQP()
				.toLocaleString()} QP.\nYou have completed ${totalQuestsDone} out of ${QuestList.length} quests.${
				canDo.length > 0 ? `\nHere are some quests you can do: ${shuffleArr(canDo).slice(0, 5).join(', ')}` : ''
			}\n\nHere is your current quest log with all your quest information. Quests marked as Locked means you do not meet all requirements.`,
			files: [new MessageAttachment(Buffer.from(normalTable), 'QuestLog.txt')]
		});
	}

	@requiresMinion
	async recover(msg: KlasaMessage, [item]: [string]) {
		const userAllItems = msg.author.allItemsOwned();
		const selectedItem = getOSItem(item);
		if (!item || !selectedItem || !uniQuestRewardItems.includes(selectedItem.id)) {
			return msg.channel.send('This is not a valid quest item to recover.');
		}
		if (!msg.author.collectionLog[selectedItem.id]) {
			return msg.channel.send('You must acquire this item through questing first, before you can recover it.');
		}
		if (userAllItems.has(selectedItem.id)) {
			return msg.channel.send('You already own a copy of this item.');
		}
		await msg.author.addItemsToBank({ [selectedItem.id]: 1 }, false);
		return msg.channel.send(`You recovered **1x ${selectedItem.name}**.`);
	}

	@requiresMinion
	async collect(msg: KlasaMessage, [_cmd]: [string]) {
		const questsDone = msg.author.settings.get(UserSettings.Quests);
		if (!_cmd) {
			const canCollect = [];
			for (const questsDoneKey of QuestList) {
				const quest = QuestList.find(q => q.id === questsDoneKey.id)!;
				const { customLogic } = quest.rewards;
				if (customLogic) {
					for (const data of customLogic) {
						if (
							data.type === 'collect_reward' &&
							questsDone.includes(quest.id) &&
							!questsDone.includes(quest.id + data.id)
						) {
							canCollect.push(`\`?q collect ${quest.name.toLowerCase()} ${data.id}\``);
						}
					}
				}
			}
			return msg.channel.send({
				content: `${
					canCollect.length > 0
						? `You can collect the following rewards: ${canCollect.join(', ')}`
						: 'Nothing to collect.'
				}`
			});
		}

		const explodedCmd = _cmd.split(',');
		const rewardName = explodedCmd[0].split(' ');
		const rewardOption = explodedCmd[1];
		const rewardId = rewardName.pop();
		const questName = rewardName.join(' ');
		const quest = QuestList.find(q => stringMatches(q.name, questName) || q.id === Number(questName));
		if (!questName || !quest) {
			return msg.channel.send(
				`There is no quest called **${_cmd}**. Look on your \`+questlog\` for more infrmation on what adventures you can go!`
			);
		}

		if (!questsDone.includes(quest.id)) {
			return msg.channel.send('You have not completed this quest.');
		}

		if (!quest.rewards.customLogic || !quest.rewards.customLogic.find(c => c.type === 'collect_reward')) {
			return msg.channel.send('This quest have no collectable reward.');
		}

		const reward = quest.rewards.customLogic.find(
			c => c.type === 'collect_reward' && c.id === Number(rewardId)
		) as ICustomRewardCollect;

		if (!reward) {
			return msg.channel.send(
				`This is not a valid reward to collect. Valid options are: ${quest.rewards.customLogic.map(
					c => `?q collect ${quest.name.toLowerCase()} ${c.type === 'collect_reward' ? c.id : ''}`
				)}`
			);
		}

		if (questsDone.includes(quest.id + reward.id)) {
			return msg.channel.send('You already collected this reward.');
		}

		const tryXp = await reward.function(msg, rewardOption);
		if (tryXp && !Array.isArray(tryXp)) await msg.author.completeQuest(quest.id + reward.id);
		else if (Array.isArray(tryXp)) {
			return msg.channel.send(tryXp[1]);
		}
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [_quest]: [string]) {
		let quest: IQuest | undefined = undefined;
		await msg.author.settings.sync(true);
		const questsDone = msg.author.settings.get(UserSettings.Quests);

		if (questsDone.length === 0 && msg.author.settings.get(UserSettings.QP) > 0) {
			return grandfatherUser(msg);
		}

		if (msg.author.getQP() === MAXQP) {
			let str = 'You have done all the quests! 🎉 Congratulations!';
			if (!msg.author.allItemsOwned().has('Quest point cape')) {
				str += `\nYou can buy a **Quest point cape** for 99K by using \`${msg.cmdPrefix}buy quest cape\`.`;
			}
			return msg.channel.send(str);
		}

		if (!_quest) {
			for (const q of QuestList) {
				if (questsDone.includes(q.id)) continue;
				if (meetQuestRequirements(q, msg.author).length === 0) {
					quest = q;
					break;
				}
			}
			if (!quest) {
				return msg.channel.send(
					'You dont have the requirements to do any quest at the moment! You can check your quest log for more information on what you are missing!'
				);
			}
		} else {
			quest = QuestList.find(q => stringMatches(q.name, _quest) || q.id === Number(_quest));
			if (!quest) {
				return msg.channel.send(
					`There is no quest called **${_quest}**. Look on your \`+questlog\` for more infrmation on what adventures you can go!`
				);
			}
			if (questsDone.includes(quest.id)) {
				return msg.channel.send(`You already completed the quest **${quest.name}**.`);
			}
			const requirementsFailure = meetQuestRequirements(quest, msg.author);
			if (requirementsFailure.length > 0) {
				return msg.channel.send(
					`You do not meet all the requirements for the quest **${
						quest.name
					}**. You are missing:\n${requirementsFailure.join('\n')}`
				);
			}
		}

		let duration = quest.time;
		const boost: string[] = [];
		if (isWeekend()) {
			boost.push('5% for weekend');
			duration *= 0.95;
		}
		if (msg.author.hasGracefulEquipped()) {
			boost.push('5% for having graceful equipped');
			duration *= 0.95;
		}
		// Give some boost based on user total level
		const ttlBoost = (calcWhatPercent(msg.author.totalLevel(), MAX_TOTAL_LEVEL) * 5) / 10_000;
		duration *= 1 - ttlBoost;
		boost.push(`${(ttlBoost * 100).toFixed(2)}% for your total level`);

		await addSubTaskToActivityTask<QuestingActivityTaskOptions>({
			type: Activity.Questing,
			questID: quest.id,
			duration,
			userID: msg.author.id,
			channelID: msg.channel.id
		});

		return msg.channel.send(
			`${msg.author.minionName} is now on an adventure, doing ${
				!quest.name.toLowerCase().startsWith('the') ? 'the ' : ''
			}**${quest.name}** quest. It says it will be back in around ${formatDuration(duration)}.${
				boost.length > 0 ? `\n**Boosts:** ${boost.join(', ')}` : ''
			}`
		);
	}
}
