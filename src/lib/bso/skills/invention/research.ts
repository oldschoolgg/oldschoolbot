import { type MaterialType, materialTypes } from '@/lib/bso/skills/invention/index.js';
import { type Invention, Inventions, transactMaterialsFromUser } from '@/lib/bso/skills/invention/inventions.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { bold, userMention } from '@discordjs/builders';
import { roll, shuffleArr } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import type { ChatInputCommandInteraction } from 'discord.js';
import { clamp } from 'remeda';

import type { ResearchTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { handleMahojiConfirmation } from '@/lib/util/handleMahojiConfirmation.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

function inventionsCanUnlockFromResearch(user: MUser, researchedMaterial: MaterialType): Invention[] {
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
	material: MaterialType;
	inputQuantity: number | undefined;
	channelID: string;
	interaction?: ChatInputCommandInteraction;
}): CommandResponse {
	if (user.minionIsBusy) return 'Your minion is busy.';
	material = material.toLowerCase() as MaterialType;
	if (!materialTypes.includes(material)) {
		return "That's not a valid material.";
	}
	const maxTripLength = calcMaxTripLength(user, 'Research');
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
		await handleMahojiConfirmation(
			interaction,
			`You're trying to research a material that won't have a chance of unlocking any blueprints, because none are available or you don't have the required level. Are you sure you want to still research with '${material}'?`
		);
	}

	await transactMaterialsFromUser({
		user,
		remove: cost,
		addToResearchedMaterialsBank: true
	});

	await addSubTaskToActivityTask<ResearchTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'Research',
		material,
		quantity
	});

	return `${user.minionName} is now researching with ${cost}. The trip will take ${formatDuration(duration)}.`;
}

export async function researchTask(data: ResearchTaskOptions) {
	const { userID, material, quantity } = data;
	const user = await mUserFetch(userID);

	const inventionToTryUnlock: Invention | null =
		shuffleArr(inventionsCanUnlockFromResearch(user, data.material))[0] ?? null;
	let unlockedBlueprint: Invention | null = null;

	for (let i = 0; i < quantity; i++) {
		if (!roll(1000)) continue;
		unlockedBlueprint = inventionToTryUnlock;
	}

	let discoveredStr =
		unlockedBlueprint === null
			? "You didn't discover or find anything."
			: `You found the blueprint for the '${unlockedBlueprint.name}'!`;
	if (unlockedBlueprint) {
		if (user.user.unlocked_blueprints.includes(unlockedBlueprint.id)) {
			discoveredStr = `You found a ${unlockedBlueprint.name} blueprint, but you already know how to make it!`;
		} else {
			await user.update({
				unlocked_blueprints: {
					push: unlockedBlueprint.id
				}
			});
		}
		discoveredStr = bold(discoveredStr);
	}

	const xpStr = await user.addXP({
		skillName: 'invention',
		amount: quantity * 56.39,
		duration: data.duration,
		multiplier: false,
		masterCapeBoost: true
	});
	const str = `${userMention(data.userID)}, ${user.minionName} finished researching with ${quantity}x ${material} materials.
${discoveredStr}
${xpStr}`;

	handleTripFinish(user, data.channelID, str, undefined, data, null);
}
