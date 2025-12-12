import { CollectionLog } from '@oldschoolgg/collectionlog';
import { dateFm } from '@oldschoolgg/discord';
import { Bank, Items } from 'oldschooljs';

import { BitField, BOT_TYPE, BSO_MAX_TOTAL_LEVEL, Channel } from '@/lib/constants.js';
import { calcCLDetails } from '@/lib/data/Collections.js';
import { HolidayItems } from '@/lib/data/holidayItems.js';
import { getReclaimableItemsOfUser } from '@/lib/reclaimableItems.js';
import { roboChimpUserFetch } from '@/lib/roboChimp.js';

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
			globalClient.sendMessage(Channel.ServerGeneral, {
				content: `${user.mention} just claimed free T1 patron perks for being maxed in both bots!`
			});
			await user.update({
				bitfield: {
					push: BitField.BothBotsMaxedFreeTierOnePerks
				}
			});
			return 'You claimed free T1 patron perks in OSB for being maxed in both bots. You can claim this on BSO too for free patron perks on BSO.';
		}
	},
	{
		name: `Halloween Items`,
		action: async (user: MUser) => {
			if (BOT_TYPE === 'BSO') {
				return 'This command is only for OSB.';
			}
			const messages: string[] = [];
			const allItemsCanGet = [...HolidayItems.Halloween.halloweenItems];
			const isPermIron = user.isIronman && user.bitfield.includes(BitField.PermanentIronman);
			if (isPermIron) {
				allItemsCanGet.push(...HolidayItems.Halloween.halloweenOnlyForPermIrons);
				messages.push('As a permanent ironman, you are eligible for extra Halloween items!');
			}
			const ownedItems = user.allItemsOwned;
			const itemsToAdd = new Bank();
			for (const item of allItemsCanGet) {
				if (!ownedItems.has(item)) {
					itemsToAdd.add(item);
				}
			}

			if (itemsToAdd.length === 0) {
				return `You already have all Halloween items.`;
			}
			await user.transactItems({ itemsToAdd, collectionLog: true });
			messages.push(
				`You have claimed the following Halloween items: ${itemsToAdd.itemIDs
					.sort((a, b) => b - a)
					.map(id => Items.itemNameFromId(id))
					.join(', ')}.`
			);
			return new MessageBuilder().setContent(messages.join('')).addBankImage({
				bank: itemsToAdd,
				title: `Halloween Items Claimed`,
				user,
				flags: { forceAllPurple: 1 }
			});
		}
	},
	...CollectionLog.ranks.map(rank => ({
		name: `${rank.rank} Collection Log Rank`,
		hasRequirement: async (user: MUser): Promise<true | string> => {
			const { owned } = calcCLDetails(user);
			if (owned.length >= rank.itemsLogged) {
				return true;
			}
			return `You need to have logged at least ${rank.itemsLogged} items in your collection log to claim the ${rank.rank} rank. You currently have ${owned.length}.`;
		},
		action: async (user: MUser) => {
			const items = new Bank();

			if (user.allItemsOwned.amount(rank.book) < 3) {
				items.add(rank.book);
			}

			if (user.allItemsOwned.amount(rank.staff) < 3) {
				items.add(rank.staff);
			}
			if (items.length === 0) {
				return `You already have the ${rank.rank} rank items.`;
			}
			await user.addItemsToBank({ items, collectionLog: true });
			return `Congratulations! You claimed the ${rank.rank} Collection Log Rank and received: ${items}`;
		}
	}))
];

export const claimCommand = defineCommand({
	name: 'claim',
	description: 'Claim prizes, rewards and other things.',
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The thing you want to claim.',
			required: true,
			autocomplete: async ({ userId, value }: StringAutoComplete) => {
				const claimableItems = await prisma.reclaimableItem.findMany({
					where: {
						user_id: userId
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
	run: async ({ options, user }) => {
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
			const item = Items.getOrThrow(rawData.item_id);
			const loot = new Bank().add(item.id);
			await user.addItemsToBank({ items: loot, collectionLog: false });
			return `You claimed ${loot}.

${rawData.name}: ${rawData.description}.
${dateFm(new Date(rawData.date))}`;
		}

		if ('hasRequirement' in claimable && claimable.hasRequirement) {
			const requirementCheck = await claimable.hasRequirement(user);
			if (typeof requirementCheck === 'string') {
				return `You are not eligible to claim this: ${requirementCheck}`;
			}
		}

		const result = await claimable.action(user);
		return result;
	}
});
