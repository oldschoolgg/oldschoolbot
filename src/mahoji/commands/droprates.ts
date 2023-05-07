import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { globalDroprates, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { slayerMaskHelms } from '../../lib/data/slayerMaskHelms';
import Constructables from '../../lib/skilling/skills/construction/constructables';
import { calcBabyYagaHouseDroprate, formatDuration, stringMatches } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

function makeTable(headers: string[], rows: (string | number)[][]) {
	return table([headers, ...rows]);
}
const droprates = [
	{
		name: 'Baby yaga house pet',
		output: () => {
			const thirtyMinTicks = (Time.Minute * 30) / (Time.Millisecond * 600);

			const rows: [string, number, string][] = [];
			for (const con of Constructables) {
				const droprate = calcBabyYagaHouseDroprate(con.xp, new Bank());
				const numBuiltPerTrip = thirtyMinTicks / con.ticks;
				rows.push([con.name, droprate, (droprate / numBuiltPerTrip).toFixed(2)]);
			}
			rows.sort((a, b) => a[1] - b[1]);
			return makeTable(['Object', '1 in X Droprate', 'Num 30min trips'], rows);
		},
		notes: ['If more than 1 in CL, droprate is multipled by the amount you have in your CL']
	},
	{
		name: 'Slayer masks/helms',
		output: () => {
			const rows = [];
			for (const a of slayerMaskHelms) {
				rows.push([a.helm.name, a.killsRequiredForUpgrade, a.maskDropRate]);
			}

			return makeTable(['Name', 'Kills For Helm', 'Mask Droprate'], rows);
		}
	}
];

for (const droprate of Object.values(globalDroprates)) {
	droprates.push({
		name: droprate.name,
		output: () => {
			let str = `**${droprate.name}**\n\n`;
			str += `${droprate.name} drops at a rate of **1/${droprate.baseRate}** per ${droprate.rolledPer}.\n`;
			if (droprate.minLength) {
				str += `Requires a minimum trip length of **${formatDuration(MIN_LENGTH_FOR_PET)}** to receive.\n`;
			}
			if ('tameBaseRate' in droprate) {
				str += `Tames have a different base rate of **1/${droprate.tameBaseRate}**.\n`;
			}
			if ('clIncrease' in droprate) {
				str += `For each pet in your CL, the droprate is multiplied (made rarer) by **${droprate.clIncrease}x**.\n`;
			}
			if ('notes' in droprate) {
				str += `\n**Notes:**\n${droprate.notes.join('\n')}`;
			}
			return str;
		}
	});
}

export const dropRatesCommand: OSBMahojiCommand = {
	name: 'droprate',
	description: 'Check the droprate of something.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'thing',
			description: 'The thing you want to check.',
			required: true,
			autocomplete: async (val: string) => {
				return droprates
					.filter(i => (!val ? true : stringMatches(i.name, val)))
					.map(i => ({ name: i.name, value: i.name }));
			}
		}
	],
	run: async ({ options }: CommandRunOptions<{ thing: string }>) => {
		const obj = droprates.find(drop => stringMatches(drop.name, options.thing));
		if (!obj) return 'Invalid thing';
		let output = obj.output();
		if (obj.notes) {
			output += `\n\n**Notes:**\n${obj.notes.join('\n')}`;
		}
		if (output.length >= 2000) {
			return { files: [{ attachment: Buffer.from(output), name: 'droprates.txt' }] };
		}
		return output;
	}
};
