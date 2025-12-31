import type { StringAutoComplete } from '@/discord/commands/commandOptions.js';
import TitheFarmBuyables from '@/lib/data/buyables/titheFarmBuyables.js';
import { superCompostables } from '@/lib/data/filterables.js';
import { Farming } from './index.js';

export async function farmingPlantNameAutoComplete({ value, user }: StringAutoComplete) {
	return Farming.Plants.filter(plant => user.skillsAsLevels.farming >= plant.level)
		.filter(plant => (!value ? true : plant.name.toLowerCase().includes(value.toLowerCase())))
		.map(plant => ({ name: plant.name, value: plant.name }));
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
