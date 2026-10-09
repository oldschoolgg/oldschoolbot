import {
	type DiscoAesthetic,
	type DiscoClub,
	discoHalloweenStory,
	isDiscoHalloween,
	scoreDiscoFashion
} from '@/lib/bso/discoBloodbath.js';
import { DiscoNormalLoot } from '@/lib/bso/openables/holidayOpenables.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import type { DiscoBloodbathActivityTaskOptions } from '@/lib/types/minions.js';

type DiscoStats = {
	points: Record<DiscoAesthetic, number>;
	trips: number;
	traversal: DiscoClub[];
};

const route: DiscoClub[] = ['Money', 'Success', 'Fame', 'Glamour'];

const emptyStats = (): DiscoStats => ({
	points: { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 },
	trips: 0,
	traversal: []
});

export const discoBloodbathTask: MinionTask = {
	type: activity_type_enum.DiscoBloodbath,
	async run(data: DiscoBloodbathActivityTaskOptions, { user, handleTripFinish, rng }) {
		const scored = scoreDiscoFashion(data.fashion);
		const minutes = Math.floor(data.duration / Time.Minute);
		const effectiveMinutes = Math.floor((data.effectiveDuration ?? data.duration) / Time.Minute);
		const multiplier = effectiveMinutes / 60;
		const affected = Object.entries(scored.points)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 2) as [DiscoAesthetic, number][];
		const gained: Record<DiscoAesthetic, number> = { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 };
		for (const [aesthetic, points] of affected) {
			const themeMultiplier = data.isRave
				? data.raveAesthetics?.includes(aesthetic)
					? 2
					: 1.25
				: aesthetic === data.theme.good
					? 1.75
					: aesthetic === data.theme.bad
						? -0.5
						: 1;
			gained[aesthetic] = Math.floor(points * multiplier * (data.popularity / 100) * themeMultiplier);
		}

		const oldStats = ((await user.fetchUserStat('disco_stats')) as Partial<DiscoStats>) ?? {};
		const stats: DiscoStats = {
			...emptyStats(),
			...oldStats,
			points: { ...emptyStats().points, ...(oldStats.points ?? {}) },
			trips: (oldStats.trips ?? 0) + 1,
			traversal: [...(oldStats.traversal ?? [])]
		};
		let glamourBoxes = 0;
		for (const aesthetic of Object.keys(gained) as DiscoAesthetic[]) stats.points[aesthetic] += gained[aesthetic];

		if (!data.isRave) {
			if (minutes < 30) {
				stats.traversal = [];
			} else {
				const expectedNext = route[stats.traversal.length];
				if (data.club === expectedNext) {
					stats.traversal.push(data.club as DiscoClub);
				} else stats.traversal = [];
			}
		}
		const loot = new Bank();
		const theoreticalMax = Math.floor((effectiveMinutes * 7500) / 60);
		const totalScore = Object.values(gained).reduce((sum, points) => sum + points, 0);
		const efficiency = totalScore / theoreticalMax;
		const tenChances = efficiency * 10;
		if (!data.isRave) {
			for (let i = 0; i < 10; i++) {
				if (rng.percentChance(tenChances)) {
					loot.add(DiscoNormalLoot.roll());
				}
			}
		}

		const completedRoute = stats.traversal.length === route.length;
		const rate = 20 * 60; // start with 1 per 20 hours

		for (let i = 0; i < minutes; i++) {
			if (rng.roll(rate)) {
				const box = rng.roll(2) ? 'Skrink box' : 'Skrod box';
				loot.add(box);
				glamourBoxes++;
			}
		}
		const awardPrize = completedRoute && user.user.claimed_glamour_box === 0;

		if (awardPrize) {
			loot.add(rng.roll(2) ? 'Skrink box' : 'Skrod box');
			glamourBoxes++;
		}

		if (data.isRave && data.raveId) await Cache.deleteDiscoRave(user.id, data.raveId);
		await user.statsUpdate({ disco_stats: stats });

		const { itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot,
			otherUpdates: awardPrize ? { claimed_glamour_box: { increment: 1 } } : undefined
		});

		const top = affected[0]?.[1] > 0 ? affected[0][0] : undefined;
		const topMessage = top
			? top === data.theme.good
				? rng.pick([
						`Your ${top} aesthetic owned the ${data.theme.name} vibe.`,
						`The ${data.theme.name} crowd understood your ${top} look immediately.`,
						`${top} was exactly the right kind of outrageous for ${data.theme.name}.`,
						`Your ${top} styling was a smashing hit at ${data.theme.name}.`,
						`The ${data.theme.name} room made space for your ${top} energy.`
					])
				: top === data.theme.bad
					? rng.pick([
							`Your ${top} aesthetic did NOT go over well with the ${data.theme.name} vibe.`,
							`The ${data.theme.name} crowd was not ready for that much ${top}.`,
							`${top} and ${data.theme.name} made a difficult pairing tonight.`,
							`Your ${top} look bounced hard off the ${data.theme.name} mood.`,
							`The ${data.theme.name} door staff had questions about your ${top} choices.`
						])
					: ''
			: '';
		const crowdMessage =
			isDiscoHalloween() && rng.roll(30)
				? rng.pick([
						'The strobe lights briefly revealed something with too many legs.',
						'A chill ran through the crowd when the bass dropped.',
						'The dance floor creaked like an old coffin.',
						'Nobody knew who put the skeleton behind the decks.'
					])
				: data.popularity > 80
					? rng.pick(['It was packed.', 'The club was buzzing.', 'You could barely move through the crowd.'])
					: data.popularity <= 65
						? rng.pick([
								'The club felt dead.',
								'There was too much room on the dance floor.',
								'The crowd never really arrived.'
							])
						: 'The crowd was lively enough.';
		const lure = rng.roll(10)
			? ' Someone mentioned that the Disco Fever is still hot — have you claimed your Lazy box yet?'
			: '';
		const story = isDiscoHalloween() ? discoHalloweenStory(data.club) : null;
		const storyEnding = story ? rng.pick(story.endings) : null;
		const pointSummary = affected
			.map(
				([aesthetic]) =>
					`${aesthetic}: ${gained[aesthetic] >= 0 ? '+' : ''}${gained[aesthetic]} (${stats.points[aesthetic]} total)`
			)
			.join('\n');
		await handleTripFinish({
			user,

			channelId: data.channelId,
			message: {
				content: `${user.mention}, ${user.minionName} finished a ${minutes}-minute ${data.isRave ? 'rave' : 'visit'} to ${data.club}.\n${topMessage}\n${crowdMessage}${storyEnding ? `\n\n${storyEnding}` : ''}${lure}\n\n**Realm points**\n${pointSummary}${totalScore === 0 ? '\nYour Fashion gear scored no points. Try `/disco check_item` to plan your outfit.' : ''}${glamourBoxes > 0 ? `\n\n🎉 **SKRINK/SKROD BOX DROP!** 🎉\nThe crowd erupts!` : ''}${itemsAdded.length > 0 ? `\n\n**Loot:** ${itemsAdded}` : ''}`
			},
			data: { ...data, cantBeDoubled: true },
			loot: itemsAdded
		});
	}
};
