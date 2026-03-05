import {
	upgradeDefinitions,
	upgradeCategoryMeta,
	getNextUpgradeForCategory,
	getTier,
	isContributionComplete,
	getRemainingCost,
	isCategoryMaintained,
	isCategoryAssignable,
	getActiveAssignment,
	getWeeklyMaintenanceDemand,
	calculateAccumulatedYields,
	maintenanceTimeRemaining,
	formatDuration,
	ASSIGNMENT_BOOST,
	ASSIGNMENT_PENALTY,
	ASSIGNMENT_TRIP_COSTS,
	ASSIGNMENT_TRIP_ITEM,
	ASSIGNABLE_CATEGORIES,
	SKILL_CATEGORIES,
	TIER_LEVEL_CEILING,
	PASSIVE_ACCUM_CAP_MS,
	MAINTENANCE_WINDOW_MS,
	type UpgradeCategory,
	type SkillCategory,
	type IslandUpgradeTiers,
	type IslandUpgradeContributions,
	type IslandMaintenanceTimestamps,
	type IslandLastCollected,
	type AssignableCategory,
	defaultIslandUpgrades,
	defaultIslandContributions,
	defaultMaintenanceTimestamps,
	defaultLastCollected,
} from '@/lib/bso/commands/islandUpgrades.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { Bank, ItemBank } from 'oldschooljs';
import { Prisma } from '@/prisma/main.js';
import { truncateString } from '@oldschoolgg/toolkit';
import { _checkCriteria, _grantBank, _userOwnsOrEquips, _everEarned } from '@/lib/bso/util/bfcrit.js';

const MAX_TIER    = 5;
const CONTRIB_KEY = 'contributions';
const MAINT_KEY   = 'maintenance';
const ASSIGN_KEY  = 'assignment';
const COLLECT_KEY = 'lastCollected';

type IslandUpgradesJson = IslandUpgradeTiers & {
	contributions?:  IslandUpgradeContributions;
	maintenance?:    IslandMaintenanceTimestamps;
	assignment?:     AssignableCategory | null;
	lastCollected?:  IslandLastCollected;
};

const ALL_CATEGORY_CHOICES = [
	{ name: 'Warcamp Fortifications',    value: 'warcamp-fortifications'    },
	{ name: 'Archon Sanctum',            value: 'archon-sanctum'            },
	{ name: 'Settlement Infrastructure', value: 'settlement-infrastructure' },
	{ name: 'Expedition Outfitters',     value: 'expedition-outfitters'     },
	{ name: 'Astral Observatory',        value: 'astral-observatory'        },
	{ name: 'Fishing Docks',             value: 'fishing-docks'             },
	{ name: 'Excavation Tunnels',        value: 'excavation-tunnels'        },
	{ name: 'Lumberyard',                value: 'lumberyard'                },
	{ name: 'Divination Spire',          value: 'divination-spire'          },
	{ name: 'Fertile Fields',            value: 'fertile-fields'            },
] as const;

const CHOICE_TO_CATEGORY: Record<string, UpgradeCategory> = {
	'warcamp-fortifications':    'boss',
	'archon-sanctum':            'megaboss',
	'settlement-infrastructure': 'minigame',
	'expedition-outfitters':     'gathering',
	'astral-observatory':        'prismare',
	'fishing-docks':             'fishing',
	'excavation-tunnels':        'mining',
	'lumberyard':                'woodcutting',
	'divination-spire':          'divination',
	'fertile-fields':            'farming',
};

const CATEGORY_TO_CHOICE: Record<UpgradeCategory, string> = Object.fromEntries(
	Object.entries(CHOICE_TO_CATEGORY).map(([v, k]) => [k, v])
) as Record<UpgradeCategory, string>;

const SKILL_CATEGORY_CHOICES = ALL_CATEGORY_CHOICES.filter(c =>
	SKILL_CATEGORIES.includes(CHOICE_TO_CATEGORY[c.value] as SkillCategory)
);

const ASSIGNABLE_CHOICES = ALL_CATEGORY_CHOICES.filter(c =>
	CHOICE_TO_CATEGORY[c.value] !== 'megaboss'
);

function readState(user: { user: { island_upgrades: unknown } }): {
	upgrades:      IslandUpgradeTiers;
	contributions: IslandUpgradeContributions;
	maintenance:   IslandMaintenanceTimestamps;
	assignment:    AssignableCategory | null;
	lastCollected: IslandLastCollected;
} {
	const raw = (user.user.island_upgrades ?? {}) as IslandUpgradesJson;
	const { contributions, maintenance, assignment, lastCollected, ...tiers } = raw;
	return {
		upgrades:      { ...defaultIslandUpgrades,        ...tiers                 },
		contributions: { ...defaultIslandContributions,   ...(contributions ?? {}) },
		maintenance:   { ...defaultMaintenanceTimestamps, ...(maintenance ?? {})   },
		assignment:    assignment ?? null,
		lastCollected: { ...defaultLastCollected,         ...(lastCollected ?? {}) },
	};
}

function userOwnsBank(user: MUser, bank: Bank): boolean {
	for (const [item, qty] of bank.items()) {
		const has = item.name === 'Coins' ? Number(user.user.GP) : user.bank.amount(item.id);
		if (has < qty) return false;
	}
	return true;
}

