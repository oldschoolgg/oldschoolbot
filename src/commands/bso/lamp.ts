import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, toTitleCase } from '../../lib/util';
import { XPLamps } from '../../lib/xpLamps';

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

		const bank = new Bank(msg.author.settings.get(UserSettings.Bank));
		if (bank.amount(lamp.itemID) === 0) {
			return msg.channel.send(`You don't have any ${lamp.name} lamps!`);
		}

		await msg.author.addXP({
			skillName: skillName as SkillsEnum,
			amount: lamp.amount,
			duration: undefined,
			minimal: false,
			multiplier: false,
			artificial: true
		});
		await msg.author.removeItemFromBank(lamp.itemID);

		return msg.channel.send(
			`Added ${lamp.amount.toLocaleString()} ${toTitleCase(skillName)} XP from your ${itemNameFromID(
				lamp.itemID
			)}`
		);
	}
}
