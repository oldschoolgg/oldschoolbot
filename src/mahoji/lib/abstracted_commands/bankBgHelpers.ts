import { Bank, resolveItems, toKMB } from 'oldschooljs';

import { BitFieldData, PerkTier } from '@/lib/constants.js';
import type { BankBackground } from '@/lib/minions/data/bankBackgrounds.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

const petRequirementItems = resolveItems(['Rocky', 'Bloodhound', 'Giant squirrel', 'Baby chinchompa']);

export interface BankBgEligibilityFailure {
	response: string;
	ui: string;
}

export interface BankBgEligibilityResult {
	canUse: boolean;
	failure: BankBgEligibilityFailure | null;
}

interface EligibilityOptions {
	user: MUser;
	background: BankBackground;
	perkTier?: PerkTier | 0;
}

export async function getBankBackgroundEligibility({
	user,
	background,
	perkTier
}: EligibilityOptions): Promise<BankBgEligibilityResult> {
	const resolvedPerkTier = perkTier ?? (await user.fetchPerkTier());
	const hasStoreUnlock = background.storeBitField
		? user.user.store_bitfield.includes(background.storeBitField)
		: false;

	if (user.isModOrAdmin() || hasStoreUnlock) {
		return { canUse: true, failure: null };
	}

	if (background.sacValueRequired) {
		const sacrificedValue = Number(user.user.sacrificedValue);
		if (sacrificedValue < background.sacValueRequired) {
			const needed = toKMB(background.sacValueRequired);
			return {
				canUse: false,
				failure: {
					response: `You have to have sacrificed at least ${needed} GP worth of items to use this background.`,
					ui: `Requires ${needed} GP sacrificed (You: ${toKMB(sacrificedValue)})`
				}
			};
		}
	}

	if (background.skillsNeeded && !user.hasSkillReqs(background.skillsNeeded)) {
		const requirementText = formatSkillRequirements(background.skillsNeeded);
		return {
			canUse: false,
			failure: {
				response: `You don't meet the skill requirements to use this background, you need: ${requirementText}.`,
				ui: `Missing skills: ${requirementText}`
			}
		};
	}

	if (!background.available) {
		return {
			canUse: false,
			failure: {
				response: 'This image is not currently available.',
				ui: 'Currently unavailable.'
			}
		};
	}

	if (background.bitfield && !user.bitfield.includes(background.bitfield)) {
		const bitfieldName = BitFieldData[background.bitfield]?.name ?? 'a special unlock';
		return {
			canUse: false,
			failure: {
				response: "You're not eligible to use this bank background.",
				ui: `Requires ${bitfieldName}.`
			}
		};
	}

	if (background.collectionLogItemsNeeded && !user.cl.has(background.collectionLogItemsNeeded)) {
		return {
			canUse: false,
			failure: {
				response: `You're not worthy to use this background. You need these items in your Collection Log: ${new Bank(
					background.collectionLogItemsNeeded
				)}.`,
				ui: 'Requires additional collection log items.'
			}
		};
	}

	if (background.perkTierNeeded && resolvedPerkTier < background.perkTierNeeded) {
		const tierLabel = Number(background.perkTierNeeded) - 1;
		return {
			canUse: false,
			failure: {
				response: `This background is only available for Tier ${tierLabel} patrons.`,
				ui: `Requires Tier ${tierLabel} patron.`
			}
		};
	}

	if (background.name === 'Pets') {
		const hasRequiredPet = petRequirementItems.some(id => user.cl.has(id));
		if (!hasRequiredPet) {
			return {
				canUse: false,
				failure: {
					response:
						'You need to have one of these pets to purchase the Pets background: Rocky, Bloodhound, Giant squirrel, Baby chinchompa.',
					ui: 'Requires Rocky, Bloodhound, Giant squirrel or Baby chinchompa.'
				}
			};
		}
	}

	return { canUse: true, failure: null };
}
