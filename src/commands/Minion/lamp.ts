import { ArrayActions } from '@klasa/settings-gateway';
import { MessageSelectMenu } from 'discord.js';
import { objectEntries, objectValues, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemID, toKMB } from 'oldschooljs/dist/util';

import { Emoji, skillEmoji } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import getOSItem from '../../lib/util/getOSItem';

interface IXPLamp {
	itemID: number;
	amount: number;
	name: string;
	minimumLevel: number;
}

export const XPLamps: IXPLamp[] = [
	{
		itemID: 11_137,
		amount: 2500,
		name: 'Antique lamp 1',
		minimumLevel: 1
	},
	{
		itemID: 11_139,
		amount: 7500,
		name: 'Antique lamp 2',
		minimumLevel: 30
	},
	{
		itemID: 11_141,
		amount: 15_000,
		name: 'Antique lamp 3',
		minimumLevel: 40
	},
	{
		itemID: 11_185,
		amount: 50_000,
		name: 'Antique lamp 4',
		minimumLevel: 70
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Uses an item that gives XP',
			cooldown: 3,
			usageDelim: ' ',
			usage: '[qty:int] [cmd:...string]',
			examples: ['+lamp 1 dark relic', '+lamp 1 antique lamp 3 agility'],
			categoryFlags: ['minion'],
			oneAtTime: true
		});
	}

	async lockedSkills() {
		await this.client.settings.sync(true);
		return this.client.settings.get(ClientSettings.LockedSkills);
	}

	darkRelic(user: KlasaUser, qty: number): [Skills, Skills | undefined] {
		const skills: Skills = {};
		const requirements: Skills | undefined = {};
		for (const skill of objectValues(SkillsEnum)) {
			skills[skill] =
				user.skillLevel(skill) *
				([
					SkillsEnum.Mining,
					SkillsEnum.Woodcutting,
					SkillsEnum.Herblore,
					SkillsEnum.Farming,
					SkillsEnum.Hunter,
					SkillsEnum.Cooking,
					SkillsEnum.Fishing,
					SkillsEnum.Thieving,
					SkillsEnum.Firemaking,
					SkillsEnum.Agility
				].includes(skill)
					? 150
					: 50) *
				qty;
			requirements[skill] = 1;
		}
		return [skills, requirements];
	}

	levelMultiplier(user: KlasaUser, qty: number, multiplyer: number): [Skills, Skills | undefined] {
		const skills: Skills = {};
		const requirements: Skills | undefined = {};
		for (const skill of objectValues(SkillsEnum)) {
			skills[skill] = user.skillLevel(skill) * multiplyer * qty;
			requirements[skill] = 1;
		}
		return [skills, requirements];
	}

	diaryLamp(qty: number, lamp: IXPLamp): [Skills, Skills | undefined] {
		const skills: Skills = {};
		const requirements: Skills | undefined = {};
		for (const skill of objectValues(SkillsEnum)) {
			skills[skill] = lamp.amount * qty;
			requirements[skill] = lamp.minimumLevel;
		}
		return [skills, requirements];
	}

	async addExp(
		msg: KlasaMessage,
		skillName: SkillsEnum,
		skills: Skills,
		requirements?: Skills
	): Promise<[boolean, string]> {
		if (!skills[skillName]) {
			return [false, 'This is not a valid skill for this item.'];
		}

		if ((await this.lockedSkills()).includes(skillName)) {
			return [false, `A magical force is preventing you from receiving XP in ${skillName}.`];
		}

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

		if (userXp === 200_000_000)
			return [false, `You are already 200m exp in ${skillName} and can't receive any more.`];

		if (amount + userXp > 200_000_000) {
			if (!msg.flagArgs.cf && !msg.flagArgs.confirm)
				return [
					false,
					`This will waste more XP than necessary to max your ${skillName} xp. To force this, use \`--cf\` or use a lower quantity.`
				];
			amount = 200_000_000 - userXp;
		}
		return [true, `You received ${await msg.author.addXP({ skillName, amount })}`];
	}

	async xpReward(msg: KlasaMessage, skills: Skills, requirements?: Skills) {
		const options = await Promise.all(
			objectEntries(skills).map(async skill => {
				const userXp = msg.author.rawSkills[skill[0]]!;
				const userLevel = msg.author.skillLevel(skill[0]);
				const requiredLevel = requirements && requirements[skill[0]] ? requirements[skill[0]]! : 0;

				let hasReq = userLevel >= requiredLevel;

				let emoji = hasReq ? skillEmoji[skill[0]] : Emoji.RedX;
				let description = hasReq ? 'You can select this!' : `You need level ${requirements![skill[0]]}.`;
				if (userXp === 200_000_000) description = `You are already 200m in ${skill[0]}`;
				if ((await this.lockedSkills()).includes(skill[0])) description = 'This skill is locked.';

				let label = `${skill[1]!.toLocaleString()} in ${skill[0].toString()}`;
				if (label.length > 25) label = `${toKMB(skill[1]!)} in ${skill[0].toString()}`;
				if (label.length > 25) label = `${toKMB(skill[1]!)} in ${skill[0].toString().slice(0, 3)}`;

				return { label, description, value: `${skill[0]}`, emoji };
			})
		);

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
				const msgAddXp = await this.addExp(msg, selection.values[0] as SkillsEnum, skills, requirements);
				await selectedMessage.edit({ components: [], content: msgAddXp[1] });
				return msgAddXp[0];
			}
			await selectedMessage.edit({ components: [], content: 'This is not a valid option.' });
			return false;
		} catch (e) {
			await selectedMessage.edit({ components: [], content: 'Please, try again.' });
			return false;
		}
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [qty, cmd]: [number, string]) {
		await msg.author.settings.sync(true);

		if (this.client.owners.has(msg.author)) {
			if (objectValues(SkillsEnum).includes(cmd as SkillsEnum)) {
				const lockedSkills = await this.lockedSkills();
				if (msg.flagArgs.add && !lockedSkills.includes(cmd as SkillsEnum)) {
					await this.client.settings.update(ClientSettings.LockedSkills, cmd as SkillsEnum, {
						arrayAction: ArrayActions.Add
					});
					return msg.channel.send(`Added ${cmd} to the list of locked skills.`);
				} else if (msg.flagArgs.remove && lockedSkills.includes(cmd as SkillsEnum)) {
					await this.client.settings.update(ClientSettings.LockedSkills, cmd as SkillsEnum, {
						arrayAction: ArrayActions.Remove
					});
					return msg.channel.send(`Removed ${cmd} to the list of locked skills.`);
				}
			} else if (msg.flagArgs.add || msg.flagArgs.remove) {
				return msg.channel.send(`${cmd} is not a valid skill to add/remove.`);
			}
		}

		if (!qty && !cmd) {
			return msg.channel.send(
				'You can use this command by doing `+use [qty] (item_to_use) [skill]`. Qty and Skill are optional.'
			);
		}

		// Defaults qty if not informed
		if (qty === undefined) qty = 1;

		if (qty && !cmd) {
			cmd = qty.toString();
			qty = 1;
		}

		// Default item to nothing and skill to the last word informed
		let selectedItem: Item | undefined = undefined;
		let skill: string | undefined = cmd.split(' ').pop();

		// If the word selected to the skill is not valid, use everything as the name of the item
		if (!objectValues(SkillsEnum).includes(skill as SkillsEnum)) {
			selectedItem = getOSItem(cmd);
			skill = undefined;
		} else {
			selectedItem = getOSItem(cmd.split(' ').slice(0, -1).join(' '));
		}

		if (!selectedItem || cmd === skill) return msg.channel.send('This is not a valid item to use.');

		// Prepare the items to be removed from the user bank
		const toRemoveFromBank = new Bank({ [selectedItem.id]: qty });

		if (!msg.author.bank().has(toRemoveFromBank.bank)) {
			return msg.channel.send(`You don't have **${toRemoveFromBank}** in your bank.`);
		}

		let skillsToReceive: Skills = {};
		let skillsRequirements: Skills | undefined = undefined;

		// Iterate over valid items to use and execute their specific functions
		// The function MUST result [Skill, Skill], where the first is an object with the skills and the xp to be awarded
		// and the second the skills and the level required to receive the xp. The latter can be undefined
		switch (selectedItem.id) {
			case itemID('Dark relic'):
				[skillsToReceive, skillsRequirements] = this.darkRelic(msg.author, qty);
				break;
			case itemID('Genie lamp'):
				[skillsToReceive, skillsRequirements] = this.levelMultiplier(msg.author, qty, 10);
				break;
			case itemID('Book of knowledge'):
				[skillsToReceive, skillsRequirements] = this.levelMultiplier(msg.author, qty, 15);
				break;
			case itemID('Antique lamp 1'):
			case itemID('Antique lamp 2'):
			case itemID('Antique lamp 3'):
			case itemID('Antique lamp 4'):
				[skillsToReceive, skillsRequirements] = this.diaryLamp(
					qty,
					XPLamps.find(l => l.itemID === selectedItem!.id)!
				);
				break;
			default:
				return msg.channel.send('This is not a valid item to use.');
		}

		// Automatically uses the item on the skill selected in the command
		if (skill) {
			if (!skillsToReceive[skill as SkillsEnum]) {
				return msg.channel.send('You use this item on this skill.');
			}
			await msg.confirm(
				`Would you like to receive **${skillsToReceive[
					skill as SkillsEnum
				]!.toLocaleString()}** experience in **${skill}**?`
			);

			const msgAddExp = await this.addExp(msg, skill as SkillsEnum, skillsToReceive, skillsRequirements);
			if (msgAddExp[0]) await msg.author.removeItemsFromBank(toRemoveFromBank);
			return msg.channel.send({ content: msgAddExp[1] });
		}

		if (await this.xpReward(msg, skillsToReceive, skillsRequirements)) {
			await msg.author.removeItemsFromBank(toRemoveFromBank);
		}
	}
}
