import { type ButtonBuilder, dateFm } from '@oldschoolgg/discord';
import { Emoji, stringMatches } from '@oldschoolgg/toolkit';

import { AutoFarmFilterEnum } from '@/prisma/main/enums.js';
import { BitField } from '@/lib/constants.js';
import { allFarm } from '@/lib/minions/functions/autoFarmFilters.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type {
	FarmingSeedPreference,
	IPatchData,
	IPatchDataDetailed
} from '@/lib/skilling/skills/farming/utils/types.js';
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

function getStoredPatchPreference(user: MUser, patchName: FarmingPatchName): FarmingSeedPreference | null {
	const rawPreferences = user.user.minion_farmingPreferredSeeds;
	if (typeof rawPreferences !== 'object' || rawPreferences === null || Array.isArray(rawPreferences)) {
		return null;
	}

	const rawPreference = (rawPreferences as Record<string, unknown>)[patchName];
	if (typeof rawPreference !== 'object' || rawPreference === null || Array.isArray(rawPreference)) {
		return null;
	}

	const { type, seedID } = rawPreference as { seedID?: unknown; type?: unknown };
	if (type === 'empty' || type === 'highest_available') {
		return { type };
	}
	if (type === 'seed' && typeof seedID === 'number') {
		return { type: 'seed', seedID };
	}
	return null;
}

function canPlantEmptyPatch(user: MUser, patchesDetailed: IPatchDataDetailed[]): boolean {
	const autoFarmFilter = user.autoFarmFilter ?? AutoFarmFilterEnum.AllFarm;
	if (autoFarmFilter !== AutoFarmFilterEnum.AllFarm) {
		return false;
	}

	const farmingLevel = user.skillsAsLevels.farming;
	for (const patch of patchesDetailed) {
		if (patch.ready !== null) {
			continue;
		}

		const preference = getStoredPatchPreference(user, patch.patchName);
		if (preference?.type === 'empty') {
			continue;
		}

		const plantsForPatch = Farming.Plants.filter(plant => plant.seedType === patch.patchName);
		const candidates =
			preference?.type === 'seed'
				? plantsForPatch.filter(plant => plant.inputItems.amount(preference.seedID) > 0)
				: plantsForPatch;

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
	if (hasAnyReadyPatch(patchesDetailed)) {
		return true;
	}
	if (!user) {
		return false;
	}
	return canPlantEmptyPatch(user, patchesDetailed);
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
