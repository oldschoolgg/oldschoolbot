import { MessageButton, MessageSelectMenu } from 'discord.js';
import { objectEntries, objectKeys, objectValues, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveBank, toKMB } from 'oldschooljs/dist/util';

import { Activity, Emoji, skillEmoji } from '../../lib/constants';
import { ICustomRewardCollect, IQuest, QuestList, Quests } from '../../lib/data/QuestExports';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { completeUserQuestID } from '../../tasks/minions/questingActivity';

export const MAXQP = QuestList.map(q => q.rewards.qp).reduce(
	(previousValue, currentValue) => previousValue + currentValue
);

export function allSkills(xpOrLevel: number): Skills {
	const toReturn = <Partial<Skills>>{};
	objectKeys(SkillsEnum).map(s => {
		toReturn[s.toLowerCase() as SkillsEnum] = xpOrLevel;
	});
	return toReturn;
}

async function addExp(
	msg: KlasaMessage,
	skillName: SkillsEnum,
	skills: Skills,
	requirements?: Skills
): Promise<[boolean, string]> {
	if (!skills[skillName]) {
		return [false, 'This is not a valid skill for this item.'];
	}

	// if ((await this.lockedSkills()).includes(skillName)) {
	// 	return [false, `A magical force is preventing you from receiving XP in ${skillName}.`];
	// }

	if (requirements && msg.author.skillLevel(skillName) < requirements[skillName]!) {
		return [
			false,
			`You are not string enough to receive this reward. You need level **${requirements[
				skillName
			]!}** in ${skillName} to receive it.`
		];
	}

	let amount = skills[skillName]!;
	const userXp = msg.author.rawSkills[skillName]!;

	if (userXp === 200_000_000) return [false, `You are already 200m exp in ${skillName} and can't receive any more.`];

	if (amount + userXp > 200_000_000) {
		if (!msg.flagArgs.cf && !msg.flagArgs.confirm)
			return [
				false,
				`This will waste more XP than necessary to max your ${skillName} xp. To force this, use \`--cf\` or use a lower quantity.`
			];
		amount = 200_000_000 - userXp;
	}
	return [true, await msg.author.addXP({ skillName, amount })];
}

export async function xpReward(
	msg: KlasaMessage,
	skills: Skills | Skills[],
	requirements?: Skills,
	selectedOption?: SkillsEnum | string
): Promise<boolean | [false, string]> {
	let options = [];
	if (Array.isArray(skills)) {
		options = skills.map((opts, index) => {
			return {
				label: `Option ${index + 1}`,
				description: `${objectKeys(opts).join(', ')}`,
				value: `${index}`,
				emoji: skillEmoji[objectKeys(opts)[0]]
			};
		});
	} else {
		options = await Promise.all(
			objectEntries(skills).map(async skill => {
				const userXp = msg.author.rawSkills[skill[0]]!;
				const userLevel = msg.author.skillLevel(skill[0]);
				const requiredLevel = requirements && requirements[skill[0]] ? requirements[skill[0]]! : 0;

				let hasReq = userLevel >= requiredLevel;

				let emoji = hasReq ? skillEmoji[skill[0]] : Emoji.RedX;
				let description = hasReq ? 'You can select this!' : `You need level ${requirements![skill[0]]}.`;
				if (userXp === 200_000_000) description = `You are already 200m in ${skill[0]}`;
				// if ((await this.lockedSkills()).includes(skill[0])) description = 'This skill is locked.';

				let label = `${skill[1]!.toLocaleString()} in ${skill[0].toString()}`;
				if (label.length > 25) label = `${toKMB(skill[1]!)} in ${skill[0].toString()}`;
				if (label.length > 25) label = `${toKMB(skill[1]!)} in ${skill[0].toString().slice(0, 3)}`;

				return { label, description, value: `${skill[0]}`, emoji };
			})
		);
	}
	if (!selectedOption) {
		const selectedMessage = await msg.channel.send({
			content: 'Please, select your reward from the list below.',
			components: [
				[
					new MessageSelectMenu({
						type: 3,
						customID: 'xpSelect',
						options,
						placeholder: 'Select a reward...'
					})
				]
			]
		});
		try {
			const selection = await selectedMessage.awaitMessageComponentInteraction({
				filter: i => {
					if (i.user.id !== msg.author.id) {
						i.reply({
							ephemeral: true,
							content: 'This reward is not for you.'
						});
						return false;
					}
					return true;
				},
				time: Time.Second * 15
			});
			if (selection.isSelectMenu() && selection.values) {
				if (Array.isArray(skills)) {
					const msgAddXp: [boolean, string][] = [];
					for (const skill of objectEntries(skills[Number(selection.values)])) {
						const res = await addExp(msg, skill[0], { [skill[0]]: skill[1]! }, requirements);
						if (!res[0]) return [false, res[1]];
						msgAddXp.push(res);
					}
					await selectedMessage.edit({ components: [], content: msgAddXp.map(x => x[1]).join(', ') });
					return true;
				}
				const msgAddXp = await addExp(msg, selection.values[0] as SkillsEnum, skills, requirements);
				if (!msgAddXp[0]) return [false, msgAddXp[1]];
				await selectedMessage.edit({ components: [], content: msgAddXp[1] });
				return true;
			}
			await selectedMessage.edit({ components: [], content: 'This is not a valid option.' });
			return false;
		} catch (e) {
			await selectedMessage.edit({ components: [], content: 'Please, try again.' });
			return false;
		}
	} else {
		if (Array.isArray(skills)) {
			const msgAddXp: [boolean, string][] = [];
			const selection = skills[Number(selectedOption)];
			if (!selection) return false;
			for (const skill of objectEntries(skills[Number(selectedOption)])) {
				const res = await addExp(msg, skill[0], { [skill[0]]: skill[1]! }, requirements);
				if (!res[0]) return [false, res[1]];
				msgAddXp.push(res);
			}
			await msg.channel.send({ content: msgAddXp.map(x => x[1]).join(', ') });
			return true;
		}
		if (!objectValues(SkillsEnum).includes(selectedOption as SkillsEnum)) return false;
		const msgAddXp = await addExp(msg, selectedOption as SkillsEnum, skills, requirements);
		if (!msgAddXp[0]) return [false, msgAddXp[1]];
		await msg.channel.send({ content: msgAddXp[1] });
		return true;
	}
}