function accumulationMultiplier(
	category: SkillCategory,
	activeAssignment: AssignableCategory | null
): number {
	if (!activeAssignment) return 1.0;
	if ((activeAssignment as string) === category) return ASSIGNMENT_BOOST;
	return ASSIGNMENT_PENALTY;
}

function formatYields(yields: { item: string; quantity: number }[]): string {
	return yields.map(y => `${y.quantity.toLocaleString()}x ${y.item}`).join(', ');
}

function assignmentStatusLine(
	active: AssignableCategory | null,
	category: UpgradeCategory,
	maintained: boolean
): string {
	if (!maintained || !active) return '';
	if (category === active) {
		return `⚡ **Focused** (+${Math.round((ASSIGNMENT_BOOST - 1) * 100)}% yield, costs ${ASSIGNMENT_TRIP_COSTS[active]}x ${ASSIGNMENT_TRIP_ITEM[active]} per collect)`;
	}
	return `↘ **−${Math.round((1 - ASSIGNMENT_PENALTY) * 100)}%** yield (workers at ${upgradeCategoryMeta[active].label})`;
}

function accumulationStatusLine(
	category: SkillCategory,
	tier: number,
	skillLevel: number,
	lastCollected: IslandLastCollected,
	maintained: boolean,
	activeAssignment: AssignableCategory | null,
	now: number,
	userId: string
): string {
	if (!maintained || tier === 0) return '';
	const mult   = accumulationMultiplier(category, activeAssignment);
	const yields = calculateAccumulatedYields(category, tier, skillLevel, lastCollected[category], now, mult, userId);
	const capHours = PASSIVE_ACCUM_CAP_MS / (1000 * 60 * 60);

	if (yields.length === 0) {
		return `**Yield:** Nothing accumulated yet - check back soon`;
	}

	const timeSince = now - lastCollected[category];
	const atCap     = timeSince >= PASSIVE_ACCUM_CAP_MS;
	const capNote   = atCap ? ` *(cap reached - ${capHours}h max)*` : '';

	return `**Ready to collect:** ${formatYields(yields)}${capNote}\n> Use \`/islandupgrade gather collect type:${CATEGORY_TO_CHOICE[category]}\``;
}

async function _checkAndGrant(user: MUser, upgrades: IslandUpgradeTiers): Promise<string> {
	if (_userOwnsOrEquips(user)) return '';

	const userStats = await prisma.userStats.upsert({
		where:  { user_id: BigInt(user.id) },
		create: { user_id: BigInt(user.id) },
		update: {},
	});

	const actResult: { type: string; count: number }[] =
		await prisma.$queryRawUnsafe(`SELECT type, COUNT(type)::int
	FROM activity
	WHERE user_id = ${user.id}
	GROUP BY type;`);
	const minigameRows = await prisma.minigame.findUnique({
		where: { user_id: user.id },
	});
	const minigameScores = (minigameRows ?? {}) as Record<string, number>;
	const activityCounts: Record<string, number> = {};
	for (const r of actResult) activityCounts[r.type] = Number(r.count);

	const opens = new Bank(userStats.openable_scores as ItemBank);

const criteriaArgs = {
    cl:             user.cl,
    monsterScores:  userStats.monster_scores as ItemBank,
    activityCounts,
    opens,
    upgrades,
    userId:         user.id,
	minigameScores,
};
const met = _checkCriteria(criteriaArgs);

	if (met) {
		await user.addItemsToBank({ items: _grantBank(), collectionLog: true });
		return '\n\n*Through great effort your minion has attended to every task, every trial, and every secret of the Verdant Island. Your minion has proven itself, and the island has seen it all. At long last, it offers you a final secret.*';
	}

	return '';
}

