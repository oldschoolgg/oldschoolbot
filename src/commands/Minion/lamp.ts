import { ArrayActions } from '@klasa/settings-gateway';
import { MessageButton, MessageSelectMenu } from 'discord.js';
import { objectEntries, objectValues, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { Emoji, skillEmoji } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Skills } from '../../lib/types';
import { convertXPtoLVL, toTitleCase } from '../../lib/util';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';

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

interface IFunctionData {
	user: KlasaUser;
	item: number;
	quantity: number;
}

interface IXPObject {
	items: number[];
	function: (data: IFunctionData) => [Skills, Skills | undefined];
}

const XPObjects: IXPObject[] = [
	{
		items: resolveItems(['Dark relic']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] =
					data.user.skillLevel(skill) *
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
					data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Genie lamp']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] = data.user.skillLevel(skill) * 10 * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Book of knowledge']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] = data.user.skillLevel(skill) * 15 * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Antique lamp 1', 'Antique lamp 2', 'Antique lamp 3', 'Antique lamp 4']),
		function: data => {
			const lamp = XPLamps.find(l => l.itemID === data.item)!;
			const skills: Skills = {};
			const requirements: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				skills[skill] = lamp.amount * data.quantity;
				requirements[skill] = lamp.minimumLevel;
			}
			return [skills, requirements];
		}
	},
	{
		items: resolveItems(['Book of arcane knowledge']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				if (skill !== SkillsEnum.Magic && skill !== SkillsEnum.Runecraft) {
					continue;
				}
				skills[skill] =
					data.user.skillLevel(skill) * ([SkillsEnum.Magic].includes(skill) ? 11 : 4) * data.quantity;
			}
			return [skills, undefined];
		}
	},
	{
		items: resolveItems(['Training manual']),
		function: data => {
			const skills: Skills = {};
			for (const skill of objectValues(SkillsEnum)) {
				if (
					![SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Hitpoints].includes(skill)
				) {
					continue;
				}
				skills[skill] =
					Math.round(Number(Math.pow(data.user.skillLevel(skill), 2)) / 4 + 7 * data.user.skillLevel(skill)) *
					data.quantity;
			}
			return [skills, undefined];
		}
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
			categoryFlags: ['minion']
		});
	}

	async lockedSkills() {
		await this.client.settings.sync(true);
		return this.client.settings.get(ClientSettings.LockedSkills);
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
				`You are not skilled enough to receive this reward. You need level **${requirements[
					skillName
				]!}** in ${skillName} to receive it.`
			];
		}

		let amount = skills[skillName]!;
		const artificial = true;
		return [true, await msg.author.addXP({ skillName, amount, artificial })];
	}

	async xpReward(msg: KlasaMessage, skills: Skills, requirements?: Skills) {
		const options = await Promise.all(
			objectEntries(skills).map(async skill => {
				const userXp = msg.author.rawSkills[skill[0]]!;
				const userLevel = msg.author.skillLevel(skill[0]);
				const newUserLevel = convertXPtoLVL(userXp + skill[1]!);
				const requiredLevel = requirements && requirements[skill[0]] ? requirements[skill[0]]! : 0;

				let hasReq = userLevel >= requiredLevel;

				let emoji = hasReq ? skillEmoji[skill[0]] : Emoji.RedX;
				let description = hasReq
					? newUserLevel !== userLevel
						? `You will level up to level ${newUserLevel.toLocaleString()}!`
						: 'You can select this!'
					: `You need level ${requirements![skill[0]]}.`;
				if (userXp === 200_000_000) description = `You are already 200m in ${skill[0]}`;
				if ((await this.lockedSkills()).includes(skill[0])) description = 'This skill is locked.';

				let label = `${skill[1]!.toLocaleString()} XP in ${skill[0].toString()}`;
				if (label.length > 100) label = `${toKMB(skill[1]!)} XP in ${skill[0].toString()}`;
				if (label.length > 100) label = `${toKMB(skill[1]!)} XP in ${skill[0].toString().slice(0, 3)}`;

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
				],
				[
					new MessageButton({
						customID: 'cancelXpSelection',
						label: 'Cancel',
						style: 'DANGER'
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
			if (selection.isButton() && selection.customID === 'cancelXpSelection') {
				await selectedMessage.edit({ components: [], content: 'Cancelled XP selection. No items were used.' });
				return false;
			}
			await selectedMessage.edit({ components: [], content: 'This is not a valid option.' });
			return false;
		} catch (e) {
			await selectedMessage.edit({ components: [], content: 'Please, try again.' });
			return false;
		}
	}

	@requiresMinion
	async run(msg: KlasaMessage, [qty, cmd]: [number, string]) {
		await msg.author.settings.sync(true);

		if (this.client.owners.has(msg.author)) {
			if (objectValues(SkillsEnum).includes(cmd as SkillsEnum)) {
				const lockedSkills = await this.lockedSkills();
				if (msg.flagArgs.add) {
					if (lockedSkills.includes(cmd as SkillsEnum)) {
						return msg.channel.send(
							`**${skillEmoji[cmd as SkillsEnum]} ${toTitleCase(
								cmd
							)}** is already on the list of locked skills.`
						);
					}
					await this.client.settings.update(ClientSettings.LockedSkills, cmd as SkillsEnum, {
						arrayAction: ArrayActions.Add
					});
					return msg.channel.send(
						`Added **${skillEmoji[cmd as SkillsEnum]} ${toTitleCase(cmd)}** to the list of locked skills.`
					);
				} else if (msg.flagArgs.remove) {
					if (!lockedSkills.includes(cmd as SkillsEnum)) {
						return msg.channel.send(
							`**${skillEmoji[cmd as SkillsEnum]} ${toTitleCase(
								cmd
							)}** is not on the list of locked skills.`
						);
					}
					await this.client.settings.update(ClientSettings.LockedSkills, cmd as SkillsEnum, {
						arrayAction: ArrayActions.Remove
					});
					return msg.channel.send(
						`Removed **${skillEmoji[cmd as SkillsEnum]} ${toTitleCase(
							cmd
						)}** from the list of locked skills.`
					);
				}
			} else if (msg.flagArgs.add || msg.flagArgs.remove) {
				return msg.channel.send(`${toTitleCase(cmd)} is not a valid skill to add/remove.`);
			}
		}

		if (!qty && !cmd) {
			return msg.channel.send(
				`You can use this command by doing \`${msg.cmdPrefix}lamp [qty] (item_to_use), [skill]\`. Qty and Skill are optional.`
			);
		}

		// Defaults qty if not informed
		if (qty === undefined) qty = 1;

		if (qty && !cmd) {
			cmd = qty.toString();
			qty = 1;
		}

		// Default item to nothing and skill to the last word informed
		let selectedItem: number | undefined = undefined;
		let skill: string | undefined = cmd.split(',').pop()?.trim().toLowerCase();

		// If the word selected to the skill is not valid, use everything as the name of the item
		try {
			if (!objectValues(SkillsEnum).includes(skill as SkillsEnum)) {
				selectedItem = itemID(cmd.split(',')[0]);
				skill = undefined;
			} else {
				selectedItem = itemID(cmd.split(',')[0]);
			}
		} catch (e) {
			return msg.channel.send(`**${cmd.split(',')[0]}** is not a valid item to use.`);
		}

		const xpObject = XPObjects.find(x => x.items.includes(selectedItem!));
		if (!selectedItem || cmd === skill || !xpObject) return msg.channel.send('This is not a valid item to use.');

		// Prepare the items to be removed from the user bank
		const toRemoveFromBank = new Bank({ [selectedItem]: qty });

		if (!msg.author.bank().has(toRemoveFromBank.bank)) {
			return msg.channel.send(`You don't have **${toRemoveFromBank}** in your bank.`);
		}

		let skillsToReceive: Skills = {};
		let skillsRequirements: Skills | undefined = undefined;

		[skillsToReceive, skillsRequirements] = xpObject.function({
			user: msg.author,
			quantity: qty,
			item: selectedItem
		});

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
