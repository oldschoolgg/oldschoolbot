import { randArrItem, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

const locations = [
	'Port Sarim',
	'Rimmington',
	'Taverley',
	'Catherby',
	'Karamja',
	'Entrana',
	'Brimhaven',
	'Crandor',
	'Witchaven',
	'Voids Knights Outpost',
	'Rellekka',
	'Feldip Hills',
	'Piscatoris',
	'Miscellania',
	'Burgh der Rott',
	'The Wilderness',
	'Mos Le Harmless',
	'Harmony',
	'Jatiszo',
	'Neitiznot',
	'Lunar Isle',
	'Piscarillius',
	'Ape Atoll',
	'Tutorial Island'
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to go sailing.',
			usage: '[start]'
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [str]: [string | undefined]) {
		const currentLevel = msg.author.skillLevel(SkillsEnum.Sailing);
		const hasBook = msg.author.bank().has('Sailing book');
		const hasStarted = currentLevel > 1 || hasBook;

		if (str === 'start' && !hasStarted) {
			await msg.author.addItemsToBank(new Bank({ 'Sailing book': 1, Rope: 3 }), true);
			return msg.send(
				`You have been given a **Sailing book** to instruct you on the Sailing skill, and some ropes to get you started. Make sure to read the book! You can now train the Sailing skill.`
			);
		}

		if (!hasStarted) {
			return msg.send(
				`You haven't started the sailing skill yet! To start, do \`${msg.cmdPrefix}sail start\``
			);
		}

		const duration = Time.Minute * 30;
		await addSubTaskToActivityTask<ActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.Sailing
		});

		let response = `${msg.author.minionName} is now sailing to ${randArrItem(
			locations
		)}, it'll take around ${formatDuration(duration)} to finish.`;

		return msg.send(response);
	}
}