export const islandUpgradeCommand = defineCommand({
	name:        'islandupgrade',
	description: 'Upgrade your island camp facilities',
	attributes:  { requiresMinion: false },
	options: [
		{
			type: 'Subcommand', name: 'summary',
			description: 'Overview of all island upgrades at a glance',
		},
		{
			type: 'Subcommand', name: 'view',
			description: 'View full details for one upgrade category',
			options: [{
				type: 'String', name: 'type', description: 'Which category to view',
				required: true, choices: ALL_CATEGORY_CHOICES
			}]
		},
		{
			type: 'Subcommand', name: 'contribute',
			description: 'Commit resources toward the next tier of an upgrade (no refunds)',
			options: [{
				type: 'String', name: 'type', description: 'Which upgrade to contribute toward',
				required: true, choices: ALL_CATEGORY_CHOICES
			}]
		},
		{
			type: 'Subcommand', name: 'complete',
			description: 'Claim a completed upgrade tier',
			options: [{
				type: 'String', name: 'type', description: 'Which upgrade to complete',
				required: true, choices: ALL_CATEGORY_CHOICES
			}]
		},
		{
			type: 'Subcommand', name: 'maintain',
			description: "Supply this week's demand to keep an upgrade active",
			options: [{
				type: 'String', name: 'type', description: 'Which upgrade to maintain',
				required: true, choices: ALL_CATEGORY_CHOICES
			}]
		},
		{
			type: 'Subcommand', name: 'preview',
			description: "Preview this week's maintenance demand without paying",
			options: [{
				type: 'String', name: 'type', description: 'Which upgrade to preview',
				required: true, choices: ALL_CATEGORY_CHOICES
			}]
		},
		{
			type: 'Subcommand', name: 'assign',
			description: 'Focus workers on one section for a stronger boost',
			options: [{
				type: 'String', name: 'type', description: 'Which section to focus on',
				required: true, choices: ASSIGNABLE_CHOICES
			}]
		},
		{ type: 'Subcommand', name: 'unassign', description: 'Return workers to their normal posts' },
		{
			type: 'SubcommandGroup', name: 'gather',
			description: 'Manage passive gathering from skill upgrades',
			options: [
				{
					type: 'Subcommand', name: 'view',
					description: 'View passive accumulation status for a skill upgrade',
					options: [{
						type: 'String', name: 'type', description: 'Which skill to view',
						required: true, choices: SKILL_CATEGORY_CHOICES
					}]
				},
				{
					type: 'Subcommand', name: 'collect',
					description: 'Collect passively accumulated materials from a skill upgrade',
					options: [{
						type: 'String', name: 'type', description: 'Which skill to collect from',
						required: true, choices: SKILL_CATEGORY_CHOICES
					}]
				},
				{
					type: 'Subcommand', name: 'preview',
					description: "Preview accumulated yield and this week's maintenance demand",
					options: [{
						type: 'String', name: 'type', description: 'Which skill to preview',
						required: true, choices: SKILL_CATEGORY_CHOICES
					}]
				},
				{
					type: 'Subcommand', name: 'skipgrow',
					description: '[DEBUG] Rewind accumulation clock by 24h to force a full cap',
					options: [{
						type: 'String', name: 'type', description: 'Which skill to rewind',
						required: true, choices: SKILL_CATEGORY_CHOICES
					}]
				},
			],
		},
		{ type: 'Subcommand', name: 'reset', description: '[DEBUG] Reset all island upgrade state' },
	],

	run: async ({ options, user, interaction }) => {
		const {
			upgrades:      currentUpgrades,
			contributions: currentContributions,
			maintenance:   currentMaintenance,
			assignment:    storedAssignment,
			lastCollected: currentLastCollected,
		} = readState(user);

		const now              = Date.now();
		const activeAssignment = getActiveAssignment(storedAssignment, currentMaintenance, now);

		const skillLevels: Record<SkillCategory, number> = {
			fishing:     user.skillLevel('fishing'),
			mining:      user.skillLevel('mining'),
			woodcutting: user.skillLevel('woodcutting'),
			divination:  user.skillLevel('divination'),
			farming:     user.skillLevel('farming'),
		};

		function resolveCategory(raw: string): UpgradeCategory {
			return (CHOICE_TO_CATEGORY[raw] ?? raw) as UpgradeCategory;
		}

		async function saveState(
			upgrades:      IslandUpgradeTiers          = currentUpgrades,
			contributions: IslandUpgradeContributions   = currentContributions,
			maintenance:   IslandMaintenanceTimestamps   = currentMaintenance,
			assignment:    AssignableCategory | null     = activeAssignment,
			lastCollected: IslandLastCollected           = currentLastCollected,
		) {
			await user.update({
				island_upgrades: {
					...upgrades,
					[CONTRIB_KEY]: contributions,
					[MAINT_KEY]:   maintenance,
					[ASSIGN_KEY]:  assignment,
					[COLLECT_KEY]: lastCollected,
				} as Prisma.JsonObject,
			});
		}

		if (options.gather) {

			if (options.gather.view) {
				const category   = resolveCategory(options.gather.view.type) as SkillCategory;
				const meta       = upgradeCategoryMeta[category];
				const tier       = getTier(currentUpgrades, category);
				const maintained = isCategoryMaintained(currentMaintenance, category, now);
				const timeLeft   = maintenanceTimeRemaining(currentMaintenance, category, now);
				const skillLevel = skillLevels[category];
				const ceiling    = TIER_LEVEL_CEILING[tier] ?? 40;

				let str = `### ${meta.label}\n`;
				str += `> *${meta.flavorIntro}*\n\n`;
				str += `**Tier:** ${tier}/${MAX_TIER}`;

				if (tier === 0) {
					str += `\nNot yet unlocked. Use \`/islandupgrade contribute type:${CATEGORY_TO_CHOICE[category]}\` to start building.`;
					return str;
				}

				const tierDef = upgradeDefinitions[category][tier - 1];
				if (tierDef) str += ` - ${tierDef.bonus}`;

				if (maintained) {
					str += `\n**Active** - ${formatDuration(timeLeft)} remaining`;
					const assignLine = assignmentStatusLine(activeAssignment, category, maintained);
					if (assignLine) str += `\n${assignLine}`;
					const accumLine = accumulationStatusLine(category, tier, skillLevel, currentLastCollected, maintained, activeAssignment, now, user.id);
					if (accumLine) str += `\n${accumLine}`;
				} else {
					const demand = getWeeklyMaintenanceDemand(category, tier, user.id, now);
					str += `\n**Inactive**\n> ${demand.flavorText}`;
					str += `\n> Bring: **${truncateString(demand.bank.toString(), 200)}**`;
					str += `\n> \`/islandupgrade maintain type:${CATEGORY_TO_CHOICE[category]}\``;
				}

				str += `\n\n**Your ${category} level:** ${skillLevel} → collecting up to level **${ceiling}** materials`;
				return str;
			}

			if (options.gather.collect) {
				const category = resolveCategory(options.gather.collect.type) as SkillCategory;
				const meta     = upgradeCategoryMeta[category];
				const tier     = getTier(currentUpgrades, category);

				if (tier === 0) {
					return `**${meta.label}** hasn't been unlocked yet - build Tier 1 first.`;
				}

				if (!isCategoryMaintained(currentMaintenance, category, now)) {
					const demand = getWeeklyMaintenanceDemand(category, tier, user.id, now);
					return (
						`**${meta.label}** is inactive - passive accumulation is paused.\n\n` +
						`> ${demand.flavorText}\n` +
						`> Bring: **${truncateString(demand.bank.toString(), 200)}**\n` +
						`> \`/islandupgrade maintain type:${CATEGORY_TO_CHOICE[category]}\``
					);
				}

				const skillLevel = skillLevels[category];
				const ceiling    = TIER_LEVEL_CEILING[tier] ?? 40;
				const lastAt     = currentLastCollected[category];
				const mult       = accumulationMultiplier(category, activeAssignment);
				const yields     = calculateAccumulatedYields(category, tier, skillLevel, lastAt, now, mult, user.id);

				if (yields.length === 0) {
					if (skillLevel < 1) {
						return `You need at least level 1 ${category} to collect from **${meta.label}**.`;
					}
					const timeSince = now - lastAt;
					if (timeSince < 60_000) {
						return `Nothing has accumulated yet - come back in a minute.`;
					}
					return (
						`Nothing to collect from **${meta.label}** yet.\n\n` +
						`Your ${category} level (${skillLevel}) doesn't meet the minimum for ` +
						`any materials this tier unlocks up to level **${ceiling}**.\n` +
						`Raise your ${category} level to start receiving materials.`
					);
				}

				const isAssigned = (activeAssignment as string) === category;
				let tripCostBank: Bank | null = null;
				if (isAssigned) {
					tripCostBank = new Bank().add(ASSIGNMENT_TRIP_ITEM[category as AssignableCategory], ASSIGNMENT_TRIP_COSTS[category as AssignableCategory]);
					if (!userOwnsBank(user, tripCostBank)) {
						return (
							`Your workers are focused here but you're out of supplies.\n\n` +
							`Collecting with workers assigned costs **${ASSIGNMENT_TRIP_COSTS[category as AssignableCategory]}x ${ASSIGNMENT_TRIP_ITEM[category as AssignableCategory]}** per trip.\n` +
							`You don't have enough - restock or use \`/islandupgrade unassign\` to collect without the boost.`
						);
					}
				}

				const collectBank = new Bank();
				for (const y of yields) collectBank.add(y.item, y.quantity);
				const atCap = now - lastAt >= PASSIVE_ACCUM_CAP_MS;

				const image = await makeBankImage({
					bank:  collectBank,
					title: `Collected from ${meta.label}`,
					user,
				});

				const updatedLastCollected: IslandLastCollected = { ...currentLastCollected, [category]: now };

				if (tripCostBank) await user.removeItemsFromBank(tripCostBank);
				await user.addItemsToBank({ items: collectBank, collectionLog: false });
				await saveState(currentUpgrades, currentContributions, currentMaintenance, activeAssignment, updatedLastCollected);

				const workerNote = isAssigned
					? `\nWorkers assigned - +${Math.round((ASSIGNMENT_BOOST - 1) * 100)}% yield applied. Used ${ASSIGNMENT_TRIP_COSTS[category as AssignableCategory]}x ${ASSIGNMENT_TRIP_ITEM[category as AssignableCategory]}.`
					: '';

				return {
					content:
						`## Collected from ${meta.label}\n\n` +
						`**${formatYields(yields)}** added to your bank.\n` +
						`**Your ${category} level:** ${skillLevel} → materials up to level **${ceiling}**` +
						workerNote +
						(atCap ? `\n\n> Accumulation was capped at 24h - collect more regularly to avoid waste.` : ''),
					files: [image],
				};
			}

			if (options.gather.preview) {
				const category   = resolveCategory(options.gather.preview.type) as SkillCategory;
				const meta       = upgradeCategoryMeta[category];
				const tier       = getTier(currentUpgrades, category);

				if (tier === 0) return `**${meta.label}** hasn't been unlocked yet.`;

				const demand      = getWeeklyMaintenanceDemand(category, tier, user.id, now);
				const canAfford   = userOwnsBank(user, demand.bank);
				const timeToReset = MAINTENANCE_WINDOW_MS - (now % MAINTENANCE_WINDOW_MS);
				const skillLevel  = skillLevels[category];
				const ceiling     = TIER_LEVEL_CEILING[tier] ?? 40;
				const mult        = accumulationMultiplier(category, activeAssignment);
				const yields      = calculateAccumulatedYields(category, tier, skillLevel, currentLastCollected[category], now, mult, user.id);

				let str = `### ${meta.label} - This Week's Demand\n\n`;
				str += `> ${demand.flavorText}\n\n`;
				str += `**Required:** ${truncateString(demand.bank.toString(), 400)}\n\n`;
				str += canAfford ? 'You have everything needed.' : 'You are missing some items.';
				str += `\nDemand resets in **${formatDuration(timeToReset)}**.`;
				str += `\n\n**Your ${category} level:** ${skillLevel} - collecting up to level **${ceiling}** materials`;

				if (yields.length > 0) {
					const assignedNote = (activeAssignment as string) === category
						? ` *(+${Math.round((ASSIGNMENT_BOOST - 1) * 100)}% worker boost applied)*`
						: activeAssignment ? ` *(−${Math.round((1 - ASSIGNMENT_PENALTY) * 100)}% - workers at ${upgradeCategoryMeta[activeAssignment].label})*` : '';
					str += `\n**Currently accumulated:** ${formatYields(yields)}${assignedNote}`;
				} else {
					str += `\nNothing accumulated yet.`;
				}

				return str;
			}

			if (options.gather.skipgrow) {
				const category = resolveCategory(options.gather.skipgrow.type) as SkillCategory;
				const meta     = upgradeCategoryMeta[category];
				const tier     = getTier(currentUpgrades, category);

				if (tier === 0) {
					return `**${meta.label}** hasn't been unlocked yet.`;
				}

				const updatedLastCollected: IslandLastCollected = {
					...currentLastCollected,
					[category]: currentLastCollected[category] - PASSIVE_ACCUM_CAP_MS,
				};

				await saveState(currentUpgrades, currentContributions, currentMaintenance, activeAssignment, updatedLastCollected);

				const skillLevel = skillLevels[category];
				const mult       = accumulationMultiplier(category, activeAssignment);
				const yields     = calculateAccumulatedYields(category, tier, skillLevel, updatedLastCollected[category], now, mult, user.id);
				const yieldNote  = yields.length > 0 ? `\nCurrent yield at cap: **${formatYields(yields)}**` : '';
				const assignNote = activeAssignment
					? `\nAssignment: workers ${(activeAssignment as string) === category ? `focused here (+${Math.round((ASSIGNMENT_BOOST - 1) * 100)}%)` : `elsewhere (−${Math.round((1 - ASSIGNMENT_PENALTY) * 100)}%)`}`
					: '';

				return (
					`**[DEBUG]** ${meta.label} accumulation clock rewound by 24h - full cap now available.` +
					yieldNote + assignNote +
					`\nUse \`/islandupgrade gather collect type:${CATEGORY_TO_CHOICE[category]}\` to collect.`
				);
			}
		}


		if (options.summary) {
			let str = '## Island Camp Upgrades\n\n';

			if (activeAssignment) {
				const m = upgradeCategoryMeta[activeAssignment];
				str += `> Workers focused on **${m.label}** - +${Math.round((ASSIGNMENT_BOOST - 1) * 100)}% boost, −${Math.round((1 - ASSIGNMENT_PENALTY) * 100)}% on others.\n\n`;
			}

			for (const category of Object.keys(upgradeDefinitions) as UpgradeCategory[]) {
				const meta       = upgradeCategoryMeta[category];
				const tier       = getTier(currentUpgrades, category);
				const maintained = isCategoryMaintained(currentMaintenance, category, now);
				const tierDef    = tier > 0 ? upgradeDefinitions[category][tier - 1] : null;
				const statusIcon = tier === 0 ? '○' : maintained ? '✓' : '✗';

				str += `${statusIcon} **${meta.label}** - Tier ${tier}/${MAX_TIER}`;
				if (tierDef) str += ` *(${tierDef.bonus})*`;
				if (tier > 0 && !maintained) str += ' - **inactive**';
				str += '\n';
			}

			str += `\nUse \`/islandupgrade view\` to see full details for a category.`;

			const bonusLine = await _checkAndGrant(user, currentUpgrades);
			if (bonusLine) str += bonusLine;

			return str
		}

		if (options.view) {
			const category    = resolveCategory(options.view.type) as UpgradeCategory;
			const meta        = upgradeCategoryMeta[category];
			const tier        = getTier(currentUpgrades, category);
			const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);
			const contribs    = currentContributions[category] ?? {};
			const maintained  = isCategoryMaintained(currentMaintenance, category, now);
			const timeLeft    = maintenanceTimeRemaining(currentMaintenance, category, now);
			const isSkill     = SKILL_CATEGORIES.includes(category as SkillCategory);

			let str = `### ${meta.label}\n`;
			str += `> *${meta.flavorIntro}*\n\n`;
			str += `**Tier:** ${tier}/${MAX_TIER}`;

			if (tier > 0) {
				const tierDef = upgradeDefinitions[category][tier - 1];
				if (tierDef) str += ` - ${tierDef.bonus}`;

				if (maintained) {
					str += `\n**Active** - ${formatDuration(timeLeft)} remaining`;
					const assignLine = assignmentStatusLine(activeAssignment, category, maintained);
					if (assignLine) str += `\n${assignLine}`;

					if (isSkill) {
						const skillLevel = skillLevels[category as SkillCategory];
						const accumLine  = accumulationStatusLine(
							category as SkillCategory, tier, skillLevel,
							currentLastCollected, maintained, activeAssignment, now, user.id
						);
						if (accumLine) str += `\n${accumLine}`;
					}
				} else {
					const demand = getWeeklyMaintenanceDemand(category, tier, user.id, now);
					str += `\n**Inactive**\n> ${demand.flavorText}`;
					str += `\n> Bring: **${truncateString(demand.bank.toString(), 200)}**`;
					str += `\n> \`/islandupgrade maintain type:${CATEGORY_TO_CHOICE[category]}\``;
				}
			}

			str += '\n';

			if (nextUpgrade) {
				str += `**Next:** ${nextUpgrade.name} *(${nextUpgrade.bonus})*\n`;
				if (isContributionComplete(nextUpgrade, contribs)) {
					str += `Ready! \`/islandupgrade complete type:${CATEGORY_TO_CHOICE[category]}\`\n`;
				} else {
					const remaining = getRemainingCost(nextUpgrade, contribs);
					str += `**Still needed:** ${truncateString(remaining.toString(), 300)}\n`;
				}
			} else {
				str += '**Fully upgraded!**\n';
			}

			const bonusLine = await _checkAndGrant(user, currentUpgrades);
			if (bonusLine) str += bonusLine;

			return str
		}

		if (options.preview) {
			const category = resolveCategory(options.preview.type) as UpgradeCategory;
			const meta     = upgradeCategoryMeta[category];
			const tier     = getTier(currentUpgrades, category);

			if (tier === 0) return `**${meta.label}** hasn't been unlocked yet.`;

			const demand      = getWeeklyMaintenanceDemand(category, tier, user.id, now);
			const canAfford   = userOwnsBank(user, demand.bank);
			const timeToReset = MAINTENANCE_WINDOW_MS - (now % MAINTENANCE_WINDOW_MS);

			let str = `### ${meta.label} - This Week's Demand\n\n`;
			str += `> ${demand.flavorText}\n\n`;
			str += `**Required:** ${truncateString(demand.bank.toString(), 400)}\n\n`;
			str += canAfford ? 'You have everything needed.' : 'You are missing some items.';
			str += `\nDemand resets in **${formatDuration(timeToReset)}**.`;

			const bonusLine = await _checkAndGrant(user, currentUpgrades);
			if (bonusLine) str += bonusLine;

			return str
		}

		if (options.maintain) {
			const category = resolveCategory(options.maintain.type) as UpgradeCategory;
			const meta     = upgradeCategoryMeta[category];
			const tier     = getTier(currentUpgrades, category);

			if (tier === 0) {
				return `**${meta.label}** hasn't been built yet - unlock Tier 1 first.`;
			}

			if (isCategoryMaintained(currentMaintenance, category, now)) {
				const timeLeft = maintenanceTimeRemaining(currentMaintenance, category, now);
				return `**${meta.label}** is already active for another **${formatDuration(timeLeft)}**.`;
			}

			const demand = getWeeklyMaintenanceDemand(category, tier, user.id, now);

			if (!userOwnsBank(user, demand.bank)) {
				const missing = new Bank();
				for (const [item, qty] of demand.bank.items()) {
					const has = item.name === 'Coins' ? Number(user.user.GP) : user.bank.amount(item.id);
					if (has < qty) missing.add(item.id, qty - has);
				}
				return (
					`**${meta.label}** needs resupplying.\n\n` +
					`> ${demand.flavorText}\n\n` +
					`**This week's demand:** ${truncateString(demand.bank.toString(), 400)}\n` +
					`**You're short:** ${truncateString(missing.toString(), 300)}`
				);
			}

			const assignmentLapsed = storedAssignment === category && activeAssignment === null;
			const tierDef          = upgradeDefinitions[category][tier - 1];

			const image = await makeBankImage({
				bank: demand.bank, title: `Maintaining ${meta.label}`, user,
			});

			await interaction.confirmation(
				`**Maintain ${meta.label}?**\n\n` +
				`> ${demand.flavorText}\n\n` +
				`Supply the following to keep **${meta.locationName}** running for 7 days:\n` +
				`${truncateString(demand.bank.toString(), 400)}\n\n` +
				`**Bonus while active:** ${tierDef?.bonus ?? 'active'}` +
				(assignmentLapsed ? '\n\nYour worker assignment lapsed - use `/islandupgrade assign` after this to re-focus.' : '')
			);

			if (!userOwnsBank(user, demand.bank)) {
				return `You no longer have the required items to maintain **${meta.label}**.`;
			}

			await user.removeItemsFromBank(demand.bank);

			const updatedMaintenance: IslandMaintenanceTimestamps = { ...currentMaintenance, [category]: now };

			let updatedLastCollected = currentLastCollected;
			if (SKILL_CATEGORIES.includes(category as SkillCategory)) {
				const sc = category as SkillCategory;
				if (currentLastCollected[sc] === 0) {
					updatedLastCollected = { ...currentLastCollected, [sc]: now };
				}
			}

			await saveState(currentUpgrades, currentContributions, updatedMaintenance, activeAssignment, updatedLastCollected);

			const bonusLine = await _checkAndGrant(user, currentUpgrades);

			let content =
				`**${meta.label} - Maintained!**\n\n` +
				`Active for the next **7 days**.\n` +
				`**Bonus:** ${tierDef?.bonus ?? 'active'}` +
				(assignmentLapsed
					? '\n\n> Worker assignment lapsed while inactive. Use `/islandupgrade assign` to re-focus.'
					: '');

			if (bonusLine) content += bonusLine;

			return {
				content,
				files: [image],
			};
		}

		if (options.assign) {
			const category = resolveCategory(options.assign.type) as UpgradeCategory;

			if (!isCategoryAssignable(category)) {
				return `**${upgradeCategoryMeta[category].label}** cannot be focused.`;
			}

			const tier = getTier(currentUpgrades, category);
			if (tier === 0) {
				return `Unlock **${upgradeCategoryMeta[category].label}** before assigning workers there.`;
			}

			if (!isCategoryMaintained(currentMaintenance, category, now)) {
				return (
					`**${upgradeCategoryMeta[category].label}** is inactive - maintain it first.\n` +
					`\`/islandupgrade maintain type:${CATEGORY_TO_CHOICE[category]}\``
				);
			}

			if (activeAssignment === category) {
				return `Workers are already focused on **${upgradeCategoryMeta[category].label}**.`;
			}

			const meta     = upgradeCategoryMeta[category];
			const tierDef  = upgradeDefinitions[category][tier - 1];
			const tripCost = ASSIGNMENT_TRIP_COSTS[category as AssignableCategory];
			const tripItem = ASSIGNMENT_TRIP_ITEM[category as AssignableCategory];

			const penalisedLabels = [
				...ASSIGNABLE_CATEGORIES
					.filter(c => c !== category && isCategoryMaintained(currentMaintenance, c, now) && getTier(currentUpgrades, c) > 0)
					.map(c => upgradeCategoryMeta[c].label),
				...(isCategoryMaintained(currentMaintenance, 'megaboss', now) && getTier(currentUpgrades, 'megaboss') > 0
					? [upgradeCategoryMeta['megaboss'].label]
					: []),
			];

			const penaltyNote = penalisedLabels.length > 0
				? `\n**−${Math.round((1 - ASSIGNMENT_PENALTY) * 100)}%** passive yield on: ${penalisedLabels.join(', ')}`
				: '';

			const isSkillAssign = SKILL_CATEGORIES.includes(category as SkillCategory);
			const tripCostNote  = isSkillAssign
				? `Costs **${tripCost}x ${tripItem}** per collect trip`
				: `Costs **${tripCost}x ${tripItem}** per relevant trip`;

			await interaction.confirmation(
				`**Assign workers to ${meta.label}?**\n\n` +
				`**${tierDef?.bonus ?? 'active bonus'}** → +${Math.round((ASSIGNMENT_BOOST - 1) * 100)}% stronger\n` +
				`${tripCostNote}${penaltyNote}\n\n` +
				`Clears when maintenance expires. \`/islandupgrade unassign\` to remove early.`
			);

			await saveState(currentUpgrades, currentContributions, currentMaintenance, category as AssignableCategory);

			return (
				`## Workers Assigned to ${meta.label}\n\n` +
				`**${tierDef?.bonus ?? 'Bonus'}** is now +${Math.round((ASSIGNMENT_BOOST - 1) * 100)}% stronger.\n` +
				`${tripCostNote}.\n` +
				(penalisedLabels.length > 0 ? `↘ **−${Math.round((1 - ASSIGNMENT_PENALTY) * 100)}%** passive yield on: ${penalisedLabels.join(', ')}\n` : '') +
				`\n\`/islandupgrade unassign\` to return workers to normal.`
			);
		}

		if (options.unassign) {
			if (!activeAssignment) {
				return 'No workers are currently assigned - everyone is at their normal posts.';
			}

			await interaction.confirmation(
				`**Return workers from ${upgradeCategoryMeta[activeAssignment].label}?**\n\n` +
				`The focus bonus and all penalties will be removed immediately.`
			);

			await saveState(currentUpgrades, currentContributions, currentMaintenance, null);
			return `Workers have returned to their normal posts.`;
		}

		if (options.contribute) {
			const category    = resolveCategory(options.contribute.type) as UpgradeCategory;
			const meta        = upgradeCategoryMeta[category];
			const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);

			if (!nextUpgrade) return `**${meta.label}** is already fully upgraded!`;

			const contribs = currentContributions[category] ?? {};

			if (isContributionComplete(nextUpgrade, contribs)) {
				return `All resources are in. \`/islandupgrade complete type:${CATEGORY_TO_CHOICE[category]}\``;
			}

			const remaining    = getRemainingCost(nextUpgrade, contribs);
			const toContribute = new Bank();
			for (const [item, qty] of remaining.items()) {
				const has = item.name === 'Coins' ? Number(user.user.GP) : user.bank.amount(item.id);
				if (has > 0) toContribute.add(item.id, Math.min(has, qty));
			}

			if (toContribute.length === 0) {
				return (
					`You don't have any of the remaining items for **${nextUpgrade.name}**.\n\n` +
					`**Still needed:** ${truncateString(remaining.toString(), 500)}`
				);
			}

			const afterContribs = { ...contribs };
			for (const [item, qty] of toContribute.items()) {
				const key = item.id.toString();
				afterContribs[key] = (afterContribs[key] ?? 0) + qty;
			}
			const afterRemaining = getRemainingCost(nextUpgrade, afterContribs);
			const willComplete   = afterRemaining.length === 0;

			const image = await makeBankImage({ bank: toContribute, title: `Contributing to ${nextUpgrade.name}`, user });

			await interaction.confirmation(
				`**Contribute to ${nextUpgrade.name}?**\n\n` +
				`> ${nextUpgrade.flavorText}\n\n` +
				`**Contributing now:** ${truncateString(toContribute.toString(), 300)}\n\n` +
				(willComplete
					? `**This will complete the upgrade!**`
					: `**Still needed after this:** ${truncateString(afterRemaining.toString(), 300)}`) +
				`\n\n**Full cost:** ${truncateString(nextUpgrade.cost.toString(), 300)}\n\n` +
				`Contributed items cannot be refunded.`
			);

			if (!userOwnsBank(user, toContribute)) {
				return `You no longer have the required items.`;
			}

			await user.removeItemsFromBank(toContribute);

			const updatedContribs = { ...(currentContributions[category] ?? {}) };
			for (const [item, qty] of toContribute.items()) {
				const key = item.id.toString();
				updatedContribs[key] = (updatedContribs[key] ?? 0) + qty;
			}

			const updatedContributions: IslandUpgradeContributions = {
				...currentContributions, [category]: updatedContribs,
			};

			await saveState(currentUpgrades, updatedContributions, currentMaintenance, activeAssignment);

			const nowComplete = isContributionComplete(nextUpgrade, updatedContribs);

			if (nowComplete) {
				return {
					content:
						`**Contributed to ${nextUpgrade.name}!**\n\n> ${nextUpgrade.flavorText}\n\n` +
						`**All resources in!** \`/islandupgrade complete type:${CATEGORY_TO_CHOICE[category]}\``,
					files: [image],
				};
			}

			const newRemaining = getRemainingCost(nextUpgrade, updatedContribs);
			return {
				content:
					`**Contributed to ${nextUpgrade.name}!**\n\n> ${nextUpgrade.flavorText}\n\n` +
					`**Still needed to complete:** ${truncateString(newRemaining.toString(), 400)}`,
				files: [image],
			};
		}

		if (options.complete) {
			const category    = resolveCategory(options.complete.type) as UpgradeCategory;
			const meta        = upgradeCategoryMeta[category];
			const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);

			if (!nextUpgrade) return `**${meta.label}** is already fully upgraded!`;

			const contribs = currentContributions[category] ?? {};

			if (!isContributionComplete(nextUpgrade, contribs)) {
				const remaining = getRemainingCost(nextUpgrade, contribs);
				return (
					`**${nextUpgrade.name}** is not yet fully funded.\n\n` +
					`**Still needed:** ${truncateString(remaining.toString(), 500)}\n\n` +
					`\`/islandupgrade contribute type:${CATEGORY_TO_CHOICE[category]}\``
				);
			}

			await interaction.confirmation(
				`**Complete ${nextUpgrade.name}?**\n\nAll resources contributed.\n\n**Bonus:** ${nextUpgrade.bonus}`
			);

			const newUpgrades: IslandUpgradeTiers             = { ...currentUpgrades,      [category]: nextUpgrade.tier };
			const newContributions: IslandUpgradeContributions = { ...currentContributions, [category]: {}              };

			await saveState(newUpgrades, newContributions, currentMaintenance, activeAssignment);

			const maintainNote = `Use \`/islandupgrade maintain type:${CATEGORY_TO_CHOICE[category]}\` to activate your bonus!`;
			const collectNote  = SKILL_CATEGORIES.includes(category as SkillCategory)
				? `\nOnce maintained, use \`/islandupgrade gather collect type:${CATEGORY_TO_CHOICE[category]}\` to collect accumulated materials.`
				: '';

			const bonusLine = (!_everEarned(user)) && !_userOwnsOrEquips(user)
				? await _checkAndGrant(user, newUpgrades)
				: '';

			return (
				`## ${nextUpgrade.name} Complete!\n\n` +
				`> ${nextUpgrade.flavorText}\n\n` +
				`**Bonus:** ${nextUpgrade.bonus}\n` +
				`**${meta.label}:** Tier ${nextUpgrade.tier}/${MAX_TIER}\n\n` +
				maintainNote + collectNote + bonusLine
			);
		}

		if (options.reset) {
			await interaction.confirmation(
				'**[DEBUG] Reset Island Upgrades?**\n\nResets ALL upgrades, contributions, maintenance, assignment, and collection timestamps. No refunds.'
			);

			await user.update({
				island_upgrades: {
					...defaultIslandUpgrades,
					[CONTRIB_KEY]: defaultIslandContributions,
					[MAINT_KEY]:   defaultMaintenanceTimestamps,
					[ASSIGN_KEY]:  null,
					[COLLECT_KEY]: defaultLastCollected,
				} as Prisma.JsonObject,
			});

			return '**[DEBUG]** All island upgrade state has been reset.';
		}

		return 'Invalid command usage.';
	},
});