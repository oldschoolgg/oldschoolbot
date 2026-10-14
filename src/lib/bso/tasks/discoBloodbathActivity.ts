import {
	type DiscoAesthetic,
	type DiscoClub,
	discoHalloweenStory,
	isDiscoHalloween,
	scoreDiscoFashion
} from '@/lib/bso/discoBloodbath.js';
import { DiscoNormalLoot } from '@/lib/bso/openables/holidayOpenables.js';
import { treatTable } from '@/lib/bso/pumpkinHead.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import type { DiscoBloodbathActivityTaskOptions } from '@/lib/types/minions.js';

type DiscoStats = {
	points: Record<DiscoAesthetic, number>;
	trips: number;
	traversal: DiscoClub[];
	routeCompletions: number;
};

const route: DiscoClub[] = ['Money', 'Success', 'Fame', 'Glamour'];

function routeResetMessageForDepth(depth: number, rng: { pick<T>(items: readonly T[]): T }) {
	if (depth === route.length - 1) {
		return 'NO!!! You were so close! Oh well, I’m sure you’ll get there next time...';
	}
	if (depth === 2)
		return rng.pick([
			'Oooh you hear a voice whispering above the bass, it sounds like it’s disappointed...',
			'For a second, the bass drops out and something sighs above the dance floor...'
		]);
	if (depth === 1)
		return rng.pick([
			'You get a feeling like you just missed something, but you weren’t really close anyway...',
			'The lights flicker like they were waiting for you to do something else...'
		]);
	if (depth > 0) return 'Something about the route feels wrong, but the beat keeps going...';
	else return '';
}