function meetQuestRequirements(quest: IQuest, user: KlasaUser) {
	// Check requirements
	const requirementsFailure: string[] = [];
	const skills: string[] = [];
	const quests: string[] = [];

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
			const questsDone = user.settings.get(UserSettings.Quests);
			if (!questsDone.includes(q)) {
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

	return requirementsFailure;
}

async function grandfatherUser(msg: KlasaMessage) {
	let tempQuestList = [...QuestList];
	tempQuestList.sort((a, b) => b.rewards.qp - a.rewards.qp);
	let userNewQp = 0;
	let userMaxQp = msg.author.settings.get(UserSettings.QP);
	let questsDone: number[] = [];
	let i = 0;

	let xpToReceive: Skills = {};
	let itemsToReceive = new Bank();

	while (userNewQp < userMaxQp) {
		let questAdded = false;
		tempQuestLoop: for (let index = 0; index < tempQuestList.length; index++) {
			const value = tempQuestList[index];
			if (value.requirements?.qp && userNewQp < value.requirements?.qp) continue;
			if (value.requirements?.quests) {
				for (const q of value.requirements?.quests) {
					if (!questsDone.includes(q)) {
						continue tempQuestLoop;
					}
				}
			}
			i++;
			questAdded = true;
			questsDone.push(value.id);
			userNewQp += value.rewards.qp;

			// Get custom rewards
			if (value.rewards.customLogic) {
				for (const customReward of value.rewards.customLogic)
					if (customReward.type === 'collect_reward') questsDone.push(value.id + customReward.id);
			}
			// Get item rewarded
			if (value.rewards.items) itemsToReceive.add(resolveBank(value.rewards.items));
			// Get xp that were to be rewarded
			if (value.rewards.xp)
				for (const [skill, xp] of objectEntries(value.rewards.xp))
					xpToReceive[skill] = (xpToReceive[skill] ?? 0) + xp!;

			delete tempQuestList[index];
			break;
		}
		tempQuestList = tempQuestList.filter(q => q !== undefined);
		if (!questAdded) break;
	}

	await msg.confirm(
		`You are about to convert your old quest points into the new Quest system.
Your current quest point is **${userMaxQp}**. That will be converted into ${userNewQp}, from a total of ${i} quests.
**You will not receive any reward from having these quests completed.**
If you want to receve quest rewards, you'll have to start over in the new quest system.
For that, you'll have **ONE** chance to reset your quest points and start over.
In your first quest trip after clicking Confirm below, you'll receive the option to reset or not..`
	);
	questsDone.push(Quests.Grandfathered);
	await msg.author.settings.update(UserSettings.QP, userNewQp);
	await msg.author.settings.update(UserSettings.Quests, questsDone, {
		arrayAction: 'overwrite'
	});

	return msg.channel.send('Your quests have been updated.');
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[collect|log] [quest:...string]',
			aliases: ['q'],
			usageDelim: ' ',
			subcommands: true,
			oneAtTime: true
		});
	}

	async log(msg: KlasaMessage, [_cmd]: [string]) {
		await msg.author.settings.sync(true);
		const userQuests = msg.author.settings.get(UserSettings.Quests);
		let result = `Current QP: ${msg.author.settings.get(UserSettings.QP)} / ${MAXQP}\n`;
		for (const quest of QuestList) {
			result += `${userQuests.includes(quest.id) ? '[DONE]' : ''} ${quest.name}\n`;
		}
		result = String(result);
		console.log(Boolean(msg), _cmd);
		return msg.channel.send(result);
	}

	@requiresMinion
	@minionNotBusy
	async collect(msg: KlasaMessage, [_cmd]: [string]) {
		console.log('collect', _cmd);
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
		if (tryXp && !Array.isArray(tryXp)) await completeUserQuestID(msg.author, quest.id + reward.id);
		else if (Array.isArray(tryXp)) {
			return msg.channel.send(tryXp[1]);
		} else {
			return msg.channel.send('It was not possible to collect this award.');
		}
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [_quest]: [string]) {
		console.log('run', _quest);
		let quest: IQuest | undefined = undefined;
		await msg.author.settings.sync(true);
		const questsDone = msg.author.settings.get(UserSettings.Quests);

		if (questsDone.length === 0 && msg.author.settings.get(UserSettings.QP) > 0) {
			return grandfatherUser(msg);
		}

		if (questsDone.includes(Quests.Grandfathered)) {
			const message = await msg.channel.send({
				content:
					'You still have the option to reset your quests. Are you sure you want to do a quest anyway?\n**If you press yes, you wont be able to reset anymore! You have been warned!**',
				components: [
					[
						new MessageButton({
							type: 'BUTTON',
							customID: 'doitanyway',
							style: 'PRIMARY',
							label: 'Yes, I do not want to reset'
						}),
						new MessageButton({
							type: 'BUTTON',
							customID: 'takemeoutofhere',
							style: 'SECONDARY',
							label: 'Not sure yet, take me out of here.'
						}),
						new MessageButton({
							type: 'BUTTON',
							customID: 'resetme',
							style: 'DANGER',
							label: 'No, I want to reset my quests!'
						})
					]
				]
			});
			try {
				const selection = await message.awaitMessageComponentInteraction({
					filter: i => {
						if (i.user.id !== msg.author.id) {
							i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
							return false;
						}
						return true;
					}
				});
				if (selection.customID === 'resetme') {
					await msg.author.settings.update(UserSettings.QP, 0);
					await msg.author.settings.update(UserSettings.Quests, [], { arrayAction: 'overwrite' });
					return message.edit({
						content:
							'You now have 0 quest points. You can start doing quests by issuing `+q` or choosing a quest by hand, by doing, for example, `+q waterfall quest`.',
						components: []
					});
				}
				if (selection.customID === 'takemeoutofhere') {
					return message.edit({
						content: "You'll be asked again the next time you try to do a quest trip.",
						components: []
					});
				}
				await message.delete();
			} catch (e) {
				return message.edit({
					content: "You'll be asked again the next time you try to do a quest trip.",
					components: []
				});
			}
		}

		if (questsDone.length === QuestList.length) {
			return msg.channel.send('You have done all the quests! Congratulations!');
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
				return msg.channel.send('You dont have the requirements to do any quest at the moment!');
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

		await addSubTaskToActivityTask<QuestingActivityTaskOptions>({
			type: Activity.Questing,
			questID: quest.id,
			duration: quest.time,
			userID: msg.author.id,
			channelID: msg.channel.id
		});

		return msg.channel.send(
			`${msg.author.minionName} is now on an adventure, doing **${
				quest.name
			}** quest. It says it will be back in around ${formatDuration(quest.time)}`
		);
	}
}
