import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import Skills from '../../lib/skilling/skills';
import { SkillsEnum } from '../../lib/skilling/types';
import { itemNameFromID, toTitleCase } from '../../lib/util';
import { XPLamps } from '../../lib/xpLamps';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:item> <skill:string>',
			usageDelim: ','
		});
	}

	async run(msg: KlasaMessage, [[item], skillName]: [Item[], string]) {
		const lamp = XPLamps.find(lamp => lamp.itemID === item.id);
		if (!lamp) {
			return msg.send(`That's not a valid XP Lamp.`);
		}

		skillName = skillName.toLowerCase();
		const isValidSkill = Object.values(Skills).some(skill => skill.id === skillName);
		if (!isValidSkill) {
			return msg.send(`That's not a valid skill.`);
		}

		await msg.author.addXP(skillName as SkillsEnum, lamp.amount, false);
		await msg.author.removeItemFromBank(lamp.itemID);

		return msg.send(
			`Added ${lamp.amount.toLocaleString()} ${toTitleCase(
				skillName
			)} XP from your ${itemNameFromID(lamp.itemID)}`
		);
	}
}
