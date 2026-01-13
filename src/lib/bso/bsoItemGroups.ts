import { Items } from 'oldschooljs';

const bsoSeeds = Items.resolveItems([
	'Mysterious seed',
	'Athelas seed',
	'Avocado seed',
	'Lychee seed',
	'Mango seed',
	'Korulsi seed',
	'Grand crystal acorn'
]);

const bsoHerbs = Items.resolveItems(['Athelas']);

const bsoBones = Items.resolveItems(['Abyssal dragon bones', 'Royal dragon bones', 'Frost dragon bones']);

export const BSOItemGroups = {
	bsoSeeds,
	bsoHerbs,
	bsoBones
};
