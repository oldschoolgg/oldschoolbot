import { ApplicationCommandOptionType } from 'discord.js';
import { randInt, Time } from 'e';
import { CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { BitField } from '../../lib/constants';
import { formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';
import { OSBMahojiCommand } from '../lib/util';

export const hweenGiveableItems = resolveItems([
	'Gravedigger mask',
	'Gravedigger top',
	'Gravedigger leggings',
	'Gravedigger gloves',
	'Gravedigger boots',
	'Jack lantern mask',
	'Scythe',
	'Grim reaper hood',
	'Jonas mask',
	'Skeleton mask',
	'Skeleton shirt',
	'Skeleton leggings',
	'Skeleton gloves',
	'Skeleton boots',
	'Anti-panties',
	'Banshee mask',
	'Banshee top',
	'Banshee robe',
	'Hunting knife',
	'Eek',
	'Clown mask',
	'Clown bow tie',
	'Clown gown',
	'Clown trousers',
	'Clown shoes',
	'Pumpkin lantern',
	'Skeleton lantern',
	'Spooky hood',
	'Spooky robe',
	'Spooky skirt',
	'Spooky gloves',
	'Spooky boots',
	'Headless head',
	'Magical pumpkin',
	'Haunted wine bottle',
	'Ugly halloween jumper (black)',
	'Ugly halloween jumper (orange)',
	'Saucepan',
	"Black h'ween mask"
]);

export const hweenIronItems = resolveItems(['Red halloween mask', 'Green halloween mask', 'Blue halloween mask']);

export function hweenItemsLeft(user: MUser) {
	const itemsToCheck = [...hweenGiveableItems];
	if (user.isIronman && user.bitfield.includes(BitField.PermanentIronman)) {
		itemsToCheck.push(...hweenIronItems);
	}
	return itemsToCheck.filter(i => !user.cl.has(i));
}

export const mahojiHalloweenCommand: OSBMahojiCommand = {
	name: 'trickortreat',
	description: 'The 2022 Halloween Event!',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Go trick or treating!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'claim',
			description: 'Claim your rewards!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'items',
			description: 'View the rewards you can get!'
		}
	],
	run: async ({
		userID,
		channelID,
		options
	}: CommandRunOptions<{
		start?: {};
		claim?: {};
		items?: {};
	}>) => {
		const user = await mUserFetch(userID);
		if (options.items) {
			const itemsLeft = hweenItemsLeft(user);
			if (itemsLeft.length === 0) return 'You have received every available item!';
			return `You still have these items left to claim: ${itemsLeft
				.map(itemNameFromID)
				.join(', ')}. Do more trick-or-treating, then claim them!

Note: permanent ironmen can receive these items: ${hweenIronItems.map(itemNameFromID).join(', ')}.`;
		}
		if (options.claim) {
			if (user.user.treats_delivered < 1) {
				return 'You have no rewards to claim, you need to do more trick-or-treating!';
			}
			const itemsToGive = hweenItemsLeft(user).slice(0, user.user.treats_delivered);
			const loot = new Bank();
			for (const item of itemsToGive) loot.add(item);
			await user.update({
				treats_delivered: 0
			});
			await user.addItemsToBank({ items: loot, collectionLog: true });
			return `You received... ${loot}.`;
		}

		if (user.minionIsBusy) return 'Your minion is busy right now.';
		const duration = Time.Minute * randInt(2, 4);

		await addSubTaskToActivityTask({
			userID: user.id,
			channelID,
			duration,
			type: 'HalloweenEvent'
		});

		return `${user.minionName} is now off to do some Trick or Treating for ${formatDuration(duration)}!`;
	}
};
