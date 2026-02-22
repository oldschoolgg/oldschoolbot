import {
	upgradeDefinitions,
	upgradeCategoryMeta,
	getNextUpgradeForCategory,
	getTier,
	isContributionComplete,
	getRemainingCost,
	type IslandUpgradeTiers,
	type IslandUpgradeContributions,
	defaultIslandUpgrades,
	defaultIslandContributions,
	type UpgradeCategory
} from '@/lib/bso/commands/islandUpgrades.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { Bank } from 'oldschooljs';
import { Prisma } from '@/prisma/main.js';
import { truncateString } from '@oldschoolgg/toolkit';

const MAX_TIER = 5;
const CONTRIB_KEY = 'contributions';
const COINS_ID = 995;

type IslandUpgradesJson = IslandUpgradeTiers & { contributions?: IslandUpgradeContributions };

function readState(user: { user: { island_upgrades: unknown } }): {
	upgrades: IslandUpgradeTiers;
	contributions: IslandUpgradeContributions;
} {
	const raw = (user.user.island_upgrades ?? {}) as IslandUpgradesJson;
	const { contributions, ...tiers } = raw;
	return {
		upgrades: { ...defaultIslandUpgrades, ...tiers },
		contributions: { ...defaultIslandContributions, ...(contributions ?? {}) }
	};
}

function userHasAmount(user: MUser, itemId: number): number {
	return itemId === COINS_ID ? Number(user.user.GP) : user.bank.amount(itemId);
}

function userOwnsBank(user: MUser, bank: Bank): boolean {
	for (const [item, quantity] of bank.items()) {
		if (userHasAmount(user, item.id) < quantity) return false;
	}
	return true;
}

