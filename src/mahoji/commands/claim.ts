import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { BitField, Channel } from '../../lib/constants';
import { roboChimpUserFetch } from '../../lib/roboChimp';
import { stringMatches } from '../../lib/util';
import { sendToChannelID } from '../../lib/util/webhook';
import { OSBMahojiCommand } from '../lib/util';

const claimables = [
	{
		name: 'Free T1 Perks',
		hasRequirement: async (user: MUser): Promise<true | string> => {
			const roboChimpUser = await roboChimpUserFetch(user.id);
			if (roboChimpUser.osb_total_level === 2277 && roboChimpUser.bso_total_level === 3000) {
				return true;
			}
			return 'You need to be maxed in both bots (OSB and BSO) to claim this.';
		},
		action: async (user: MUser) => {
			if (user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)) {
				return 'You already claimed this!';
			}
			sendToChannelID(Channel.BSOGeneral, {
				content: `${user.mention} just claimed free T1 patron perks for being maxed in both bots!`
			});
			await user.update({
				bitfield: {
					push: BitField.BothBotsMaxedFreeTierOnePerks
				}
			});
			return 'You claimed free T1 patron perks in BSO for being maxed in both bots. You can claim this on OSB too for free patron perks on OSB.';
		}
	}
];

export const claimCommand: OSBMahojiCommand = {
	name: 'claim',
	description: 'Claim prizes, rewards and other things.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to claim.',
			required: true,
			autocomplete: async () => {
				return claimables.map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		}
	],
	run: async ({ options, userID }: CommandRunOptions<{ name: string }>) => {
		const user = await mUserFetch(userID);
		const claimable = claimables.find(i => stringMatches(i.name, options.name));
		if (!claimable) {
			return 'Invalid thing to claim.';
		}

		if (!(await claimable.hasRequirement(user))) {
			return 'You are not eligible for this reward.';
		}

		const result = await claimable.action(user);
		return result;
	}
};
