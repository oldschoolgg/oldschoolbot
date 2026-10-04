import { generateDiscoOutfitImage } from '@/lib/bso/canvas/generateDiscoOutfitImage.js';
import {
	DISCO_AESTHETICS,
	DISCO_CLUBS,
	DiscoItem,
	discoClubOrder,
	discoClubTheme,
	discoPopularity,
	isDiscoEventActive,
	scoreDiscoFashion
} from '@/lib/bso/discoBloodbath.js';
import { checkEntitlements } from '@/lib/bso/util/entitlementChecker.js';

import { Time } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import { BitField } from '@/lib/constants.js';
import { RobochimpBitfieldEnum } from '@/lib/perkTiers.js';
import type { DiscoBloodbathActivityTaskOptions } from '@/lib/types/minions.js';

const clubChoices = () => discoClubOrder().map(name => ({ name, value: name }));

const outfitEntitlements = [{ perkTier: 4 }, { bitfield: RobochimpBitfieldEnum.CyrTier2 }];

const helpText = (
	canUseOutfit: boolean
) => `**Disco Bloodbath** is a limited-time club circuit for minions who understand that fashion is a weapon.

Visit a club to send your minion out for at least thirty minutes. Your Fashion gear determines your points, and your top two Realms gain or lose progress depending on the party's vibe. Each club's crowd and theme change throughout the event. Use \`/disco inquire\` for a tip from your contacts, and \`/disco stats\` to track your rank. Completed visits can return strange fashion loot and very rarely a chase box.

The clubs are:
${DISCO_CLUBS.map(club => `- **${club}** — ${discoClubTheme(club).name}: ${discoClubTheme(club).description}`).join('\n')}

${canUseOutfit ? 'Use `/disco outfit` for your breakdown, or ' : 'Use '}\`/disco check_item\` to inspect one item.`;

function formatPoints(points: Record<(typeof DISCO_AESTHETICS)[number], number>) {
	return DISCO_AESTHETICS.map(
		aesthetic => `**${aesthetic}**: ${points[aesthetic]}/500 (${((points[aesthetic] / 500) * 100).toFixed(1)}%)`
	).join('\n');
}

function formatOutfitItem(item: DiscoItem) {
	const points = DISCO_AESTHETICS.filter(aesthetic => item.points[aesthetic] !== 0).sort(
		(a, b) => Math.abs(item.points[b]) - Math.abs(item.points[a])
	);
	return `**${item.item.name}**\n${points
		.map(
			aesthetic =>
				`${item.points[aesthetic] < 0 ? '**' : ''}${aesthetic}: ${item.points[aesthetic]}${item.points[aesthetic] < 0 ? '**' : ''}`
		)
		.join('\n')}`;
}

