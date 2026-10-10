import { generateDiscoOutfitImage } from '@/lib/bso/canvas/generateDiscoOutfitImage.js';
import { discoBankPointEntitlements } from '@/lib/bso/discoBankPoints.js';
import {
	DISCO_AESTHETIC_SHORT_NAMES,
	DISCO_AESTHETICS,
	DISCO_CLUBS,
	DiscoItem,
	discoClubOrder,
	discoClubTheme,
	discoHalloweenStory,
	discoPopularity,
	isDiscoEventActive,
	isDiscoHalloween,
	scoreDiscoFashion
} from '@/lib/bso/discoBloodbath.js';
import { checkEntitlements } from '@/lib/bso/util/entitlementChecker.js';

import { Time } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { activity_type_enum } from '@/prisma/main/enums.js';
import { mentionCommand } from '@/discord/utils.js';
import { BitField } from '@/lib/constants.js';
import type { DiscoBloodbathActivityTaskOptions } from '@/lib/types/minions.js';

const clubChoices = () => discoClubOrder().map((name, index) => ({ name, value: DISCO_CLUBS[index] }));
const discoPresetNames = ['discofuture', 'discoragdoll', 'discoanti'] as const;

const helpText = (
	canUseDiscoBankPoints: boolean
) => `**Disco Bloodbath** is a limited-time club circuit for minions who understand that fashion is a weapon.

⭐ Use ${mentionCommand('disco', 'party')} to send your minion on a trip. Visits take at least thirty minutes.
- Your Fashion gear determines your points, and your top two Realms gain or lose progress depending on the party's vibe.
- Each club's crowd and theme *change throughout the event*.
- Use ${mentionCommand('disco', 'inquire')} for a tip from your contacts
💡 The ${mentionCommand('bank')} command can show you the Aesthetic points for each item in your bank: \`/bank flag:show_disco_points\`
- ${mentionCommand('disco', 'stats')} to track your rank.

*Completed visits can return strange fashion loot and very rarely a chase box*.

The clubs are:
${DISCO_CLUBS.map(club => {
	const theme = discoClubTheme(club);
	return `- **${theme.club}** — ${theme.name}: ${theme.description}`;
}).join('\n')}

Use ${mentionCommand('disco', 'outfit')} for your Fashion-gear breakdown, or ${mentionCommand('disco', 'check_item')} to inspect one item.${
	canUseDiscoBankPoints
		? `

