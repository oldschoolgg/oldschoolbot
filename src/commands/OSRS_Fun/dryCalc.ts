import { Command, CommandStore, KlasaMessage } from 'klasa';

/* 
  Witty Switch Comments Pulled From:
  https://oldschool.runescape.wiki/w/Calculator:Dry_calc
*/
export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			description:
				'Calculates the drop chance of getting an item within a set amount of rolls.',
			usage: '<dropRate:int> <rolls:int>',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [dropRate = 1, rolls = 1]: [number, number]) {
		if (dropRate > 100000000 || rolls > 100000000) {
			throw "I can't process a number higher than 100 million! enneUni has already claimed the only uncut onyx!";
		}
		if (dropRate < 1 || rolls < 1) {
			throw "I can't calculate with zeros nor negative numbers. Do more rolls or update the drop values.";
		}
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

function round(value = 1, precision = 1) {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}
