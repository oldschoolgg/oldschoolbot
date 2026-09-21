import { type ButtonBuilder, dateFm } from '@oldschoolgg/discord';
import { Emoji, stringMatches } from '@oldschoolgg/toolkit';

import { AutoFarmFilterEnum } from '@/prisma/main/enums.js';
import { BitField } from '@/lib/constants.js';
import { allFarm, replant } from '@/lib/minions/functions/autoFarmFilters.js';
import {
	getPlantsForPatch,
	parsePreferredSeeds,
	resolveSeedForPatch
} from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { IPatchData, IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '@/lib/skilling/types.js';
import { makeAutoFarmButton } from '@/lib/util/interactions.js';
import { formatList } from '@/lib/util/smallUtils.js';
import { type FarmingPatchName, farmingPatchNames } from './farming.shared.js';

export { type FarmingPatchName, farmingPatchNames } from './farming.shared.js';

export function isPatchName(name: string): name is FarmingPatchName {
	return farmingPatchNames.includes(name as FarmingPatchName);
}

export type FarmingPatchSettingsKey = `farmingPatches_${FarmingPatchName}`;

export function getFarmingKeyFromName(name: FarmingPatchName): FarmingPatchSettingsKey {
	return `farmingPatches_${name}`;
}

export function findPlant(lastPlanted: IPatchData['lastPlanted']) {
	if (!lastPlanted) return null;
	const plant = Farming.Plants.find(
		plants => stringMatches(plants.name, lastPlanted) || plants.aliases.some(a => stringMatches(a, lastPlanted))
	);
	if (!plant) return null;
	return plant;
}

export function hasAnyReadyPatch(patches?: IPatchDataDetailed[] | null): boolean {
	return (patches ?? []).some(p => p.ready === true);
}

function getFallbackPlantForPatch(
	user: MUser,
	patch: IPatchDataDetailed,
	patchesDetailed: IPatchDataDetailed[]
): Plant | null {
	if (patch.ready === false) {
		return null;
	}
	const farmingLevel = user.skillsAsLevels.farming;
	const autoFarmFilter = user.autoFarmFilter ?? AutoFarmFilterEnum.AllFarm;
	return (
		getPlantsForPatch(patch.patchName).find(plant =>
			autoFarmFilter === AutoFarmFilterEnum.Replant
				? replant(plant, farmingLevel, user, user.bank, patchesDetailed)
				: allFarm(plant, farmingLevel, user, user.bank)
		) ?? null
	);
}

/**
 * Mirrors the per-patch decisions made by planAutoFarmTrip (filter, preferred seeds, contract preference),
 * so the button is only offered when auto farm would actually plan something.
 */
function canAutoFarmAnyPatch(user: MUser, patchesDetailed: IPatchDataDetailed[]): boolean {
	const farmingLevel = user.skillsAsLevels.farming;
	const preferences = parsePreferredSeeds(user.user.minion_farmingPreferredSeeds);
	const preferContract = Boolean(user.user.minion_farmingPreferredContract);
	const contract = user.fetchFarmingContract();
	const hasActiveContract = Boolean(contract.hasContract);
	const contractPlant =
		hasActiveContract && contract.plantToGrow
			? (Farming.Plants.find(plant => plant.name === contract.plantToGrow) ?? null)
			: null;

	for (const patch of patchesDetailed) {
		const resolved = resolveSeedForPatch({
			patch,
			preferContract,
			hasActiveContract,
			contractPlant,
			preferences,
			fallbackPlant: getFallbackPlantForPatch(user, patch, patchesDetailed)
		});
		if (!resolved) {
			continue;
		}

		const candidates = resolved.type === 'highest' ? getPlantsForPatch(patch.patchName) : [resolved.plant];
		if (candidates.some(plant => allFarm(plant, farmingLevel, user, user.bank))) {
			return true;
		}
	}

	return false;
}

export function canShowAutoFarmButtonForPatches(
	user: MUser | undefined,
	patchesDetailed: IPatchDataDetailed[]
): boolean {
	if (!user) {
		return false;
	}
	return canAutoFarmAnyPatch(user, patchesDetailed);
}

export async function canShowAutoFarmButton(user: MUser): Promise<boolean> {
	const { getFarmingInfoFromUser } = await import('./getFarmingInfo.js');
	const info = getFarmingInfoFromUser(user);
	return canShowAutoFarmButtonForPatches(user, info.patchesDetailed);
}

export function userGrowingProgressStr(patchesDetailed: IPatchDataDetailed[], user?: MUser): BaseSendableMessage {
	let str = '';
	for (const patch of patchesDetailed.filter(i => i.ready === true)) {
		str += `${Emoji.Tick} **${patch.friendlyName}**: ${patch.lastQuantity} ${patch.lastPlanted} are ready to be harvested!\n`;
	}
	for (const patch of patchesDetailed.filter(i => i.ready === false)) {
		str += `${Emoji.Stopwatch} **${patch.friendlyName}**: ${patch.lastQuantity} ${patch.lastPlanted} ready at ${dateFm(
			patch.readyAt!
		)}\n`;
	}
	const notReady = patchesDetailed.filter(i => i.ready === null);
	str += `${Emoji.RedX} **Nothing planted:** ${formatList(notReady.map(i => i.friendlyName))}.`;

	const buttons: ButtonBuilder[] = [];
	if (
		canShowAutoFarmButtonForPatches(user, patchesDetailed) &&
		!user?.bitfield.includes(BitField.DisableAutoFarmButton)
	) {
		buttons.push(makeAutoFarmButton());
	}

	return { content: str, components: buttons };
}
