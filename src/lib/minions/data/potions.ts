import { resolveItems } from 'oldschooljs/dist/util/util';

const Potions = [
	{
		name: 'Saradomin brew',
		items: resolveItems(['Saradomin brew(1)', 'Saradomin brew(2)', 'Saradomin brew(3)', 'Saradomin brew(4)'])
	},
	{
		name: 'Super restore',
		items: resolveItems(['Super restore(1)', 'Super restore(2)', 'Super restore(3)', 'Super restore(4)'])
	},
	{
		name: 'Blighted super restore',
		items: resolveItems([
			'Blighted super restore(1)',
			'Blighted super restore(2)',
			'Blighted super restore(3)',
			'Blighted super restore(4)'
		])
	},
	{
		name: 'Prayer potion',
		items: resolveItems(['Prayer potion(1)', 'Prayer potion(2)', 'Prayer potion(3)', 'Prayer potion(4)'])
	},
	{
		name: 'Sanfew serum',
		items: resolveItems(['Sanfew serum(1)', 'Sanfew serum(2)', 'Sanfew serum(3)', 'Sanfew serum(4)'])
	},
	{
		name: 'Attack potion',
		items: resolveItems(['Attack potion(1)', 'Attack potion(2)', 'Attack potion(3)', 'Attack potion(4)'])
	},
	{
		name: 'Antipoison',
		items: resolveItems(['Antipoison(1)', 'Antipoison(2)', 'Antipoison(3)', 'Antipoison(4)'])
	},
	{
		name: "Relicym's balm",
		items: resolveItems(["Relicym's balm(1)", "Relicym's balm(2)", "Relicym's balm(3)", "Relicym's balm(4)"])
	},
	{
		name: 'Strength potion',
		items: resolveItems(['Strength potion(1)', 'Strength potion(2)', 'Strength potion(3)', 'Strength potion(4)'])
	},
	{
		name: 'Serum 207',
		items: resolveItems(['Serum 207(1)', 'Serum 207(2)', 'Serum 207(3)', 'Serum 207(4)'])
	},
	{
		name: 'Guthix rest',
		items: resolveItems(['Guthix rest(1)', 'Guthix rest(2)', 'Guthix rest(3)', 'Guthix rest(4)'])
	},
	{
		name: 'Compost potion',
		items: resolveItems(['Compost potion(1)', 'Compost potion(2)', 'Compost potion(3)', 'Compost potion(4)'])
	},
	{
		name: 'Restore potion',
		items: resolveItems(['Restore potion(1)', 'Restore potion(2)', 'Restore potion(3)', 'Restore potion(4)'])
	},
	{
		name: 'Guthix balance',
		items: resolveItems(['Guthix balance(1)', 'Guthix balance(2)', 'Guthix balance(3)', 'Guthix balance(4)'])
	},
	{
		name: 'Energy potion',
		items: resolveItems(['Energy potion(1)', 'Energy potion(2)', 'Energy potion(3)', 'Energy potion(4)'])
	},
	{
		name: 'Defence potion',
		items: resolveItems(['Defence potion(1)', 'Defence potion(2)', 'Defence potion(3)', 'Defence potion(4)'])
	},
	{
		name: 'Agility potion',
		items: resolveItems(['Agility potion(1)', 'Agility potion(2)', 'Agility potion(3)', 'Agility potion(4)'])
	},
	{
		name: 'Combat potion',
		items: resolveItems(['Combat potion(1)', 'Combat potion(2)', 'Combat potion(3)', 'Combat potion(4)'])
	},
	{
		name: 'Super attack',
		items: resolveItems(['Super attack(1)', 'Super attack(2)', 'Super attack(3)', 'Super attack(4)'])
	},
	{
		name: 'Superantipoison',
		items: resolveItems(['Superantipoison(1)', 'Superantipoison(2)', 'Superantipoison(3)', 'Superantipoison(4)'])
	},
	{
		name: 'Fishing potion',
		items: resolveItems(['Fishing potion(1)', 'Fishing potion(2)', 'Fishing potion(3)', 'Fishing potion(4)'])
	},
	{
		name: 'Super energy',
		items: resolveItems(['Super energy(1)', 'Super energy(2)', 'Super energy(3)', 'Super energy(4)'])
	},
	{
		name: 'Hunter potion',
		items: resolveItems(['Hunter potion(1)', 'Hunter potion(2)', 'Hunter potion(3)', 'Hunter potion(4)'])
	},
	{
		name: 'Super strength',
		items: resolveItems(['Super strength(1)', 'Super strength(2)', 'Super strength(3)', 'Super strength(4)'])
	},
	{
		name: 'Magic essence',
		items: resolveItems(['Magic essence(1)', 'Magic essence(2)', 'Magic essence(3)', 'Magic essence(4)'])
	},
	{
		name: 'Super defence',
		items: resolveItems(['Super defence(1)', 'Super defence(2)', 'Super defence(3)', 'Super defence(4)'])
	},
	{
		name: 'Antidote+',
		items: resolveItems(['Antidote+(1)', 'Antidote+(2)', 'Antidote+(3)', 'Antidote+(4)'])
	},
	{
		name: 'Antifire potion',
		items: resolveItems(['Antifire potion(1)', 'Antifire potion(2)', 'Antifire potion(3)', 'Antifire potion(4)'])
	},
	{
		name: 'Divine super attack potion',
		items: resolveItems([
			'Divine super attack potion(1)',
			'Divine super attack potion(2)',
			'Divine super attack potion(3)',
			'Divine super attack potion(4)'
		])
	},
	{
		name: 'Divine super defence potion',
		items: resolveItems([
			'Divine super defence potion(1)',
			'Divine super defence potion(2)',
			'Divine super defence potion(3)',
			'Divine super defence potion(4)'
		])
	},
	{
		name: 'Divine super strength potion',
		items: resolveItems([
			'Divine super strength potion(1)',
			'Divine super strength potion(2)',
			'Divine super strength potion(3)',
			'Divine super strength potion(4)'
		])
	},
	{
		name: 'Ranging potion',
		items: resolveItems(['Ranging potion(1)', 'Ranging potion(2)', 'Ranging potion(3)', 'Ranging potion(4)'])
	},
	{
		name: 'Divine ranging potion',
		items: resolveItems([
			'Divine ranging potion(1)',
			'Divine ranging potion(2)',
			'Divine ranging potion(3)',
			'Divine ranging potion(4)'
		])
	},
	{
		name: 'Magic potion',
		items: resolveItems(['Magic potion(1)', 'Magic potion(2)', 'Magic potion(3)', 'Magic potion(4)'])
	},
	{
		name: 'Stamina potion',
		items: resolveItems(['Stamina potion(1)', 'Stamina potion(2)', 'Stamina potion(3)', 'Stamina potion(4)'])
	},
	{
		name: 'Zamorak brew',
		items: resolveItems(['Zamorak brew(1)', 'Zamorak brew(2)', 'Zamorak brew(3)', 'Zamorak brew(4)'])
	},
	{
		name: 'Divine magic potion',
		items: resolveItems([
			'Divine magic potion(1)',
			'Divine magic potion(2)',
			'Divine magic potion(3)',
			'Divine magic potion(4)'
		])
	},
	{
		name: 'Antidote++',
		items: resolveItems(['Antidote++(1)', 'Antidote++(2)', 'Antidote++(3)', 'Antidote++(4)'])
	},
	{
		name: 'Bastion potion',
		items: resolveItems(['Bastion potion(1)', 'Bastion potion(2)', 'Bastion potion(3)', 'Bastion potion(4)'])
	},
	{
		name: 'Battlemage potion',
		items: resolveItems([
			'Battlemage potion(1)',
			'Battlemage potion(2)',
			'Battlemage potion(3)',
			'Battlemage potion(4)'
		])
	},
	{
		name: 'Extended antifire',
		items: resolveItems([
			'Extended antifire(1)',
			'Extended antifire(2)',
			'Extended antifire(3)',
			'Extended antifire(4)'
		])
	},
	{
		name: 'Divine bastion potion',
		items: resolveItems([
			'Divine bastion potion(1)',
			'Divine bastion potion(2)',
			'Divine bastion potion(3)',
			'Divine bastion potion(4)'
		])
	},
	{
		name: 'Divine battlemage potion',
		items: resolveItems([
			'Divine battlemage potion(1)',
			'Divine battlemage potion(2)',
			'Divine battlemage potion(3)',
			'Divine battlemage potion(4)'
		])
	},
	{
		name: 'Anti-venom',
		items: resolveItems(['Anti-venom(1)', 'Anti-venom(2)', 'Anti-venom(3)', 'Anti-venom(4)'])
	},
	{
		name: 'Menaphite remedy',
		items: resolveItems([
			'Menaphite remedy(1)',
			'Menaphite remedy(2)',
			'Menaphite remedy(3)',
			'Menaphite remedy(4)'
		])
	},
	{
		name: 'Super combat potion',
		items: resolveItems([
			'Super combat potion(1)',
			'Super combat potion(2)',
			'Super combat potion(3)',
			'Super combat potion(4)'
		])
	},
	{
		name: 'Super antifire potion',
		items: resolveItems([
			'Super antifire potion(1)',
			'Super antifire potion(2)',
			'Super antifire potion(3)',
			'Super antifire potion(4)'
		])
	},
	{
		name: 'Extended anti-venom+',
		items: resolveItems([
			'Extended anti-venom+(1)',
			'Extended anti-venom+(2)',
			'Extended anti-venom+(3)',
			'Extended anti-venom+(4)'
		])
	},
	{
		name: 'Anti-venom+',
		items: resolveItems(['Anti-venom+(1)', 'Anti-venom+(2)', 'Anti-venom+(3)', 'Anti-venom+(4)'])
	},
	{
		name: 'Divine super combat potion',
		items: resolveItems([
			'Divine super combat potion(1)',
			'Divine super combat potion(2)',
			'Divine super combat potion(3)',
			'Divine super combat potion(4)'
		])
	},
	{
		name: 'Extended super antifire',
		items: resolveItems([
			'Extended super antifire(1)',
			'Extended super antifire(2)',
			'Extended super antifire(3)',
			'Extended super antifire(4)'
		])
	},
	{
		name: 'Ancient brew',
		items: resolveItems(['Ancient brew(1)', 'Ancient brew(2)', 'Ancient brew(3)', 'Ancient brew(4)'])
	},
	{
		name: 'Forgotten brew',
		items: resolveItems(['Forgotten brew(1)', 'Forgotten brew(2)', 'Forgotten brew(3)', 'Forgotten brew(4)'])
	},
	{
		name: 'Attack mix',
		items: resolveItems(['Attack mix(1)', 'Attack mix(2)'])
	},
	{
		name: 'Antipoison mix',
		items: resolveItems(['Antipoison mix(1)', 'Antipoison mix(2)'])
	},
	{
		name: "Relicym's mix",
		items: resolveItems(["Relicym's mix(1)", "Relicym's mix(2)"])
	},
	{
		name: 'Strength mix',
		items: resolveItems(['Strength mix(1)', 'Strength mix(2)'])
	},
	{
		name: 'Restore mix',
		items: resolveItems(['Restore mix(1)', 'Restore mix(2)'])
	},
	{
		name: 'Energy mix',
		items: resolveItems(['Energy mix(1)', 'Energy mix(2)'])
	},
	{
		name: 'Defence mix',
		items: resolveItems(['Defence mix(1)', 'Defence mix(2)'])
	},
	{
		name: 'Agility mix',
		items: resolveItems(['Agility mix(1)', 'Agility mix(2)'])
	},
	{
		name: 'Combat mix',
		items: resolveItems(['Combat mix(1)', 'Combat mix(2)'])
	},
	{
		name: 'Prayer mix',
		items: resolveItems(['Prayer mix(1)', 'Prayer mix(2)'])
	},
	{
		name: 'Superattack mix',
		items: resolveItems(['Superattack mix(1)', 'Superattack mix(2)'])
	},
	{
		name: 'Anti-poison supermix',
		items: resolveItems(['Anti-poison supermix(1)', 'Anti-poison supermix(2)'])
	},
	{
		name: 'Fishing mix',
		items: resolveItems(['Fishing mix(1)', 'Fishing mix(2)'])
	},
	{
		name: 'Super energy mix',
		items: resolveItems(['Super energy mix(1)', 'Super energy mix(2)'])
	},
	{
		name: 'Hunting mix',
		items: resolveItems(['Hunting mix(1)', 'Hunting mix(2)'])
	},
	{
		name: 'Super str. mix',
		items: resolveItems(['Super str. mix(1)', 'Super str. mix(2)'])
	},
	{
		name: 'Magic essence mix',
		items: resolveItems(['Magic essence mix(1)', 'Magic essence mix(2)'])
	},
	{
		name: 'Super restore mix',
		items: resolveItems(['Super restore mix(1)', 'Super restore mix(2)'])
	},
	{
		name: 'Super def. mix',
		items: resolveItems(['Super def. mix(1)', 'Super def. mix(2)'])
	},
	{
		name: 'Antidote+ mix',
		items: resolveItems(['Antidote+ mix(1)', 'Antidote+ mix(2)'])
	},
	{
		name: 'Antifire mix',
		items: resolveItems(['Antifire mix(1)', 'Antifire mix(2)'])
	},
	{
		name: 'Ranging mix',
		items: resolveItems(['Ranging mix(1)', 'Ranging mix(2)'])
	},
	{
		name: 'Magic mix',
		items: resolveItems(['Magic mix(1)', 'Magic mix(2)'])
	},
	{
		name: 'Zamorak mix',
		items: resolveItems(['Zamorak mix(1)', 'Zamorak mix(2)'])
	},
	{
		name: 'Stamina mix',
		items: resolveItems(['Stamina mix(1)', 'Stamina mix(2)'])
	},
	{
		name: 'Extended antifire mix',
		items: resolveItems(['Extended antifire mix(1)', 'Extended antifire mix(2)'])
	},
	{
		name: 'Ancient mix',
		items: resolveItems(['Ancient mix(1)', 'Ancient mix(2)'])
	},
	{
		name: 'Super antifire mix',
		items: resolveItems(['Super antifire mix(1)', 'Super antifire mix(2)'])
	},
	{
		name: 'Extended super antifire mix',
		items: resolveItems(['Extended super antifire mix(1)', 'Extended super antifire mix(2)'])
	}
];

export default Potions;
