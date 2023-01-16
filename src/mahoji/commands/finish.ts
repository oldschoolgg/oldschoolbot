import { AttachmentBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { finishables } from '../../lib/finishables';
import { sorts } from '../../lib/sorts';
import { makeComponents, stringMatches } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { Workers } from '../../lib/workers';
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
		const val = finishables.find(
			i => stringMatches(i.name, options.input) || i.aliases?.some(alias => stringMatches(alias, options.input))
		);
		if (!val) return "That's not a valid thing you can simulate finishing.";
		const workerRes = await Workers.finish({ name: val.name });
		if (typeof workerRes === 'string') return workerRes;
		const { kc } = workerRes;
		const kcBank = new Bank(workerRes.kcBank);
		const loot = new Bank(workerRes.loot);
		if ('customResponse' in val && val.customResponse) {
			return val.customResponse(kc);
		}
		const image = await makeBankImage({
			bank: loot,
			title: `Loot from ${kc}x ${val.name}`
		});

		const result = `It took you ${kc.toLocaleString()} KC to finish the ${val.name} CL.`;
		const finishStr = kcBank.items().sort(sorts.quantity).reverse();
		const repeatButton = makeComponents([
			new ButtonBuilder()
				.setCustomId(`SIM_FINISH_X_${JSON.stringify(options)}`)
				.setLabel('Repeat Sim')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('📊')
		]);

		if (finishStr.length < 20) {
			return {
				content: `${result}
${finishStr.map(i => `**${i[0].name}:** ${i[1]} KC`).join('\n')}`,
				files: [image.file],
				components: repeatButton
			};
		}
		return {
			content: `It took you ${kc.toLocaleString()} KC to finish the ${val.name} CL.`,
			files: [
				image.file,
				new AttachmentBuilder(Buffer.from(finishStr.map(i => `${i[0].name}: ${i[1]} KC`).join('\n')), {
					name: 'finish.txt'
				})
			],
			components: repeatButton
		};
	}
};
