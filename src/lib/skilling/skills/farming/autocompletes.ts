import type { StringAutoComplete } from '@/discord/commands/commandOptions.js';
import TitheFarmBuyables from '@/lib/data/buyables/titheFarmBuyables.js';
import { superCompostables } from '@/lib/data/filterables.js';
import { getPlantsForPatch } from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import { isPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import { Farming } from './index.js';

function findRawOptionValue(options: StringAutoComplete['rawOptions'], optionName: string): string | null {
	for (const option of options ?? []) {
		if (option.name === optionName && 'value' in option && typeof option.value === 'string') {
			return option.value;
		}
		if ('options' in option) {
			const nested = findRawOptionValue(option.options, optionName);
			if (nested !== null) {
				return nested;
			}
		}
	}
	return null;
}

function matchesAutocompleteValue(name: string, value: string, searchValue: string): boolean {
	const normalizedSearch = searchValue.toLowerCase();
	return (
		!normalizedSearch ||
		name.toLowerCase().includes(normalizedSearch) ||
		value.toLowerCase().includes(normalizedSearch)
	);
}

export async function farmingPlantNameAutoComplete({ value, user }: StringAutoComplete) {
	return Farming.Plants.filter(plant => user.skillsAsLevels.farming >= plant.level)
		.filter(plant => (!value ? true : plant.name.toLowerCase().includes(value.toLowerCase())))
		.map(plant => ({ name: plant.name, value: plant.name }));
}

export async function farmingPreferredSeedAutoComplete({ value, rawOptions }: StringAutoComplete) {
	const patchInput = findRawOptionValue(rawOptions, 'patch');
	const plantsForPatch = patchInput && isPatchName(patchInput) ? getPlantsForPatch(patchInput) : Farming.Plants;
	const options = [
		{ name: 'highest_available', value: 'highest_available' },
		{ name: 'empty', value: 'empty' }
	];
	const seenSeedIDs = new Set<number>();

	for (const plant of plantsForPatch) {
		const [seed] = plant.inputItems.items();
		if (!seed || seenSeedIDs.has(seed[0].id)) {
			continue;
		}
		seenSeedIDs.add(seed[0].id);
		options.push({
			name: `${seed[0].name} (${plant.name})`,
			value: seed[0].name
		});
	}

	return options.filter(option => matchesAutocompleteValue(option.name, option.value, value));
}

export async function titheFarmBuyRewardAutoComplete({ value }: StringAutoComplete) {
	return TitheFarmBuyables.filter(buyable =>
		!value ? true : buyable.name.toLowerCase().includes(value.toLowerCase())
	).map(buyable => ({ name: buyable.name, value: buyable.name }));
}

export async function compostBinPlantNameAutoComplete({ value }: StringAutoComplete) {
	return superCompostables
		.filter(plantName => (!value ? true : plantName.toLowerCase().includes(value.toLowerCase())))
		.map(plantName => ({ name: plantName, value: plantName }));
}
