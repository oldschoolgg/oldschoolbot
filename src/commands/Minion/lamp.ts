import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, toTitleCase } from '../../lib/util';
import itemID from '../../lib/util/itemID';

const darkRelicBoostSkills: SkillsEnum[] = [
	SkillsEnum.Mining,
	SkillsEnum.Woodcutting,
	SkillsEnum.Herblore,
	SkillsEnum.Fishing,
	SkillsEnum.Hunter,
	SkillsEnum.Cooking,
	SkillsEnum.Farming,
	SkillsEnum.Thieving,
	SkillsEnum.Firemaking,
	SkillsEnum.Agility
];

export interface XPLamp {
	itemID: number;
	amount?: number;
	amountFn?: (_skill: SkillsEnum, _level: number) => number;
	name: string;
	minimumLevel: number;
}

export const XPLamps: XPLamp[] = [
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
	},
	{
		itemID: itemID('Dark relic'),
		amountFn: (skill, level) => {
			return darkRelicBoostSkills.includes(skill) ? level * 150 : level * 50;
		},
		name: 'Dark relic',
		minimumLevel: 1
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:item> <skill:string>',
			usageDelim: ',',
			examples: ['+lamp antique lamp 4, construction'],
			description: 'Allows you to use a XP lamp on a skill.'
		});
	}

	async run(msg: KlasaMessage, [[item], skillName]: [Item[], string]) {
		const lamp = XPLamps.find(lamp => lamp.itemID === item.id);
		if (!lamp) {
			return msg.channel.send("That's not a valid XP Lamp.");
		}

		skillName = skillName.toLowerCase();

		const isValidSkill = Object.values(Skills).some(skill => skill.id === skillName);
		if (!isValidSkill) {
			return msg.channel.send("That's not a valid skill.");
		}
		const skill = skillName as SkillsEnum;

		if (msg.author.skillLevel(skill) < lamp.minimumLevel) {
			return msg.channel.send(
				`You can't use this lamp on ${skill} because it requires a minimum level of ${lamp.minimumLevel}.`
			);
		}
		const bank = new Bank(msg.author.settings.get(UserSettings.Bank));
		if (bank.amount(lamp.itemID) === 0) {
			return msg.channel.send(`You don't have any ${lamp.name} lamps!`);
		}

		const amount = lamp.amountFn ? lamp.amountFn(skill, msg.author.skillLevel(skill)) : lamp.amount!;
		await msg.author.addXP({
			skillName: skill,
			amount,
			duration: undefined,
			minimal: false,
			artificial: true
		});
		await msg.author.removeItemFromBank(lamp.itemID);

		return msg.channel.send(
			`Added ${amount.toLocaleString()} ${toTitleCase(skill)} XP from your ${itemNameFromID(lamp.itemID)}.`
		);
	}
}
