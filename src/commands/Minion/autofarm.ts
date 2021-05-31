import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { defaultPatches, resolvePatchTypeSetting } from '../../lib/minions/farming';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcNumOfPatches } from '../../lib/skilling/functions/calcsFarming';
import { plants } from '../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [plantName:...string]',
			aliases: ['af'],
			usageDelim: ' ',
			description: `Automatically plants the available things you can plant.`,
			examples: ['+autofarm'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		const currentDate = new Date().getTime();
		const userBank = msg.author.bank();
		let possiblePlants = plants.sort((a, b) => b.level - a.level);
		const toPlant = possiblePlants.find(p => {
			if (msg.author.skillLevel(SkillsEnum.Farming) < p.level) return false;
			const getPatchType = resolvePatchTypeSetting(p.seedType)!;
			const patchData = msg.author.settings.get(getPatchType) ?? defaultPatches;
			const lastPlantTime: number = patchData.plantTime;
			const difference = currentDate - lastPlantTime;
			if (difference < p.growthTime * Time.Minute) return false;
			const numOfPatches = calcNumOfPatches(
				p,
				msg.author,
				msg.author.settings.get(UserSettings.QP)
			);
			const reqItems = new Bank(p.inputItems).multiply(numOfPatches);
			if (!userBank.has(reqItems.bank)) {
				return false;
			}
			return true;
		});
		if (!toPlant) {
			return msg.channel.send(
				`There's no Farming crops that you have the requirements to plant.`
			);
		}
		return this.client.commands.get('farm')?.run(msg, [toPlant.name]);
	}
}
