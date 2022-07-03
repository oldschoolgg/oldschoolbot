import { bold, userMention } from '@discordjs/builders';
import { User } from '@prisma/client';
import { shuffleArr, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';

import {
	getSkillsOfMahojiUser,
	handleMahojiConfirmation,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch
} from '../../mahoji/mahojiSettings';
import { SkillsEnum } from '../skilling/types';
import { ActivityTaskOptions } from '../types/minions';
import { clamp, formatDuration, roll } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import { handleTripFinish } from '../util/handleTripFinish';
import { minionIsBusy } from '../util/minionIsBusy';
import { minionName } from '../util/minionUtils';
import { IMaterialBank, MaterialType, materialTypes } from '.';
import { Invention, Inventions, transactMaterialsFromUser } from './inventions';
import { MaterialBank } from './MaterialBank';

function inventionsCanUnlockFromResearch(user: User, researchedMaterial: MaterialType): Invention[] {
	const inventionLevel = getSkillsOfMahojiUser(user, true).invention;
	return Inventions.filter(i => {
		if (!i.materialTypeBank.has(researchedMaterial)) return false;
		if (user.unlocked_blueprints.includes(i.id)) return false;
		if (i.inventionLevelNeeded > inventionLevel) return false;
		return true;
	});
}

export interface ResearchTaskOptions extends ActivityTaskOptions {
	material: MaterialType;
	quantity: number;
}

export async function researchCommand({
	user,
	material,
	inputQuantity,
	channelID,
	interaction
}: {
	user: User;
	material: MaterialType;
	inputQuantity: number | undefined;
	channelID: bigint;
	interaction?: SlashCommandInteraction;
}): CommandResponse {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	material = material.toLowerCase() as MaterialType;
	if (!materialTypes.includes(material)) {
		return "That's not a valid material.";
	}
	const maxTripLength = calcMaxTripLength(user);
	let timePerResearchPerMaterial = Time.Second * 3.59;
	const maxQuantity = Math.floor(maxTripLength / timePerResearchPerMaterial);
	let quantity = inputQuantity ?? maxQuantity;
	const ownedBank = new MaterialBank(user.materials_owned as IMaterialBank);

	if (ownedBank.amount(material) === 0) {
		return "You don't own any of that material! Go disassemble some items to receive some of this material.";
	}
	quantity = clamp(quantity, 1, Math.min(maxQuantity, ownedBank.amount(material)));
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
		userID: BigInt(user.id),
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

	return `${userMention(user.id)}, ${minionName(
		user
	)} is now researching with ${cost}. The trip will take ${formatDuration(duration)}.`;
}

export async function researchTask(data: ResearchTaskOptions) {
	const { userID, material, quantity } = data;
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);

	const inventionToTryUnlock: Invention | null =
		shuffleArr(inventionsCanUnlockFromResearch(mahojiUser, data.material))[0] ?? null;
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
		if (mahojiUser.unlocked_blueprints.includes(unlockedBlueprint.id)) {
			discoveredStr = `You found a ${unlockedBlueprint.name} blueprint, but you already know how to make it!`;
		} else {
			await mahojiUserSettingsUpdate(userID, {
				unlocked_blueprints: {
					push: unlockedBlueprint.id
				}
			});
		}
		discoveredStr = bold(discoveredStr);
	}

	const xpStr = await klasaUser.addXP({
		skillName: SkillsEnum.Invention,
		amount: quantity * 56.39,
		duration: data.duration,
		multiplier: false,
		masterCapeBoost: true
	});
	let str = `${userMention(data.userID)}, ${minionName(
		mahojiUser
	)} finished researching with ${quantity}x ${material} materials.
${discoveredStr}
${xpStr}`;

	handleTripFinish(
		klasaUser,
		data.channelID,
		str,
		[
			'invention',
			{
				research: {
					material,
					quantity
				}
			},
			true
		],
		undefined,
		data,
		null
	);
}
