import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { herbertDroprate, MAX_XP, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { globalDroprates } from '../../lib/data/globalDroprates';
import { slayerMaskHelms } from '../../lib/data/slayerMaskHelms';
import Constructables from '../../lib/skilling/skills/construction/constructables';
import Potions from '../../lib/skilling/skills/herblore/mixables/potions';
import { calcBabyYagaHouseDroprate, clAdjustedDroprate, formatDuration, stringMatches } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

function makeTable(headers: string[], rows: (string | number)[][]) {
	return table([headers, ...rows]);
}

interface GlobalDroprate {
	name: string;
	output: (opts: { user: MUser }) => string;
	notes?: string[];
}

const droprates: GlobalDroprate[] = [
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
	},
	{
		name: 'Herbert (pet)',
		output: () => {
			const rows = [];

			for (const pot of Potions) {
				let dropratePerMinute = herbertDroprate(1, pot.level);
				let dropratePerMinuteAtMax = herbertDroprate(MAX_XP, pot.level);
				rows.push([pot.item.name, 1 / (60 / dropratePerMinute), 1 / (60 / dropratePerMinuteAtMax)]);
			}

			return `Herbert is rolled per minute of your trip, and the droprate halves (becomes twice as common) when you have the max (${MAX_XP.toLocaleString()}) Herblore XP.
			
${makeTable(['Potion Name', 'Droprate per hour', 'Droprate per hour at max xp'], rows)}`;
		}
	}
];

for (const droprate of Object.values(globalDroprates)) {
	droprates.push({
		name: droprate.name,
		output: ({ user }) => {
			let str = `**${droprate.name}**\n\n`;
			str += `${droprate.name} drops at a rate of **1/${droprate.baseRate}** per ${droprate.rolledPer}.\n`;
			if ('minLength' in droprate) {
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

			if ('clIncrease' in droprate && 'item' in droprate) {
				const inCL = user.cl.amount(droprate.item.id);
				str += `\n\nYou have ${inCL}x ${
					droprate.item.name
				} in your CL, so your current droprate is: **1 in ${clAdjustedDroprate(
					user,
					droprate.item.id,
					droprate.baseRate,
					droprate.clIncrease
				)}**.`;
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
					.filter(i => (!val ? true : i.name.toLowerCase().includes(val.toLowerCase())))
					.map(i => ({ name: i.name, value: i.name }));
			}
		}
	],
	run: async ({ options, user }: CommandRunOptions<{ thing: string }>) => {
		const obj = droprates.find(drop => stringMatches(drop.name, options.thing));
		if (!obj) return 'Invalid thing';
		let output = obj.output({ user: await mUserFetch(user.id) });
		if (obj.notes) {
			output += `\n\n**Notes:**\n${obj.notes.join('\n')}`;
		}
		if (output.length >= 2000) {
			return { files: [{ attachment: Buffer.from(output), name: 'droprates.txt' }] };
		}
		return output;
	}
};
