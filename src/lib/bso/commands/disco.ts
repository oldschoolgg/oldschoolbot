import { Time } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import { Cache } from '@/lib/cache.js';
import { DISCO_AESTHETICS, DISCO_CLUBS, DISCO_CLUB_THEMES, DiscoItem, discoClubOrder, discoPopularity, isDiscoEventActive, scoreDiscoFashion } from '@/lib/bso/discoBloodbath.js';
import { RobochimpBitfieldEnum } from '@/lib/perkTiers.js';

const clubChoices = () => discoClubOrder().map(name => ({ name, value: name }));

const helpText = `**Disco Bloodbath** is a limited-time club circuit for minions who understand that fashion is a weapon.

Visit a club to send your minion out for at least thirty minutes. Your Fashion gear determines your points, your top two Realms earn progress, and each club has its own hidden crowd and vibe. Completed visits can return strange fashion loot and very rarely a chase box.

The clubs are:
${DISCO_CLUBS.map(club => `- **${club}** — ${DISCO_CLUB_THEMES[club].description}`).join('\n')}

Use `/disco outfit` for your breakdown, `/disco check_item` for one item, `/disco inquire` to ask around, and `/disco stats` to see your progress.`;

async function mayUseOutfit(user: MUser) {
	if (user.perkTier >= 4) return true;
	const roboChimpUser = await Cache.getRoboChimpUser(user.id);
	return roboChimpUser.bits.includes(RobochimpBitfieldEnum.CyrTier2);
}

function formatPoints(points: Record<(typeof DISCO_AESTHETICS)[number], number>) {
	return DISCO_AESTHETICS.map(aesthetic => `**${aesthetic}**: ${points[aesthetic]}/500`).join('\n');
}

export const discoCommand = defineCommand({
	name: 'disco',
	description: 'Enter the Disco Bloodbath club circuit.',
	options: [
		{ type: 'Subcommand', name: 'help', description: 'Learn how the club circuit works.' },
		{ type: 'Subcommand', name: 'stats', description: 'View your Realm progress and club rank.' },
		{
			type: 'Subcommand',
			name: 'outfit',
			description: 'See the Realms and points in your Fashion gear.'
		},
		{
			type: 'Subcommand',
			name: 'check_item',
			description: 'Check one item’s Disco scoring.',
			options: [{ type: 'String', name: 'item', description: 'The item to inspect.', required: true }]
		},
		{
			type: 'Subcommand',
			name: 'inquire',
			description: 'Ask your contacts what they think of a club.',
			options: [
				{
					type: 'String',
					name: 'club_name',
					description: 'The club to ask about.',
					required: true,
					choices: clubChoices()
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'visit',
			description: 'Send your minion to a club for a completed visit.',
			options: [
				{
					type: 'String',
					name: 'club_name',
					description: 'The club to visit.',
					required: true,
					choices: clubChoices()
				}
			]
		}
	],
	run: async ({ options, user, channelId }) => {
		if (!isDiscoEventActive()) return 'The Disco Bloodbath has closed for the night.';
		if (options.help) return helpText;

		if (options.check_item) {
			const item = new DiscoItem(Items.getOrThrow(options.check_item.item));
			return `**${item.item.name}**\nAesthetics: ${item.aesthetics.join(', ')}\n${formatPoints(item.points)}`;
		}

		if (options.outfit) {
			if (!(await mayUseOutfit(user))) {
				return 'The `/disco outfit` mirror is a shameless plug for money. Support the club with Patreon Tier 3+ or Cyr Tier 2, or use `/disco check_item` one item at a time.';
			}
			const scored = scoreDiscoFashion(user.gear.fashion.raw());
			return `${scored.items.map(({ slot, item }) => `**${slot}** — ${item.item.name}: ${item.aesthetics.join(' + ')} (${formatPoints(item.points)})`).join('\n')}\n\n**Totals**\n${formatPoints(scored.points)}`;
		}

		if (options.stats) {
			const stats = (await user.fetchUserStat('disco_stats')) as { points?: Record<string, number>; trips?: number };
			const points = stats?.points ?? {};
			return `**Disco Bloodbath stats**\nTrips completed: ${stats?.trips ?? 0}\n${DISCO_AESTHETICS.map(aesthetic => `**${aesthetic} Realm**: ${points[aesthetic] ?? 0}`).join('\n')}`;
		}

		if (options.inquire) {
			const ratelimit = await Cache.tryRatelimit(user.id, 'disco_inquire');
			if (!ratelimit.success) return 'If you keep asking, you are going to lose reputation faster than you earn it. Be a leader, not a follower.';
			const club = options.inquire.club_name as (typeof DISCO_CLUBS)[number];
			const popularity = discoPopularity(club);
			return popularity >= 83
				? `${club} is hot. Everyone worth knowing is talking about it.`
				: popularity >= 66
					? `${club} is getting attention. Your contacts are cautiously optimistic.`
					: `${club} feels cold right now. Your contacts are not impressed.`;
		}

		if (options.visit) {
			if (await user.minionIsBusy()) return `${user.minionName} is currently busy.`;
			const club = options.visit.club_name as (typeof DISCO_CLUBS)[number];
			const theme = DISCO_CLUB_THEMES[club];
			const popularity = discoPopularity(club);
			await ActivityManager.startTrip({
				userID: user.id,
				channelId,
				duration: 30 * Time.Minute,
				type: activity_type_enum.DiscoBloodbath,
				club,
				popularity,
				theme: { name: theme.name, good: theme.good, bad: theme.bad },
				fashion: user.gear.fashion.raw()
			} as any);
			return `${user.minionName} is heading to ${club}. The visit will take at least 30 minutes.`;
		}

		return 'Choose a Disco Bloodbath option.';
	}
});
