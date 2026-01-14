import {
	upgradeDefinitions,
	getNextUpgradeForCategory,
	getTier,
	type IslandUpgradeTiers,
	defaultIslandUpgrades,
	type UpgradeCategory
} from '@/lib/bso/commands/islandUpgrades.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import type { Bank } from 'oldschooljs';
import { Prisma } from '@/prisma/main.js';
import { truncateString } from '@oldschoolgg/toolkit';

export const islandUpgradeCommand = defineCommand({
	name: 'islandupgrade',
	description: 'Upgrade your island facilities',
	attributes: {
		requiresMinion: false
	},
	options: [
		{
			type: 'Subcommand',
			name: 'buy',
			description: 'Purchase an island upgrade',
			options: [
				{
					type: 'String',
					name: 'type',
					description: 'Which upgrade to purchase',
					required: true,
					choices: [
						{ name: 'Boss Efficiency', value: 'boss' },
						{ name: 'Megaboss Access', value: 'megaboss' },
						{ name: 'Minigame Boost', value: 'minigame' },
						{ name: 'Gathering Speed', value: 'gathering' },
						{ name: 'Prismare Enhancement', value: 'prismare' }
					]
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View your current island upgrades'
		},
		{
			type: 'Subcommand',
			name: 'reset',
			description: '[DEBUG] Reset all island upgrades to tier 0'
		}
	],
	run: async ({ options, user, interaction }) => {
		// Read current upgrades or fallback to default
		const currentUpgrades: IslandUpgradeTiers = (user.user.island_upgrades as IslandUpgradeTiers) ?? defaultIslandUpgrades;

		if (options.view) {
			let str = '**Your Island Upgrades:**\n\n';
			for (const category of Object.keys(upgradeDefinitions) as UpgradeCategory[]) {
				const currentTier = getTier(currentUpgrades, category);
				const maxTier = upgradeDefinitions[category].length;
				const label =
					upgradeDefinitions[category][0]?.name
						.split(' ')
						.slice(0, -1)
						.join(' ') || category;

				str += `**${label}:** Tier ${currentTier}/${maxTier}`;

				if (currentTier > 0) {
					const tierDef = upgradeDefinitions[category][currentTier - 1];
					if (tierDef) str += ` - ${tierDef.bonus}`;
				}

				str += '\n';
			}

			return str;
		}

		if (options.reset) {
			await interaction.confirmation(
				'**[DEBUG] Reset Island Upgrades?**\n\nThis will reset ALL island upgrades to tier 0. Items will NOT be refunded. Are you sure?'
			);

			await user.update({
				island_upgrades: defaultIslandUpgrades as Prisma.JsonObject
			});

			return '**[DEBUG]** All island upgrades have been reset to tier 0.';
		}

		if (options.buy) {
			const category = options.buy.type as UpgradeCategory;
			const nextUpgrade = getNextUpgradeForCategory(currentUpgrades, category);

			if (!nextUpgrade) {
				return `You have already purchased the maximum tier for ${category} upgrades!`;
			}

			const cost = nextUpgrade.cost as Bank;

			if (!user.owns(cost)) {
				return `You don't have the required items to purchase **${nextUpgrade.name}**.\n\nRequired: ${cost}`;
			}

			const image = await makeBankImage({
				bank: cost,
				title: `Cost for ${nextUpgrade.name}`,
				user
			});

			// Use the confirmation pattern from the sacrifice command
			await interaction.confirmation(
				`**Purchase ${nextUpgrade.name}?**\n\n` +
				`${nextUpgrade.description}\n` +
				`**Bonus:** ${nextUpgrade.bonus}\n\n` +
				`This will cost you: ${truncateString(cost.toString(), 500)}`,
			);

			// Re-check ownership in case they spent items while confirming
			if (!user.owns(cost)) {
				return `You no longer have the required items to purchase **${nextUpgrade.name}**.`;
			}

			await user.removeItemsFromBank(cost);

			const newUpgrades: IslandUpgradeTiers = {
				...currentUpgrades,
				[category]: nextUpgrade.tier
			};

			// Save to DB as JSON
			await user.update({
				island_upgrades: newUpgrades as Prisma.JsonObject
			});

			const categoryLabel = upgradeDefinitions[category][0]?.name.split(' ').slice(0, -1).join(' ') || category;

			return {
				content:
					`Successfully purchased **${nextUpgrade.name}**!\n\n` +
					`${nextUpgrade.description}\n` +
					`**Bonus:** ${nextUpgrade.bonus}\n\n` +
					`**Your ${categoryLabel}:** Tier ${nextUpgrade.tier}/${upgradeDefinitions[category].length}`,
				files: [image]
			};
		}

		return 'Invalid command usage.';
	}
});