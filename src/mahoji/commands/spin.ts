import { AttachmentBuilder } from 'discord.js';
import { sleep, Time } from 'e';
import { CommandRunOptions } from 'mahoji';

import { channelIsSendable } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeWheel } from '../../lib/wheel';
import { OSBMahojiCommand } from '../lib/util';

export const mahojiUseCommand: OSBMahojiCommand = {
	name: 'spin',
	description: 'Use items/things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/use name:Mithril seeds']
	},
	options: [],
	run: async ({ interaction }: CommandRunOptions<{ item: string; secondary_item?: string }>) => {
		const prizes = [
			['2x', 15],
			['2x', 15],
			['10x', 5],
			['5x', 5],
			['100x', 1],
			['0x', 5],
			['0x', 10],
			['30x', 4],
			['3x', 10],
			['0x', 10],
			['1.5x', 10]
		] as const;
		const wheel = await makeWheel(prizes);
		await deferInteraction(interaction, { ephemeral: true });
		const ch = globalClient.channels.cache.get(interaction.channelId);
		if (!channelIsSendable(ch)) return 'Invalid channel.';
		const msg = await ch.send({ content: 'Spinning...', files: [new AttachmentBuilder(wheel.oldCanvas)] });

		await sleep(Time.Second * 3);
		await msg.edit({
			content: `The winning result is... ${wheel.winner.text}!`,
			files: [new AttachmentBuilder(wheel.newCanvas)]
		});

		return { content: 'Finished spinning!', ephemeral: true };
	}
};
