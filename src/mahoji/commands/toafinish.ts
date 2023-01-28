import { AttachmentBuilder } from 'discord.js';
import { round, sumArr } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import type { Finishable } from '../../lib/finishables';
import { calcTOALoot, mileStoneBaseDeathChances, RaidLevel } from '../../lib/simulation/toa';
import getOSItem from '../../lib/util/getOSItem';
import { makeBankImage } from '../../lib/util/makeBankImage';
import resolveItems from '../../lib/util/resolveItems';
import { averageBank } from '../../lib/util/smallUtils';
import { OSBMahojiCommand } from '../lib/util';

export function doFinish(val: Finishable) {
	let loot = new Bank();
	const kcBank = new Bank();
	let kc = 0;
	const maxAttempts = val.maxAttempts ?? 100_000;
	for (let i = 0; i < maxAttempts; i++) {
		if (val.cl.every(id => loot.has(id))) break;
		kc++;
		const thisLoot = val.kill({ accumulatedLoot: loot, totalRuns: i });

		if (val.tertiaryDrops) {
			for (const drop of val.tertiaryDrops) {
				if (kc === drop.kcNeeded) {
					thisLoot.add(drop.itemId);
				}
			}
		}

		const purpleItems = thisLoot.items().filter(i => val.cl.includes(i[0].id) && !loot.has(i[0].id));
		for (const p of purpleItems) kcBank.add(p[0].id, kc);
		loot.add(thisLoot);
		if (kc === maxAttempts) {
			return `After ${maxAttempts.toLocaleString()} KC, you still didn't finish the CL, so we're giving up! Missing: ${val.cl
				.filter(id => !loot.has(id))
				.map(getOSItem)
				.map(i => i.name)
				.join(', ')}`;
		}
	}
	return { kc, kcBank: kcBank.bank, loot: loot.bank };
}

function makeTOAFinishable(
	points: number,
	raidLevel: RaidLevel,
	teamSize: number
): { kill: (args: { accumulatedLoot: Bank; totalRuns: number }) => Bank } {
	return {
		kill: ({ accumulatedLoot, totalRuns }) => {
			let users = [];
			for (let i = 0; i < teamSize; i++) {
				users.push({ id: i.toString(), points, kc: totalRuns, cl: accumulatedLoot, deaths: [] });
			}

			const loot = calcTOALoot({
				users,
				raidLevel
			});
			return loot.teamLoot.get('0');
		}
	};
}

export const finishCommand: OSBMahojiCommand = {
	name: 'toafinish',
	description: 'Simulate finishing TOA.',
	options: [
		{
			type: ApplicationCommandOptionType.Number,
			name: 'points',
			description: 'Points (Default 10k)',
			required: false,
			min_value: 5000,
			max_value: 25_000
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'raid_level',
			description: 'Choose the raid level you want to do (Default 300).',
			required: false,
			choices: mileStoneBaseDeathChances.map(i => ({ name: i.level.toString(), value: i.level }))
		},
		{
			type: ApplicationCommandOptionType.Number,
			name: 'team_size',
			description: 'Team Size (default solo/1)',
			required: false,
			min_value: 1,
			max_value: 8
		}
	],
	run: async ({
		options,
		interaction
	}: CommandRunOptions<{ points?: number; raid_level?: RaidLevel; team_size: number }>) => {
		await interaction.deferReply();
		const val = makeTOAFinishable(options.points ?? 10_000, options.raid_level ?? 300, options.team_size ?? 1);
		let sample = 150;

		let kcsFinished: number[] = [];
		let totalBank = new Bank();
		let kcArrs: Record<number | string, number[]> = {};

		for (let i = 0; i < sample; i++) {
			const res = doFinish({
				name: 'TOA',
				cl: resolveItems([
					"Tumeken's guardian",
					"Tumeken's shadow (uncharged)",
					"Elidinis' ward",
					'Masori mask',
					'Masori body',
					'Masori chaps',
					'Lightbearer',
					"Osmumten's fang",
					'Thread of elidinis',
					'Breach of the scarab',
					'Eye of the corruptor',
					'Jewel of the sun',
					'Cache of runes'
				]),
				aliases: ['toa'],
				...val
			});
			if (typeof res === 'string') return res;
			kcsFinished.push(res.kc);
			totalBank.add(res.loot);
			for (const [itemID, kc] of Object.entries(res.kcBank)) {
				if (!kcArrs[itemID]) kcArrs[itemID] = [];
				kcArrs[itemID].push(kc);
			}
		}

		kcsFinished.sort((a, b) => a - b);
		const avgKcFinish = sumArr(kcsFinished) / kcsFinished.length;
		const averageLoot = averageBank(totalBank, sample);
		const averageKcBank = new Bank();
		for (const [itemID, kcArr] of Object.entries(kcArrs)) {
			averageKcBank.add(parseInt(itemID), round(sumArr(kcArr) / kcArr.length, 1));
		}

		return {
			content: `**Average Finish - From ${sample}x samples**

Average KC to finish: ${avgKcFinish}
Lowest KC to finish: ${kcsFinished[0]}
Median KC to finish: ${kcsFinished[Math.floor(kcsFinished.length / 2)]}
Highest KC to finish: ${kcsFinished[kcsFinished.length - 1]}`,
			files: await Promise.all(
				(
					[
						[averageLoot, 'Average Loot'],
						[averageKcBank, "Average KC's items got at"]
					] as const
				).map(
					async ([bank, title]) =>
						new AttachmentBuilder((await makeBankImage({ bank, title })).file.attachment)
				)
			)
		};
	}
};
