import { Bank } from 'oldschooljs';

import { BitField, BOT_TYPE } from '@/lib/constants.js';

const feathers = new Bank().add('Feather', 25);
const supplies = new Bank().add('Onion', 3).add('Cadava berries', 3);

function eventRewards() {
	return BOT_TYPE === 'BSO'
		? new Bank().add('Count Shelldon').add('Cornucopia of the night')
		: new Bank()
				.add('Vampyre monocle')
				.add('Vampyre costume top')
				.add('Vampyre costume bottom')
				.add('Vampyre costume cape');
}

export const thanksgivingCommand = defineCommand({
	name: 'thanksgiving',
	description: 'Help prepare a delightfully spooky Thanksgiving feast.',
	flags: ['REQUIRES_LOCK'],
	options: [
		{
			type: 'String',
			name: 'action',
			description: 'Choose what to do at the feast.',
			required: false,
			choices: [
				{ name: 'Start or check progress', value: 'start' },
				{ name: 'Gather the turkey feathers', value: 'gather' },
				{ name: 'Prepare the feast', value: 'prepare' },
				{ name: 'Serve the feast', value: 'finish' }
			]
		}
	],
	run: async ({ options, user }) => {
		const action = options.action ?? 'start';
		if (user.bitfield.includes(BitField.Thanksgiving2026Complete)) {
			const missing = eventRewards()
				.items()
				.filter(([item]) => !user.allItemsOwned.has(item.id));
			if (missing.length === 0)
				return 'The feast is over, the turkeys are safe, and your guests are still arguing over the last slice of pie.';
			const reclaimed = new Bank();
			for (const [item] of missing) reclaimed.add(item.id);
			await user.addItemsToBank({ items: reclaimed, collectionLog: true });
			return `Your guests replace your lost rewards: ${reclaimed}.`;
		}
		if (!user.bitfield.includes(BitField.Thanksgiving2026Started)) {
			if (action !== 'start') return 'Start the event with `/thanksgiving` first.';
			await user.update({ bitfield: { push: BitField.Thanksgiving2026Started } });
			return '**A Feast to Sink Your Teeth Into**\n\nHenja and Angel have traded their Halloween sweets for a Thanksgiving feast. Their plan to keep every last bite has frightened the guests and sent the turkeys scattering around Rimmington. A mysterious vampyre offers to help, provided nobody serves garlic.\n\nHelp the children make amends: use `/thanksgiving action:Gather the turkey feathers` to find the flock.';
		}
		if (action === 'start') {
			if (!user.bitfield.includes(BitField.Thanksgiving2026Feathers))
				return 'The flock has scattered. Use `/thanksgiving action:Gather the turkey feathers`.';
			if (!user.bitfield.includes(BitField.Thanksgiving2026Prepared))
				return 'Bring **3 onions and 3 cadava berries**, then use `/thanksgiving action:Prepare the feast`.';
			return 'The feast is ready. Use `/thanksgiving action:Serve the feast` to invite everyone in.';
		}
		if (action === 'gather') {
			if (user.bitfield.includes(BitField.Thanksgiving2026Feathers))
				return 'You already found the flock and collected its fallen turkey feathers.';
			if (!user.bank.has(feathers))
				return 'Collect **25 feathers** for the turkey decorations, then return to the flock.';
			await user.transactItems({
				itemsToRemove: feathers,
				otherUpdates: { bitfield: { push: BitField.Thanksgiving2026Feathers } }
			});
			return 'You lay a trail of feathers past eight abandoned lanterns and find the flock hiding in the cabbage patch. The turkeys follow it to the feast and leave their fallen feathers for decorations.\n\nBring **3 onions and 3 cadava berries** and use `/thanksgiving action:Prepare the feast`.';
		}
		if (!user.bitfield.includes(BitField.Thanksgiving2026Feathers))
			return 'Find the flock first with `/thanksgiving action:Gather the turkey feathers`.';
		if (action === 'prepare') {
			if (user.bitfield.includes(BitField.Thanksgiving2026Prepared))
				return 'The feast is already prepared. Serve it with `/thanksgiving action:Serve the feast`.';
			if (!user.bank.has(supplies))
				return `You need ${supplies} in your bank to decorate the table and prepare the feast.`;
			await user.transactItems({
				itemsToRemove: supplies,
				otherUpdates: { bitfield: { push: BitField.Thanksgiving2026Prepared } }
			});
			return 'You dress the table with feathers, glaze the onions, and make a suspiciously red berry punch. Henja suggests hiding the food; Angel points out that sharing it might actually be more fun. The vampyre checks the punch twice.\n\nUse `/thanksgiving action:Serve the feast`.';
		}
		if (!user.bitfield.includes(BitField.Thanksgiving2026Prepared))
			return 'Prepare the feast first with `/thanksgiving action:Prepare the feast`.';
		const rewards = eventRewards();
		await user.transactItems({
			itemsToAdd: rewards,
			collectionLog: true,
			otherUpdates: { bitfield: { push: BitField.Thanksgiving2026Complete } }
		});
		return `The turkeys, children, and vampyre sit down together. There is enough for everyone, even after Henja has seconds. Your guests thank you and present you with **${rewards}**. Happy Thanksgiving!`;
	}
});