export const discoCommand = defineCommand({
	name: 'disco',
	description: 'Enter the Disco Bloodbath club circuit.',
	options: [
		{ type: 'Subcommand', name: 'start', description: 'Join the Disco Bloodbath event.' },
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
					autocomplete: async ({ value }: StringAutoComplete) =>
						clubChoices().filter(
							choice => !value || choice.name.toLowerCase().includes(value.toLowerCase())
						)
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
					autocomplete: async ({ value }: StringAutoComplete) =>
						clubChoices().filter(
							choice => !value || choice.name.toLowerCase().includes(value.toLowerCase())
						)
				}
			]
		}
	],
	run: async ({ options, user, channelId }) => {
		if (!isDiscoEventActive()) return 'The Disco Bloodbath has closed for the night.';
		if (options.start) {
			await user.update({
				bloodbath_event_started: true,
				bitfield: [...new Set([...user.bitfield, BitField.DiscoBloodbathGearPresetSlots])]
			});
			await prisma.gearPreset.createMany({
				data: ['discofuture', 'discoragdoll', 'discoanti'].map(name => ({ user_id: user.id, name })),
				skipDuplicates: true
			});
			return 'You have started Disco Bloodbath. You really need to read `/disco help`.\n\n4 `/gearpresets` slots have been permanently added to your account. Created empty presets: `discofuture`, `discoragdoll`, `discoanti`. Use `/gearpresets help`.';
		}
		if (options.help) return helpText((await checkEntitlements(user, outfitEntitlements)).success);

		if (options.check_item) {
			const resolved = Items.getItem(options.check_item.item);
			if (!resolved) return 'I could not find that item. Check the item name and try again.';
			const item = new DiscoItem(resolved);
			return `**${item.item.name}**\nAesthetics: ${item.aesthetics.join(', ')}\n${formatPoints(item.points)}`;
		}

		if (options.outfit) {
			if (!(await checkEntitlements(user, outfitEntitlements)).success) {
				return 'This command requires Tier 3 Patreon or higher.';
			}
			const scored = scoreDiscoFashion(user.gear.fashion.raw());
			return {
				content: scored.items.map(({ item }) => formatOutfitItem(item)).join('\n\n'),
				files: [
					{
						name: 'disco-outfit.png',
						buffer: await generateDiscoOutfitImage({ items: scored.items, user })
					}
				]
			};
		}

		if (options.stats) {
			const stats = (await user.fetchUserStat('disco_stats')) as {
				points?: Record<string, number>;
				trips?: number;
			};
			const points = stats?.points ?? {};
			const ranks = await Promise.all(
				DISCO_AESTHETICS.map(async aesthetic => {
					const value = points[aesthetic] ?? 0;
					const [row] = await prisma.$queryRaw<{ rank: bigint }[]>`
						SELECT COUNT(*) + 1 AS rank
						FROM user_stats
						WHERE COALESCE((disco_stats->'points'->>${aesthetic})::integer, 0) > ${value};
					`;
					const [king] = await prisma.$queryRaw<{ username: string | null }[]>`
						SELECT u.username
						FROM user_stats s
						JOIN users u ON u.id = s.user_id::text
						WHERE COALESCE((s.disco_stats->'points'->>${aesthetic})::integer, 0) > 0
						ORDER BY COALESCE((s.disco_stats->'points'->>${aesthetic})::integer, 0) DESC, u.id
						LIMIT 1;
					`;
					return `**${aesthetic} Realm**: ${value} points (rank #${row?.rank ?? 1}; club king: ${king?.username ?? 'Unclaimed'})`;
				})
			);
			const overall = DISCO_AESTHETICS.reduce((total, aesthetic) => total + (points[aesthetic] ?? 0), 0);
			return `**Disco Bloodbath stats**\nTrips completed: ${stats?.trips ?? 0}\nOverall: ${overall} points\n${ranks.join('\n')}`;
		}

		if (options.inquire) {
			if (!DISCO_CLUBS.includes(options.inquire.club_name as (typeof DISCO_CLUBS)[number]))
				return 'Choose a club from the suggestions.';
			const ratelimit = await Cache.tryRatelimit(user.id, 'disco_inquire');
			if (!ratelimit.success)
				return 'If you keep asking, you are going to lose reputation faster than you earn it. Be a leader, not a follower.';
			const club = options.inquire.club_name as (typeof DISCO_CLUBS)[number];
			const popularity = discoPopularity(club);
			return popularity >= 83
				? `${club} is hot. Everyone worth knowing is talking about it.`
				: popularity >= 66
					? `${club} is getting attention. Might be worth a visit...`
					: `${club} feels cold right now. Your contacts are not impressed.`;
		}

		if (options.visit) {
			if (!DISCO_CLUBS.includes(options.visit.club_name as (typeof DISCO_CLUBS)[number]))
				return 'Choose a club from the suggestions.';
			if (await user.minionIsBusy()) return `${user.minionName} is currently busy.`;
			const club = options.visit.club_name as (typeof DISCO_CLUBS)[number];
			const theme = discoClubTheme(club);
			const popularity = discoPopularity(club);
			await ActivityManager.startTrip<DiscoBloodbathActivityTaskOptions>({
				userID: user.id,
				channelId,
				duration: 30 * Time.Minute,
				type: activity_type_enum.DiscoBloodbath,
				club,
				popularity,
				theme: { name: theme.name, good: theme.good, bad: theme.bad },
				fashion: user.gear.fashion.raw()
			});
			return `${user.minionName} is heading to ${club}. The visit will take at least 30 minutes.`;
		}

		return 'Choose a Disco Bloodbath option.';
	}
});
