import type { ResearchTaskOptions } from '@/lib/bso/bsoTypes.js';
import type { MaterialType } from '@/lib/bso/skills/invention/index.js';
import { type Invention, Inventions, transactMaterialsFromUser } from '@/lib/bso/skills/invention/inventions.js';
import { isValidMaterialType } from '@/lib/bso/skills/invention/inventionUtil.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { clamp } from 'remeda';

export function inventionsCanUnlockFromResearch(user: MUser, researchedMaterial: MaterialType): Invention[] {
	const inventionLevel = user.skillsAsLevels.invention;
	return Inventions.filter(i => {
		if (!i.materialTypeBank.has(researchedMaterial)) return false;
		if (user.user.unlocked_blueprints.includes(i.id)) return false;
		if (i.inventionLevelNeeded > inventionLevel) return false;
		return true;
	});
}

export async function researchCommand({
	user,
	material,
	inputQuantity,
	channelID,
	interaction
}: {
	user: MUser;
	material: string;
	inputQuantity: number | undefined;
	channelID: string;
	interaction?: MInteraction;
}): CommandResponse {
	if (user.minionIsBusy) return 'Your minion is busy.';
	material = material.toLowerCase() as MaterialType;
	if (!isValidMaterialType(material)) {
		return "That's not a valid material.";
	}
	const maxTripLength = user.calcMaxTripLength('Research');
	const timePerResearchPerMaterial = Time.Second * 3.59;
	const maxQuantity = Math.floor(maxTripLength / timePerResearchPerMaterial);
	let quantity = inputQuantity ?? maxQuantity;
	const ownedBank = user.materialsOwned();

	if (ownedBank.amount(material) === 0) {
		return "You don't own any of that material! Go disassemble some items to receive some of this material.";
	}
	quantity = clamp(quantity, { min: 1, max: Math.min(maxQuantity, ownedBank.amount(material)) });
	const duration = quantity * timePerResearchPerMaterial;

	const cost = new MaterialBank().add(material, quantity);
	if (!ownedBank.has(cost)) {
		const missing = cost.clone().remove(ownedBank);
		return `You don't have enough materials to do this trip. You are missing: ${missing}.`;
	}

	const inventionsCanUnlockFromThis = inventionsCanUnlockFromResearch(user, material);
	if (inventionsCanUnlockFromThis.length === 0 && interaction) {
		await interaction.confirmation(
			`You're trying to research a material that won't have a chance of unlocking any blueprints, because none are available or you don't have the required level. Are you sure you want to still research with '${material}'?`
		);
	}

	await transactMaterialsFromUser({
		user,
		remove: cost,
		addToResearchedMaterialsBank: true
	});

	await ActivityManager.startTrip<ResearchTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'Research',
		material,
		quantity
	});

	return `${user.minionName} is now researching with ${cost}. The trip will take ${formatDuration(duration)}.`;
}
