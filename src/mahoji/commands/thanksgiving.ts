import { Bank } from 'oldschooljs';

import { fetchUserStats } from '@/lib/util/fetchUserStats.js';

function setStage(userId: string, stage: number) {
	return prisma.$executeRaw`UPDATE user_stats SET thanksgiving_2026 = jsonb_set(COALESCE(thanksgiving_2026, '{}'::jsonb), '{stage}', to_jsonb(${stage}::int)) WHERE user_id = ${BigInt(userId)}`;
}

const eventEndsAt = Date.UTC(2026, 11, 10);

const feathers = new Bank().add('Feather', 25);
const supplies = new Bank().add('Onion', 3).add('Cadava berries', 3);

function eventRewards() {
	return new Bank()
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
		await fetchUserStats(user.id);
		const [progress] = await prisma.$queryRaw<
			{ thanksgiving_2026: { stage?: number } }[]
		>`SELECT thanksgiving_2026 FROM user_stats WHERE user_id = ${BigInt(user.id)}`;
		const stage = progress?.thanksgiving_2026?.stage ?? 0;
		if (stage >= 4) {
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
		if (Date.now() >= eventEndsAt) return 'The Thanksgiving event has ended.';
		if (stage < 1) {
			if (action !== 'start') return 'Start the event with `/thanksgiving` first.';
			await setStage(user.id, 1);
			return '**A Feast to Sink Your Teeth Into**\n\nHenja and Angel have traded their Halloween sweets for a Thanksgiving feast. Their plan to keep every last bite has frightened the guests and sent the turkeys scattering around Rimmington. A mysterious vampyre offers to help, provided nobody serves garlic.\n\nHelp the children make amends: use `/thanksgiving action:Gather the turkey feathers` to find the flock.';
		}
		if (action === 'start') {
			if (stage < 2) return 'The flock has scattered. Use `/thanksgiving action:Gather the turkey feathers`.';
			if (stage < 3)
				return 'Bring **3 onions and 3 cadava berries**, then use `/thanksgiving action:Prepare the feast`.';
			return 'The feast is ready. Use `/thanksgiving action:Serve the feast` to invite everyone in.';
		}
		if (action === 'gather') {
			if (stage >= 2) return 'You already found the flock and collected its fallen turkey feathers.';
			if (!user.bank.has(feathers))
				return 'Collect **25 feathers** for the turkey decorations, then return to the flock.';
			await user.transactItems({
				itemsToRemove: feathers,
				otherQueries: [setStage(user.id, 2)]
			});
			return 'You lay a trail of feathers past eight abandoned lanterns and find the flock hiding in the cabbage patch. The turkeys follow it to the feast and leave their fallen feathers for decorations.\n\nBring **3 onions and 3 cadava berries** and use `/thanksgiving action:Prepare the feast`.';
		}
		if (stage < 2) return 'Find the flock first with `/thanksgiving action:Gather the turkey feathers`.';
		if (action === 'prepare') {
			if (stage >= 3)
				return 'The feast is already prepared. Serve it with `/thanksgiving action:Serve the feast`.';
			if (!user.bank.has(supplies))
				return `You need ${supplies} in your bank to decorate the table and prepare the feast.`;
			await user.transactItems({
				itemsToRemove: supplies,
				otherQueries: [setStage(user.id, 3)]
			});
			return 'You dress the table with feathers, glaze the onions, and make a suspiciously red berry punch. Henja suggests hiding the food; Angel points out that sharing it might actually be more fun. The vampyre checks the punch twice.\n\nUse `/thanksgiving action:Serve the feast`.';
		}
		if (stage < 3) return 'Prepare the feast first with `/thanksgiving action:Prepare the feast`.';
		const rewards = eventRewards();
		await user.transactItems({
			itemsToAdd: rewards,
			collectionLog: true,
			otherQueries: [setStage(user.id, 4)]
		});
		return `The turkeys, children, and vampyre sit down together. There is enough for everyone, even after Henja has seconds. Your guests thank you and present you with **${rewards}**. Happy Thanksgiving!`;
	}
});
