import { SailingFacilities, SailingFacilitiesById } from '@/lib/skilling/skills/sailing/facilities.js';
import { SailingRegionById } from '@/lib/skilling/skills/sailing/regions.js';
import {
	getInstalledFacilities,
	getOrCreateUserShip,
	getShipBonusesFromSnapshot,
	getShipCharts,
	getShipPartTier,
	getShipReputation,
	getUnlockedRegions,
	snapshotShip,
	updateUpgradesBank
} from '@/lib/skilling/skills/sailing/ship.js';
import {
	getShipUpgradeCost,
	MAX_SHIP_TIER,
	SHIP_PARTS,
	type ShipPart
} from '@/lib/skilling/skills/sailing/upgrades.js';

const prettyPartName: Record<ShipPart, string> = {
	hull: 'Hull',
	sails: 'Sails',
	crew: 'Crew',
	navigation: 'Navigation',
	cargo: 'Cargo'
};

export const shipCommand = defineCommand({
	name: 'ship',
	description: 'Manage your Sailing ship.',
	options: [
		{
			type: 'Subcommand',
			name: 'status',
			description: 'Show your ship status.'
		},
		{
			type: 'Subcommand',
			name: 'install',
			description: 'Install a ship facility.',
			options: [
				{
					type: 'String',
					name: 'facility',
					description: 'The facility to install.',
					required: true,
					choices: SailingFacilities.map(f => ({ name: f.name, value: f.id }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'upgrade',
			description: 'Upgrade a ship part.',
			options: [
				{
					type: 'String',
					name: 'part',
					description: 'The part to upgrade.',
					required: true,
					choices: SHIP_PARTS.map(part => ({ name: prettyPartName[part], value: part }))
				},
				{
					type: 'Integer',
					name: 'tiers',
					description: 'How many tiers to upgrade (default 1).',
					required: false,
					min_value: 1,
					max_value: MAX_SHIP_TIER
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'rename',
			description: 'Rename your ship.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The new ship name.',
					required: true
				}
			]
		}
	],
	run: async ({ options, user }) => {
		const ship = await getOrCreateUserShip(user.id);

		if (options.status) {
			const snapshot = snapshotShip(ship);
			const bonuses = getShipBonusesFromSnapshot(snapshot);
			const name = ship.ship_name ?? 'Unnamed ship';
			const facilities = getInstalledFacilities(ship).map(f => SailingFacilitiesById.get(f)?.name ?? f);
			const unlockedRegions = getUnlockedRegions(ship).map(r => SailingRegionById.get(r)?.name ?? r);
			const rep = getShipReputation(ship);
			const charts = getShipCharts(ship);

			return `**${name}**\nHull: ${ship.hull_tier}/${MAX_SHIP_TIER}\nSails: ${ship.sails_tier}/${MAX_SHIP_TIER}\nCrew: ${ship.crew_tier}/${MAX_SHIP_TIER}\nNavigation: ${ship.navigation_tier}/${MAX_SHIP_TIER}\nCargo: ${ship.cargo_tier}/${MAX_SHIP_TIER}\n\nReputation: ${rep}\nCharts: ${charts}\nRegions: ${unlockedRegions.length === 0 ? 'None' : unlockedRegions.join(', ')}\nFacilities: ${facilities.length === 0 ? 'None' : facilities.join(', ')}\n\nBonuses:\nSpeed: ${Math.round((1 - bonuses.speedMultiplier) * 100)}%\nSuccess: ${Math.round(bonuses.successBonus * 100)}%\nLoot: ${Math.round(bonuses.lootBonus * 100)}%`;
		}

		if (options.install) {
			const facility = SailingFacilitiesById.get(options.install.facility);
			if (!facility) return 'Unknown facility.';
			if (user.skillsAsLevels.sailing < facility.level) {
				return `${user.minionName} needs ${facility.level} Sailing to install ${facility.name}.`;
			}

			const installed = getInstalledFacilities(ship);
			if (installed.includes(facility.id)) {
				return `${facility.name} is already installed.`;
			}

			if (!user.owns(facility.cost)) {
				return `You don't have the required items to install ${facility.name}.\nYou need: ${facility.cost}.`;
			}

			await user.transactItems({
				itemsToRemove: facility.cost
			});

			await updateUpgradesBank(user.id, {
				facilities: [...installed, facility.id]
			});

			return `Installed ${facility.name}.`;
		}

		if (options.rename) {
			const newName = options.rename.name.trim();
			if (newName.length < 2 || newName.length > 32) {
				return 'Ship name must be between 2 and 32 characters.';
			}
			await prisma.userShip.update({
				where: { user_id: user.id },
				data: { ship_name: newName }
			});
			return `Your ship has been renamed to **${newName}**.`;
		}

		if (options.upgrade) {
			const part = options.upgrade.part as ShipPart;
			const currentTier = getShipPartTier(ship, part);
			const tiersRequested = options.upgrade.tiers ?? 1;
			const targetTier = Math.min(MAX_SHIP_TIER, currentTier + tiersRequested);

			if (currentTier >= MAX_SHIP_TIER) {
				return `${prettyPartName[part]} is already at max tier.`;
			}
			if (targetTier === currentTier) {
				return 'Invalid tier selection.';
			}

			const cost = getShipUpgradeCost(part, currentTier, targetTier);

			if (!user.owns(cost)) {
				return `You don't have the required items to upgrade ${prettyPartName[part]} to tier ${targetTier}.\nYou need: ${cost}.`;
			}

			await user.transactItems({
				itemsToRemove: cost
			});

			const updateData: Record<string, number> = {};
			updateData[`${part}_tier`] = targetTier;

			await prisma.userShip.update({
				where: { user_id: user.id },
				data: updateData
			});

			return `Upgraded ${prettyPartName[part]} to tier ${targetTier}. Cost: ${cost}.`;
		}

		return 'Invalid command.';
	}
});
