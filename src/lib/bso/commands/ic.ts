import { ItemContracts } from '@/lib/bso/itemContracts.js';

import { Emoji, formatDuration } from '@oldschoolgg/toolkit';

import { BitField } from '@/lib/constants.js';
import { makeDonateIcButton } from '@/lib/util/interactions.js';

export const icCommand = defineCommand({
	name: 'ic',
	description: 'Hand in random items for rewards.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: 'Subcommand',
			name: 'info',
			description: 'View stats and info on your Item Contracts.'
		},
		{
			type: 'Subcommand',
			name: 'send',
			description: 'Hand in your contract and receive a new one.'
		},
		{
			type: 'Subcommand',
			name: 'skip',
			description: 'Skip your current contract.'
		}
	],
	run: async ({ options, user, interaction }) => {
		const details = ItemContracts.getItemContractDetails(user);
		const components =
			details.nextContractIsReady &&
				details.currentItem !== null &&
				!user.isIronman &&
				!user.bitfield.includes(BitField.NoItemContractDonations)
				? ([
					makeDonateIcButton(user.id)
				])
				: undefined;

		if (options.info) {
			if (!details.nextContractIsReady) {
				return {
					content: `${Emoji.ItemContract
						} You have no item contract available at the moment. Come back in ${formatDuration(
							details.durationRemaining
						)}.

${details.infoStr}`
				};
			}
			return { content: `${Emoji.ItemContract} ${details.infoStr}`, components };
		}
		const res = options.skip
			? await ItemContracts.skip(interaction, user)
			: await ItemContracts.handInContract(interaction, user);

		const nextIcDetails = ItemContracts.getItemContractDetails(user);
		return `${Emoji.ItemContract} ${res}\n\n${nextIcDetails.infoStr}`;
	}
});