const emptyStats = (): DiscoStats => ({
	points: { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 },
	trips: 0,
	traversal: [],
	routeCompletions: 0
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
			data.popularity *= 1.2;
			gained[aesthetic] = Math.floor(points * multiplier * (data.popularity / 100) * themeMultiplier);
		}
		let crashMessage = '';
		if (data.isCrashing) {
			const goodAestheticScore = scored.points[data.theme.good as DiscoAesthetic] ?? 0;
			const crashSuccessChance = Math.min(100, (goodAestheticScore / 500) * data.popularity);
			const crashedWithStyle = rng.percentChance(crashSuccessChance);
			for (const aesthetic of Object.keys(gained) as DiscoAesthetic[]) {
				gained[aesthetic] = Math.floor(gained[aesthetic] * (crashedWithStyle ? 2 : 0.5));
			}
			crashMessage = crashedWithStyle
				? rng.pick([
						'You crashed the party with style, and somehow everyone loved it.',
						'Nobody invited you, but your look turned the crash into the main event.',
						'You slipped past the door staff and owned the dance floor anyway.',
						'Your uninvited entrance was so stylish that the crowd doubled down on it.'
					])
				: rng.pick([
						'You crashed the party, but the crowd was not having it.',
						'The door staff noticed. The crowd noticed. Nobody was impressed.',
						'Your uninvited entrance landed with a thud instead of a beat drop.',
						'You crashed the party, but your look could not save the moment.'
					]);
		}

		const oldStats = ((await user.fetchUserStat('disco_stats')) as Partial<DiscoStats>) ?? {};
		const stats: DiscoStats = {
			...emptyStats(),
			...oldStats,
			points: { ...emptyStats().points, ...(oldStats.points ?? {}) },
			trips: (oldStats.trips ?? 0) + 1,
			traversal: [...(oldStats.traversal ?? [])],
			routeCompletions: oldStats.routeCompletions ?? 0
		};
		let glamourBoxes = 0;
		for (const aesthetic of Object.keys(gained) as DiscoAesthetic[]) stats.points[aesthetic] += gained[aesthetic];
		let routeResetMessage = '';

		if (!data.isRave) {
			if (minutes < 30) {
				if (stats.traversal.length > 0)
					routeResetMessage = routeResetMessageForDepth(stats.traversal.length, rng);
				stats.traversal = [];
			} else {
				const expectedNext = route[stats.traversal.length];
				if (data.club === expectedNext) {
					stats.traversal.push(data.club);
				} else {
					if (stats.traversal.length > 0)
						routeResetMessage = routeResetMessageForDepth(stats.traversal.length, rng);
					if (data.club === route[0]) stats.traversal = [data.club];
					else stats.traversal = [];
				}
			}
		}
		const loot = new Bank();
		const theoreticalMax = Math.floor((effectiveMinutes * 7500) / 60);
		const totalScore = Object.values(gained).reduce((sum, points) => sum + points, 0);
		const efficiency = totalScore / theoreticalMax;
		const tenChances = efficiency * 10;
		if (!data.isRave) {
			for (let i = 0; i < 10; i++) {
				if (rng.percentChance(tenChances * 2)) {
					loot.add(treatTable.roll());
				}
				if (rng.percentChance(tenChances)) {
					loot.add(DiscoNormalLoot.roll());
				}
			}
		}

		const completedRoute = stats.traversal.length === route.length;
		if (completedRoute) stats.routeCompletions++;
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

		const { itemsAdded, previousCL } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot,
			otherUpdates: awardPrize ? { claimed_glamour_box: { increment: 1 } } : undefined
		});
		const activity = await prisma.activity.findUniqueOrThrow({
			where: { id: data.id },
			select: { start_date: true, finish_date: true }
		});
		await prisma.discoBloodbathTrip.create({
			data: {
				activity_id: data.id,
				user_id: user.id,
				total_points_worn: scored.points,
				actual_duration: activity.finish_date.getTime() - activity.start_date.getTime(),
				calculated_duration: data.duration,
				effective_duration: data.effectiveDuration ?? data.duration,
				points_earned: gained,
				point_totals: stats.points,
				loot: itemsAdded.length > 0 ? itemsAdded.toJSON() : undefined,
				club: data.club,
				good_aesthetics: data.isRave ? (data.raveAesthetics ?? []) : [data.theme.good],
				bad_aesthetics: data.isRave ? [] : [data.theme.bad],
				is_rave: data.isRave ?? false
			}
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
		const crowdMessage = rng.roll(30)
			? rng.pick([
					'🕸️ The strobe lights briefly revealed something with too many legs.🕷️',
					'😱 A chill ran through the crowd when the bass dropped.🪝🐟 It was a literal dead fish...',
					'👻The dance floor creaked like an old coffin.⚰️',
					'🩻Nobody knew who put the skeleton behind the decks.☠️'
				])
			: data.popularity > 80
				? rng.pick(['It was packed.', 'The club was buzzing.', 'You could barely move through the crowd.'])
				: data.popularity <= 65
					? rng.pick([
							'The club felt dead.',
							'There was too much room on the dance floor.',
							'The crowd never really arrived.'
						])
					: 'The crowd was still breathing at least :D';
		const lure = rng.roll(10)
			? ' Someone mentioned that the Disco Fever is still hot... they were dead wrong 💀'
			: '';
		const story = isDiscoHalloween() ? discoHalloweenStory(data.club) : null;
		const storyEnding = story ? rng.pick(story.endings) : null;
		const pointSummary = affected
			.map(
				([aesthetic]) =>
					`${aesthetic}: ${gained[aesthetic] >= 0 ? '+' : ''}${gained[aesthetic]} (${stats.points[aesthetic]} total)`
			)
			.join('\n');
		const routeCompletionMessage = completedRoute
			? stats.routeCompletions === 1
				? '**You completed the route, congrats!** 🎉'
				: `**You completed the route ${stats.routeCompletions} times!** You can't get any more boxes :p 🎉`
			: '';
		const message = new MessageBuilder().setContent(
			`${user.mention}, ${user.minionName} finished a ${minutes}-minute ${data.isRave ? 'rave' : 'visit'} to ${data.club}.\n${topMessage}\n${crowdMessage}${crashMessage ? `\n${crashMessage}` : ''}${storyEnding ? `\n\n${storyEnding}` : ''}${lure}\n\n**Realm points**\n${pointSummary}${totalScore === 0 ? '\nYour Fashion gear scored no points. Try `/disco check_item` to plan your outfit.' : ''}${routeCompletionMessage ? `\n\n📢 ${routeCompletionMessage}\n` : ''}${glamourBoxes > 0 ? `\n\n🎉 **SKRINK/SKROD BOX DROP!** 🎉\nThe crowd erupts!` : ''}${itemsAdded.length > 0 ? `\n\n**Loot:** ${itemsAdded}` : ''}${routeResetMessage ? `\n\n***🔑${routeResetMessage}***\n` : ''}`
		);
		if (itemsAdded.length > 0) {
			message.addBankImage({
				bank: itemsAdded,
				title: 'Disco Bloodbath Loot',
				user,
				previousCL
			});
		}
		await handleTripFinish({
			user,
			channelId: data.channelId,
			message,
			data: { ...data, cantBeDoubled: true },
			loot: itemsAdded
		});
	}
};