export const islandUpgradeCommand = defineCommand({
	name: 'islandupgrade',
	description: 'Upgrade your island camp facilities',
	attributes: {
		requiresMinion: false
	},
	options: [
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View your current island upgrades and contribution progress',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'View a specific upgrade category',
					required: false,
					choices: [
						{ name: 'Warcamp Fortifications', value: 'boss' },
						{ name: 'Archon Sanctum', value: 'megaboss' },
						{ name: 'Settlement Infrastructure', value: 'minigame' },
						{ name: 'Expedition Outfitters', value: 'gathering' },
						{ name: 'Astral Observatory', value: 'prismare' }
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'contribute',
			description: 'Commit resources toward the next tier of an upgrade (no refunds)',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'Which upgrade to contribute toward',
					required: true,
					choices: [
						{ name: 'Warcamp Fortifications', value: 'boss' },
						{ name: 'Archon Sanctum', value: 'megaboss' },
						{ name: 'Settlement Infrastructure', value: 'minigame' },
						{ name: 'Expedition Outfitters', value: 'gathering' },
						{ name: 'Astral Observatory', value: 'prismare' }
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'complete',
			description: 'Claim a completed upgrade tier once all resources have been contributed',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'Which upgrade to complete',
					required: true,
					choices: [
						{ name: 'Warcamp Fortifications', value: 'boss' },
						{ name: 'Archon Sanctum', value: 'megaboss' },
						{ name: 'Settlement Infrastructure', value: 'minigame' },
						{ name: 'Expedition Outfitters', value: 'gathering' },
						{ name: 'Astral Observatory', value: 'prismare' }
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'reset',
			description: '[DEBUG] Reset all island upgrades and contributions to tier 0'
		}
	],
	run: async ({ options, user, interaction }) => {
		const { upgrades: currentUpgrades, contributions: currentContributions } = readState(user);

		if (options.view) {
			const filterCategory = options.view.type as UpgradeCategory | undefined;
			const categories = filterCategory
				? [filterCategory]
				: (Object.keys(upgradeDefinitions) as UpgradeCategory[]);

			let str = filterCategory ? '' : '## Island Camp Upgrades\n\n';

			for (const category of categories) {
				const meta = upgradeCategoryMeta[category];
				const currentTier = getTier(currentUpgrades, category);
				const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);
				const contributions = currentContributions[category] ?? {};

				str += `### ${meta.label}\n`;
				str += `> *${meta.flavorIntro}*\n\n`;
				str += `**Tier:** ${currentTier}/${MAX_TIER}`;

				if (currentTier > 0) {
					const tierDef = upgradeDefinitions[category][currentTier - 1];
					if (tierDef) str += ` — ${tierDef.bonus}`;
				}

				str += '\n';

				if (nextUpgrade) {
					str += `**Next:** ${nextUpgrade.name} *(${nextUpgrade.bonus})*\n`;

					if (isContributionComplete(nextUpgrade, contributions)) {
						str += `Ready to complete! Use \`/islandupgrade complete type:${category}\`\n`;
					} else {
						const remaining = getRemainingCost(nextUpgrade, contributions);
						str += `**Still needed:** ${truncateString(remaining.toString(), 300)}\n`;
					}
				} else {
					str += '**Fully upgraded!**\n';
				}

				if (categories.length > 1) str += '\n';
			}

			return str;
		}

		if (options.reset) {
			await interaction.confirmation(
				'**[DEBUG] Reset Island Upgrades?**\n\nThis will reset ALL island upgrades AND contribution progress to zero. Items will NOT be refunded. Are you sure?'
			);

			await user.update({
				island_upgrades: {
					...defaultIslandUpgrades,
					[CONTRIB_KEY]: defaultIslandContributions
				} as Prisma.JsonObject
			});

			return '**[DEBUG]** All island upgrades and contribution progress have been reset to zero.';
		}

		if (options.contribute) {
			const category = options.contribute.type as UpgradeCategory;
			const meta = upgradeCategoryMeta[category];
			const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);

			if (!nextUpgrade) {
				return `**${meta.label}** is already fully upgraded — there's nothing left to contribute toward!`;
			}

			const contributions = currentContributions[category] ?? {};

			if (isContributionComplete(nextUpgrade, contributions)) {
				return `All resources for **${nextUpgrade.name}** have already been contributed! Use \`/islandupgrade complete type:${category}\` to claim your upgrade.`;
			}

			const remaining = getRemainingCost(nextUpgrade, contributions);

			const toContribute = new Bank();
			for (const [item, quantity] of remaining.items()) {
				const userHas = userHasAmount(user, item.id);
				if (userHas > 0) {
					toContribute.add(item.id, Math.min(userHas, quantity));
				}
			}

			if (toContribute.length === 0) {
				return `You don't have any of the remaining items needed for **${nextUpgrade.name}**.\n\n**Still needed:** ${truncateString(remaining.toString(), 500)}`;
			}

			const image = await makeBankImage({
				bank: toContribute,
				title: `Contributing to ${nextUpgrade.name}`,
				user
			});

			await interaction.confirmation(
				`**Contribute to ${nextUpgrade.name}?**\n\n` +
				`*"${nextUpgrade.flavorText}"*\n\n` +
				`You are about to contribute the following items toward **${meta.locationName}**:\n` +
				`${truncateString(toContribute.toString(), 500)}\n\n` +
				`**Contributed items cannot be refunded.**`
			);

			if (!userOwnsBank(user, toContribute)) {
				return `You no longer have the required items to contribute to **${nextUpgrade.name}**.`;
			}

			await user.removeItemsFromBank(toContribute);

			const updatedCatContribs = { ...(currentContributions[category] ?? {}) };
			for (const [item, quantity] of toContribute.items()) {
				const key = item.id.toString();
				updatedCatContribs[key] = (updatedCatContribs[key] ?? 0) + quantity;
			}

			const updatedContributions: IslandUpgradeContributions = {
				...currentContributions,
				[category]: updatedCatContribs
			};

			await user.update({
				island_upgrades: {
					...currentUpgrades,
					[CONTRIB_KEY]: updatedContributions
				} as Prisma.JsonObject
			});

			const isNowComplete = isContributionComplete(nextUpgrade, updatedCatContribs);

			if (isNowComplete) {
				return {
					content:
						`**Contributed to ${nextUpgrade.name}!**\n\n` +
						`*"${nextUpgrade.flavorText}"*\n\n` +
						`**All resources contributed!** Use \`/islandupgrade complete type:${category}\` to claim your upgrade.`,
					files: [image]
				};
			}

			const newRemaining = getRemainingCost(nextUpgrade, updatedCatContribs);
			return {
				content:
					`**Contributed to ${nextUpgrade.name}!**\n\n` +
					`*"${nextUpgrade.flavorText}"*\n\n` +
					`**Still needed:** ${truncateString(newRemaining.toString(), 400)}`,
				files: [image]
			};
		}

		if (options.complete) {
			const category = options.complete.type as UpgradeCategory;
			const meta = upgradeCategoryMeta[category];
			const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);

			if (!nextUpgrade) {
				return `**${meta.label}** is already fully upgraded!`;
			}

			const contributions = currentContributions[category] ?? {};

			if (!isContributionComplete(nextUpgrade, contributions)) {
				const remaining = getRemainingCost(nextUpgrade, contributions);
				return (
					`**${nextUpgrade.name}** is not yet fully funded.\n\n` +
					`**Still needed:** ${truncateString(remaining.toString(), 500)}\n\n` +
					`Use \`/islandupgrade contribute type:${category}\` to keep building.`
				);
			}

			await interaction.confirmation(
				`**Complete ${nextUpgrade.name}?**\n\n` +
				`All resources have been contributed. Confirm to claim this upgrade.\n\n` +
				`**Bonus:** ${nextUpgrade.bonus}`
			);

			const newUpgrades: IslandUpgradeTiers = {
				...currentUpgrades,
				[category]: nextUpgrade.tier
			};

			const updatedContributions: IslandUpgradeContributions = {
				...currentContributions,
				[category]: {}
			};

			await user.update({
				island_upgrades: {
					...newUpgrades,
					[CONTRIB_KEY]: updatedContributions
				} as Prisma.JsonObject
			});

			return (
				`## ${nextUpgrade.name} Complete!\n\n` +
				`*"${nextUpgrade.flavorText}"*\n\n` +
				`**Bonus:** ${nextUpgrade.bonus}\n` +
				`**${meta.label}:** Tier ${nextUpgrade.tier}/${MAX_TIER}`
			);
		}

		return 'Invalid command usage.';
	}
});