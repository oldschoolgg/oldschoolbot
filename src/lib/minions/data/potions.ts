import resolveItems from '../../util/resolveItems';

const Potions = [
	{
		name: 'Saradomin brew',
		items: resolveItems([
			'Saradomin brew(1)',
			'Saradomin brew(2)',
			'Saradomin brew(3)',
			'Saradomin brew(4)'
		])
	},
	{
		name: 'Super restore',
		items: resolveItems([
			'Super restore(1)',
			'Super restore(2)',
			'Super restore(3)',
			'Super restore(4)'
		])
	},
	{
		name: 'Prayer potion',
		items: resolveItems([
			'Prayer potion(1)',
			'Prayer potion(2)',
			'Prayer potion(3)',
			'Prayer potion(4)'
		])
	},
	{
		name: 'Sanfew serum',
		items: resolveItems([
			'Sanfew serum(1)',
			'Sanfew serum(2)',
			'Sanfew serum(3)',
			'Sanfew serum(4)'
		])
	}
];

export default Potions;
