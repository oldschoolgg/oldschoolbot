import { type CommandRunOptions, dateFm, stringMatches } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { BSO_MAX_TOTAL_LEVEL, BitField, Channel } from '../../lib/constants';
import { getReclaimableItemsOfUser } from '../../lib/reclaimableItems';
import { roboChimpUserFetch } from '../../lib/roboChimp';

import getOSItem from '../../lib/util/getOSItem';
import { sendToChannelID } from '../../lib/util/webhook';
import type { OSBMahojiCommand } from '../lib/util';

const claimables = [
	{
		name: 'Free T1 Perks',
		hasRequirement: async (user: MUser): Promise<true | string> => {
			const roboChimpUser = await roboChimpUserFetch(user.id);
			if (roboChimpUser.osb_total_level === 2277 && roboChimpUser.bso_total_level === BSO_MAX_TOTAL_LEVEL) {
				return true;
			}
			return 'You need to be maxed in both bots (OSB and BSO) to claim this.';
		},
		action: async (user: MUser) => {
			if (user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)) {
				return 'You already claimed this!';
			}
			sendToChannelID(Channel.General, {
				content: `${user.mention} just claimed free T1 patron perks for being maxed in both bots!`
			});
			await user.update({
				bitfield: {
					push: BitField.BothBotsMaxedFreeTierOnePerks
				}
			});
			return 'You claimed free T1 patron perks in OSB for being maxed in both bots. You can claim this on BSO too for free patron perks on BSO.';
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
			autocomplete: async (value, user) => {
				const claimableItems = await prisma.reclaimableItem.findMany({
					where: {
						user_id: user.id
					}
				});
				return [...claimables, ...claimableItems]
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
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
			const reclaimableData = await getReclaimableItemsOfUser(user);
			const rawData = reclaimableData.raw.find(i => i.name === options.name);
			if (!rawData) {
				return 'You are not elligible for this item.';
			}
			if (!reclaimableData.totalCanClaim.has(rawData.item_id)) {
				return 'You already claimed this item. If you lose it, you can reclaim it.';
			}
			const item = getOSItem(rawData.item_id);
			const loot = new Bank().add(item.id);
			await user.addItemsToBank({ items: loot, collectionLog: false });
			return `You claimed ${loot}.
			
${rawData.name}: ${rawData.description}.
${dateFm(new Date(rawData.date))}`;
		}

		const requirementCheck = await claimable.hasRequirement(user);
		if (typeof requirementCheck === 'string') {
			return `You are not eligible to claim this: ${requirementCheck}`;
		}

		const result = await claimable.action(user);
		return result;
	}
};
