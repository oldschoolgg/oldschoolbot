import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { slayerMaskHelms } from '../../lib/data/slayerMaskHelms';
import Constructables from '../../lib/skilling/skills/construction/constructables';
import { calcBabyYagaHouseDroprate, stringMatches } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

function makeTable(headers: string[], rows: (string | number)[][]) {
	return table([headers, ...rows]);
}

const droprates = [
	{
		name: 'Baby yaga house pet',
		output: () => {
			const rows: [string, number, number][] = [];
			for (const lvl of [30, 60, 80, 90, 100, 110, 120]) {
				for (const con of Constructables) {
					rows.push([con.name, lvl, calcBabyYagaHouseDroprate(con.xp, lvl, con.input[0], new Bank())]);
				}
			}
			rows.sort((a, b) => a[2] - b[2]);
			return makeTable(['Object', 'Con Lvl', '1 in X Droprate'], rows);
		}
	},
	{
		name: 'Slayer masks/helms',
		output: () => {
			const rows = [];
			for (const a of slayerMaskHelms) {
				console.log(
					`${a.helm.name} requires ${a.killsRequiredForUpgrade} kills to upgrade, 1 in ${a.maskDropRate} to get mask`
				);
				rows.push([a.helm.name, a.killsRequiredForUpgrade, a.maskDropRate]);
			}

			return makeTable(['Name', 'Kills For Helm', 'Mask Droprate'], rows);
		}
	}
];

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
		const output = obj.output();
		if (output.length >= 2000) {
			return { files: [{ attachment: Buffer.from(output), name: 'droprates.txt' }] };
		}
		return output;
	}
};
