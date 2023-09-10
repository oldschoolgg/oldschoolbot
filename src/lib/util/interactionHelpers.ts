import { createHash } from 'crypto';
import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';
import { chunk, randInt, Time } from 'e';

import { deferInteraction, interactionReply } from './interactionReply';

export async function interactionReplyGetDuration(
	interaction: ChatInputCommandInteraction,
	prompt: string,
	...durations: { display: string; duration: number }[]
) {
	await deferInteraction(interaction);
	const unique = createHash('sha256')
		.update(String(Date.now()) + String(randInt(10_000, 99_999)))
		.digest('hex')
		.slice(2, 12);
	let x = 0;
	const buttons = durations.map(d => ({ label: d.display, customId: `${unique}_DUR_BUTTON_${x++}` }));
	buttons.push({ label: 'Cancel', customId: `${unique}_DUR_BUTTON_${x}` });
	const components = makePlainButtons(...buttons);

	const response = await interactionReply(interaction, { content: prompt, components });

	try {
		const selection = await response.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id,
			time: 15 * Time.Second
		});
		const id = Number(selection.customId.split('_')[3]);
		if (durations[id]) {
			await interaction.editReply({ content: `Selected: ${durations[id].display}`, components: [] });
			return durations[id];
		}
		await interaction.editReply({ content: 'Cancelled.', components: [] });
		return false;
	} catch (e) {
		await interaction.editReply({ content: 'Did not choose a duration in time.', components: [] });
		return false;
	}
}

export function makePlainButtons(...buttons: { label: string; customId: string }[]) {
	const components: ButtonBuilder[] = [];
	for (let i = 0; i < buttons.length; i++) {
		components.push(
			new ButtonBuilder({ label: buttons[i].label, customId: buttons[i].customId, style: ButtonStyle.Secondary })
		);
	}
	return chunk(components, 5).map(i => ({ components: i, type: ComponentType.ActionRow }));
}
