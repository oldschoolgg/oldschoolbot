import { CommandStore, KlasaMessage } from 'klasa';

import slayerMasters from '../../lib/slayer/slayerMasters';
import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, rand } from '../../lib/util';
import nieveTasks from '../../lib/slayer/nieveTasks';
import { UserSettings } from '../../lib/UserSettings';
import { Monsters } from 'oldschooljs';
import { SkillsEnum } from '../../lib/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<slayermaster:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [slayermaster]: [string]) {
		await msg.author.settings.sync(true);

		// If they already have a slayer task tell them what it is
		if (msg.author.hasSlayerTask) {
			const mon = Monsters.get(msg.author.slayerTaskID);
			if (!mon) throw `WTF`;
			throw `You already have a slayer task of ${msg.author.slayerTaskQuantity}x ${mon.name}.`;
		}

		const master = slayerMasters.find(person => stringMatches(slayermaster, person.name));
		if (!master) {
			throw `That's not a valid slayer master. Valid masters are ${slayerMasters
				.map(person => person.name)
				.join(', ')}.`;
		}

		// Filter by slayer level
		const filteredTasks = nieveTasks.filter(
			task =>
				Monsters.get(task.ID)?.data.slayerLevelRequired! <=
				msg.author.skillLevel(SkillsEnum.Slayer)
		);
		/*
		// Filter by combat level -- not necessary
		const userCombatLevel = determineCombatLevel(
			msg.author.skillLevel(SkillsEnum.Prayer),
			msg.author.skillLevel(SkillsEnum.Hitpoints),
			msg.author.skillLevel(SkillsEnum.Defence),
			msg.author.skillLevel(SkillsEnum.Strength),
			msg.author.skillLevel(SkillsEnum.Attack),
			msg.author.skillLevel(SkillsEnum.Magic),
			msg.author.skillLevel(SkillsEnum.Range)
		);
		 Need combat level required Monsters.get(task.ID)?.data.combatLevelRequired!
		const filteredTasks = filteredSlayerTasks.filter(
			task =>
				Monsters.get(task.ID)?.data.combatLevelRequired! <= userCombatLevel
		);
		*/

		let totalweight = 0;
		for (let i = 0; i < filteredTasks.length; i++) {
			totalweight += filteredTasks[i].weight;
		}
		if (filteredTasks.length === 0) {
			throw `You don't have a high enough Slayer level to get a task from that Master.`;
		}
		let number = rand(1, totalweight);
		for (let i = 0; i < filteredTasks.length; i++) {
			number -= filteredTasks[i].weight;
			if (number <= 0) {
				const slayerMonster = filteredTasks[i];
				const minQuantity = slayerMonster.amount[0];
				const maxQuantity = slayerMonster.amount[1];
				if (typeof minQuantity === 'number' && typeof maxQuantity === 'number') {
					const quantity = rand(minQuantity, maxQuantity);
					await msg.author.settings.update(
						UserSettings.Slayer.SlayerTaskQuantity,
						quantity
					);
					await msg.author.settings.update(UserSettings.Slayer.HasSlayerTask, true);
					await msg.author.settings.update(
						UserSettings.Slayer.SlayerTaskID,
						slayerMonster.ID
					);
					return msg.send(`Your new slayer task is ${quantity}x ${slayerMonster.name}`);
				}
			}
		}
	}
}
