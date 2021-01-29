import { MessageEmbed } from 'discord.js';
import { objectKeys } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { SkillsScore } from 'oldschooljs/dist/meta/types';

import { diaryRequirements } from '../../lib/data/diary-requirements';
import { BotCommand } from '../../lib/structures/BotCommand';

const titles: Record<keyof typeof diaryRequirements, string> = {
	Ardougne: '[Ardougne](https://oldschool.runescape.wiki/w/Ardougne_Diary)',
	Desert: '[Desert](https://oldschool.runescape.wiki/w/Desert_Diary)',
	Karamja: '[Karamja](https://oldschool.runescape.wiki/w/Karamja_Diary)',
	'Lumbridge/Draynor':
		'[Lumbridge/Draynor](https://oldschool.runescape.wiki/w/Lumbridge_%26_Draynor_Diary)',
	Morytania: '[Morytania](https://oldschool.runescape.wiki/w/Morytania_Diary)',
	Varrock: '[Varrock](https://oldschool.runescape.wiki/w/Varrock_Diary)',
	'Western Prov.': '[Western Prov.](https://oldschool.runescape.wiki/w/Western_Provinces_Diary)',
	Wilderness: '[Wilderness](https://oldschool.runescape.wiki/w/Wilderness_Diary)',
	Falador: '[Falador](https://oldschool.runescape.wiki/w/Falador_Diary)',
	Fremennik: '[Fremennik](https://oldschool.runescape.wiki/w/Fremennik_Diary)',
	'Kourend & Kebos':
		'[Kourend/Kebos](https://oldschool.runescape.wiki/w/Kourend_%26_Kebos_Diary)',
	Kandarin: '[Kandarin](https://oldschool.runescape.wiki/w/Kandarin_Diary)'
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['d'],
			description:
				'Check which diaries your account has the required stats to complete (BOLD = boostable)',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		const { skills } = await Hiscores.fetch(username).catch(err => {
			throw err.message;
		});

		const diaryNames = objectKeys(diaryRequirements)
			.map(key => titles[key])
			.join('\n');

		const canComplete = objectKeys(diaryRequirements)
			.map(diary => this.check(skills, diaryRequirements[diary]))
			.join('\n');

		const embed = new MessageEmbed()
			.setColor(11132490)
			.setThumbnail('https://i.imgur.com/wV9zvLM.png')
			.setDescription(username)
			.addField('Diary', diaryNames, true)
			.addField('You can complete:', canComplete, true)
			.setFooter('✶Boostable');

		return msg.send({ embed });
	}

	check(skills: SkillsScore, diary: typeof diaryRequirements[keyof typeof diaryRequirements]) {
		const levelMap = ['Easy', 'Medium', 'Hard', 'Elite'];
		let boostVar = 0;
		const canComplete = [];
		for (let i = 0; i < 4; i++) {
			for (const req of objectKeys(diary)) {
				if (req !== 'construction') {
					const statLevel = skills[req].level;
					const levelRequirement = diary[req].statReq[i];
					if (levelRequirement === 0) continue;
					if (statLevel >= levelRequirement) continue;
					if (statLevel < levelRequirement - diary[req].boost[i]) {
						break;
					} else {
						boostVar = 1;
						continue;
					}
				} else if (boostVar === 1) {
					canComplete.push(`✶${levelMap[i]}`);
				} else {
					canComplete.push(levelMap[i]);
				}
			}
		}
		return canComplete.length ? canComplete.join(', ') : '-';
	}
}
