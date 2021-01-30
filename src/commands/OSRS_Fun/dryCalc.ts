import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';
import { round } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			description:
				'Calculates the drop chance of getting an item within a set amount of rolls.',
			usage: '<dropRate:int{1,10000000}> <rolls:int{1,1000000}>',
			usageDelim: ' ',
			categoryFlags: ['fun', 'simulation'],
			examples: ['+drycalc 5k 20k (20k rolls of 1 in 5k chance)']
		});
	}

	async run(msg: KlasaMessage, [dropRate, rolls]: [number, number]) {
		const noDropChance = Math.pow(1 - 1 / dropRate, rolls);
		const dropChance = 100 * (1 - noDropChance);
		const output = `${rolls} rolls were done for a drop with a 1/${dropRate} (${round(
			100 / dropRate,
			2
		)}%) drop rate!\nYou had a **${round(
			noDropChance * 100,
			2
		)}%** chance of not receiving any drop, and a **${round(
			dropChance,
			2
		)}%** chance of receiving atleast one drop.`;

		return msg.send(output);
	}
}
