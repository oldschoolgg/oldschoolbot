import getOSItem from '../util/getOSItem';

// price increases by 50% for each you buy
export const halloweenShop = [
	{
		item: getOSItem("Fool's ace"),
		description:
			'Tricks another player into thinking they got a unique from Mortimer (consumed on use). If the user actually does get a unique, the trick is saved for their next kill.',
		costHours: 1
	},
	{
		item: getOSItem('Bag of tricks'),
		description: "If you don't get a unique from Mortimer, you instead get rolled other rewards.",
		costHours: 5
	},
	{
		item: getOSItem('Cosmic dice'),
		description:
			"Rerolls your unique drop from Mortimer up to 3 extra times, until you get something you haven't got yet, making you less likely to get duplicate items.",
		costHours: 10
	},
	{
		item: getOSItem("Pandora's box"),
		description:
			'Increases Splooky fwizzle collection by 20%, turns all duplicate drops from Mortimer into extra 120x Splooky fwizzle.',
		costHours: 10
	},
	{
		item: getOSItem('Bat bat'),
		description: 'A Bat bat that bats bats.',
		costHours: 5
	},
	{
		item: getOSItem('Soul shield'),
		description: 'Protects your splooky from being fwizzled.',
		costHours: 5
	},
	{
		item: getOSItem('Spooky sheet'),
		description: 'Hides you from the spiritual world, making you 80% more ghostly.',
		costHours: 10
	},
	{
		item: getOSItem('Evil partyhat'),
		description: 'Makes you 35% more evil.',
		costHours: 90
	},
	{
		item: getOSItem('Purple halloween mask'),
		description: 'Makes you 30% more evil.',
		costHours: 90
	},
	{
		item: getOSItem('Spooky aura'),
		description: 'An ethereal aura of spookiness. Makes you 20% more spooky.',
		costHours: 50
	}
].map(i => {
	return { ...i, cost: Math.round(i.costHours * 60) };
});
