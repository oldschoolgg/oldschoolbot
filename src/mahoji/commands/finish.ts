import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { finishables } from '../../lib/finishables';
import { sorts } from '../../lib/sorts';
import { itemNameFromID, stringMatches } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { OSBMahojiCommand } from '../lib/util';

export const finishCommand: OSBMahojiCommand = {
	name: 'finish',
	description: 'Simulate finishing a CL.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'input',
			description: 'The CL/thing you want to finish. (e.g. corp, pets, raids)',
			required: true,
			autocomplete: async (value: string) => {
				return finishables
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({ name: i.name, value: i.name }));
			}
		}
	],
	run: async ({ interaction, options }: CommandRunOptions<{ input: string }>) => {
		await deferInteraction(interaction);
		const val = finishables.find(i => stringMatches(i.name, options.input) || i.aliases?.includes(options.input));
		if (!val) return "That's not a valid thing you can simulate finishing.";
		let loot = new Bank();
		const kcBank = new Bank();
		let kc = 0;
		const maxAttempts = val.maxAttempts ?? 100_000;
		for (let i = 0; i < maxAttempts; i++) {
			if (val.cl.every(id => loot.has(id))) break;
			kc++;
			const thisLoot = val.kill({ accumulatedLoot: loot });

			// This section adds loot that is normally not rolled from the loot table
			if (val.name === 'Chambers of Xeric (Solo, CM)') {
				if (kc === 100) thisLoot.add("Xeric's guard", 1);
				if (kc === 500) thisLoot.add("Xeric's warrior", 1);
				if (kc === 1000) thisLoot.add("Xeric's sentinel", 1);
				if (kc === 1500) thisLoot.add("Xeric's general", 1);
				if (kc === 2000) thisLoot.add("Xeric's champion", 1);
			}
			if (val.name.includes('Theatre of Blood')) {
				if (kc === 100) thisLoot.add('Sinhaza shroud tier 1', 1);
				if (kc === 500) thisLoot.add('Sinhaza shroud tier 2', 1);
				if (kc === 1000) thisLoot.add('Sinhaza shroud tier 3', 1);
				if (kc === 1500) thisLoot.add('Sinhaza shroud tier 4', 1);
				if (kc === 2000) thisLoot.add('Sinhaza shroud tier 5', 1);
			}
			if (val.name === 'Corrupted Gauntlet') thisLoot.add('Gauntlet cape', 1);
			if (val.name === 'Tempoross') {
				if (loot.amount('Spirit flakes') >= 4800) {
					thisLoot.add('Spirit angler top', 1);
					thisLoot.add('Spirit angler waders', 1);
					thisLoot.add('Spirit angler boots', 1);
					thisLoot.add('Spirit angler headband', 1);
				}
			}

			const purpleItems = thisLoot.items().filter(i => val.cl.includes(i[0].id) && !loot.has(i[0].id));
			for (const p of purpleItems) kcBank.add(p[0].id, kc);
			loot.add(thisLoot);
			if (kc === maxAttempts) {
				return `After ${maxAttempts.toLocaleString()} KC, you still didn't finish the CL, so we're giving up! Missing: ${val.cl
					.filter(id => !loot.has(id))
					.map(itemNameFromID)
					.join(', ')}`;
			}
		}
		if ('customResponse' in val && val.customResponse) {
			return val.customResponse(kc);
		}
		const image = await makeBankImage({ bank: loot, title: `Loot from ${kc}x ${val.name}` });
		return {
			content: `It took you ${kc.toLocaleString()} KC to finish the ${val.name} CL.
${kcBank
	.items()
	.sort(sorts.quantity)
	.reverse()
	.map(i => `**${i[0].name}:** ${i[1]} KC`)
	.join('\n')}`,
			files: [image.file]
		};
	}
};