Use ${mentionCommand('disco', 'search')} to search your bank for the best Disco points.`
		: ''
}`;

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
		{
			type: 'Subcommand',
			name: 'party',
			description: 'Send your minion to a club to visit (or crash) the party!',
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
				},
				{
					type: 'String',
					name: 'crash',
					description: 'Crash the party?',
					choices: [
						{ name: 'Crash!', value: 'crash' },
						{ name: 'Party!', value: 'party' },
						{ name: 'Host!', value: 'host' }
					]
				}
			]
		},
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
			name: 'search',
			description: 'Find your best bank items for an aesthetic.',
			options: [
				{
					type: 'String',
					name: 'aesthetic',
					description: 'The aesthetic to search for.',
					required: true,
					choices: DISCO_AESTHETICS.map(aesthetic => ({ name: aesthetic, value: aesthetic }))
				},
				{
					type: 'Boolean',
					name: 'combined',
					description: 'Sort by combined Disco points.',
					required: false
				}
			]
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
		}
	],
	run: async ({ options, user, channelId, interaction }) => {
		if (!isDiscoEventActive()) return 'The Disco Bloodbath has closed for the night.';
		if (options.start) {
			const presets = await prisma.gearPreset.findMany({ where: { user_id: user.id }, select: { name: true } });
			const missingPresets = discoPresetNames.filter(name => !presets.some(preset => preset.name === name));
			if (user.bloodbathEventStarted) {
				if (missingPresets.length === 0) return 'You have already joined the Disco Bloodbath and your three Disco presets are ready.';

				const availableSlots = (await user.calcMaxGearPresets()) - presets.length;
				if (availableSlots < missingPresets.length) {
					return `You have already joined the Disco Bloodbath, but ${missingPresets.map(name => `\`${name}\``).join(', ')} ${missingPresets.length === 1 ? 'is' : 'are'} missing. You need ${missingPresets.length - Math.max(availableSlots, 0)} more gear preset ${missingPresets.length - Math.max(availableSlots, 0) === 1 ? 'slot' : 'slots'} to restore them.`;
				}

				await interaction.confirmation(
					`You already joined the Disco Bloodbath. Restore the missing preset${missingPresets.length === 1 ? '' : 's'}: ${missingPresets.map(name => `\`${name}\``).join(', ')}?`
				);
				await prisma.gearPreset.createMany({
					data: missingPresets.map(name => ({ user_id: user.id, name })),
					skipDuplicates: true
				});
				return `Restored ${missingPresets.map(name => `\`${name}\``).join(', ')}.`;
			}

			await user.update({
				bloodbath_event_started: true,
				bitfield: [...new Set([...user.bitfield, BitField.DiscoBloodbathGearPresetSlots])]
			});
			await prisma.gearPreset.createMany({
				data: discoPresetNames.map(name => ({ user_id: user.id, name })),
				skipDuplicates: true
			});
			return `You have started Disco Bloodbath. You really need to read ${mentionCommand('disco', 'help')}.

4 \`/gearpresets\` slots have been permanently added to your account. Created empty presets: \`discofuture\`, \`discoragdoll\`, \`discoanti\`. Use \`/gearpresets help\`.

‼️ **Use ${mentionCommand('disco', 'party')}** to send trips**`;
		}
		if (options.help) return helpText((await checkEntitlements(user, discoBankPointEntitlements)).success);

		if (options.check_item) {
			const resolved = Items.getItem(options.check_item.item);
			if (!resolved) return 'I could not find that item. Check the item name and try again.';
			const item = new DiscoItem(resolved);
			return `**${item.item.name}**\nAesthetics: ${item.aesthetics.join(', ')}\n${formatPoints(item.points)}`;
		}

		if (options.search) {
			const ratelimit = await Cache.tryRatelimit(user.id, 'disco_bank_search');
			if (!ratelimit.success) return 'You need to wait before searching your bank again.';

			const aesthetic = options.search.aesthetic as (typeof DISCO_AESTHETICS)[number];
			const combined = options.search.combined ?? false;
			const results = user.bank
				.items()
				.filter(([item]) => Boolean(item.equipable) && Boolean(item.equipment?.slot))
				.map(([item]) => ({ name: item.name, points: new DiscoItem(item).points }))
				.sort((a, b) => {
					const aScore = combined
						? DISCO_AESTHETICS.reduce((total, realm) => total + a.points[realm], 0)
						: a.points[aesthetic];
					const bScore = combined
						? DISCO_AESTHETICS.reduce((total, realm) => total + b.points[realm], 0)
						: b.points[aesthetic];
					return bScore - aScore || a.name.localeCompare(b.name);
				})
				.slice(0, 100)
				.map(
					result =>
						`${result.name}, ${DISCO_AESTHETICS.filter(realm => result.points[realm] !== 0)
							.map(realm => `${DISCO_AESTHETIC_SHORT_NAMES[realm]}: ${result.points[realm]}`)
							.join(', ')}`
				);
			if (results.length === 0) return 'You have no equippable items in your bank.';

			const pages = Array.from({ length: Math.ceil(results.length / 10) }, (_, index) => ({
				content: results.slice(index * 10, (index + 1) * 10).join('\n')
			}));
			return interaction.makePaginatedMessage({ pages });
		}

		if (options.outfit) {
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
			const theme = discoClubTheme(club);
			const popularity = discoPopularity(theme.club);
			return popularity >= 83
				? `${theme.club} is hot. Everyone worth knowing is talking about it.`
				: popularity >= 66
					? `${theme.club} is getting attention. Might be worth a visit...`
					: `${theme.club} feels cold right now. Your contacts are not impressed.`;
		}

		if (options.party) {
			if (!DISCO_CLUBS.includes(options.party.club_name as (typeof DISCO_CLUBS)[number]))
				return 'Choose a club from the suggestions.';
			if (await user.minionIsBusy()) return `${user.minionName} is currently busy.`;
			const club = options.party.club_name as (typeof DISCO_CLUBS)[number];
			const theme = discoClubTheme(club);
			const popularity = discoPopularity(theme.club);
			await ActivityManager.startTrip<DiscoBloodbathActivityTaskOptions>({
				userID: user.id,
				channelId,
				duration: 30 * Time.Minute,
				type: activity_type_enum.DiscoBloodbath,
				club: theme.club,
				popularity,
				theme: { name: theme.name, good: theme.good, bad: theme.bad },
				fashion: user.gear.fashion.raw()
			});
			const story = isDiscoHalloween() ? discoHalloweenStory(theme.club) : null;
			return `${user.minionName} is heading to ${theme.club}. The visit will take at least 30 minutes.${story ? `\n\n${story.moment}` : ''}`;
		}

		return 'Choose a Disco Bloodbath option.';
	}
});
