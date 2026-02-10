import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import {
	calculateGlassblowingPlan,
	canUseStealingArtefactsTeleport,
	getGlassblowingProduct,
	getStealingArtefactsDeliveriesPerHour,
	type StealingArtefactsGlassblowData,
	type StealingArtefactsGlassblowingProductKey,
	stealingArtefactsGlassblowingProducts
} from '@/lib/minions/data/stealingArtefacts.js';
import type { StealingArtefactsActivityTaskOptions } from '@/lib/types/minions.js';

export async function stealingArtefactsCommand(
	user: MUser,
	channelId: string,
	options: {
		quantity?: number;
		stamina?: boolean;
		teleport?: boolean;
		glassblow_product?: string;
	}
) {
	if (await user.minionIsBusy()) return `${user.minionName} is busy.`;

	const thievingLevel = user.skillsAsLevels.thieving;
	if (thievingLevel < 49) {
		return 'You need at least level 49 Thieving to steal artefacts.';
	}

	const teleportOptionEnabled = options.teleport ?? true;
	const teleportEligible = canUseStealingArtefactsTeleport({
		teleportOptionEnabled,
		hasMemoirs: user.hasEquippedOrInBank("Kharedst's memoirs"),
		hasBook: user.hasEquippedOrInBank('Book of the dead'),
		questCompleted: true
	});

	const maxTripLength = await user.calcMaxTripLength('StealingArtefacts');
	const hasGraceful = user.hasGracefulEquipped();
	const stamina = options.stamina ?? false;

	const deliveriesPerHour = getStealingArtefactsDeliveriesPerHour({
		teleportEligible,
		hasGraceful,
		stamina
	});

	let duration = maxTripLength;
	if (options.quantity) {
		const requestedDeliveries = Math.max(1, options.quantity);
		duration = (requestedDeliveries / deliveriesPerHour) * Time.Hour;
		if (duration > maxTripLength) duration = maxTripLength;
	}

	// Glassblowing
	const glassblowProductInput = options.glassblow_product ?? 'none';
	const glassblowProduct =
		glassblowProductInput === 'none'
			? null
			: stealingArtefactsGlassblowingProducts.some(p => p.key === glassblowProductInput)
				? (glassblowProductInput as StealingArtefactsGlassblowingProductKey)
				: null;

	if (glassblowProductInput !== 'none' && !glassblowProduct) {
		return 'That is not a valid glassblowing product.';
	}

	let glassblow: StealingArtefactsGlassblowData | undefined;
	let glassblowNote = '';

	if (glassblowProduct) {
		const hours = duration / Time.Hour;

		const plan = calculateGlassblowingPlan({
			productKey: glassblowProduct,
			hours,
			availableMoltenGlass: user.bank.amount('Molten glass'),
			craftingLevel: user.skillsAsLevels.crafting
		});

		if (!plan.success) {
			return plan.error;
		}

		// Ensure trip matches the glassblowing-limited time window
		duration = plan.hours * Time.Hour;

		glassblow = {
			product: glassblowProduct,
			itemsMade: plan.itemsMade,
			moltenGlassUsed: plan.moltenGlassUsed
		};

		// Consume glass up-front (consistent with most OSB “uses supplies” commands)
		await user.removeItemsFromBank(new Bank().add('Molten glass', plan.moltenGlassUsed));

		const product = getGlassblowingProduct(glassblowProduct);
		const productName = product?.item.name ?? glassblowProduct.replaceAll('_', ' ');

		glassblowNote = ` You're also glassblowing ${plan.itemsMade}x ${productName}.`;
	}

	const deliveries = Math.floor(deliveriesPerHour * (duration / Time.Hour));

	await ActivityManager.startTrip<StealingArtefactsActivityTaskOptions>({
		userID: user.id,
		channelId,
		duration,
		type: 'StealingArtefacts',
		minigameID: 'stealing_artefacts',
		quantity: deliveries,
		stamina,
		teleportOptionEnabled,
		teleportEligible,
		glassblow
	});

	const boosts = [
		hasGraceful ? 'Graceful equipped (no penalty)' : 'No graceful equipped (-30%)',
		stamina ? 'Stamina potions selected (no penalty)' : 'No stamina potions (-30%)',
		teleportEligible ? 'Teleport efficiency active' : null
	].filter(Boolean);

	return `${user.minionName} is now stealing artefacts for ${formatDuration(duration)} (${deliveries} deliveries expected).${glassblowNote}${
		boosts.length > 0 ? `\nBoosts: ${boosts.join(', ')}.` : ''
	}`;
}
