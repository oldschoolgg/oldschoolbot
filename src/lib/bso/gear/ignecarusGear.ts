import { Gear } from '@/lib/structures/Gear.js';

const referenceSetup = {
	head: 'Dwarven full helm',
	body: 'Dwarven platebody',
	legs: 'Dwarven platelegs',
	hands: 'Dwarven gloves',
	feet: 'Dwarven boots',
	cape: 'TzKal cape',
	ring: 'Ignis ring(i)',
	weapon: 'Drygore longsword',
	shield: 'Dragonfire shield',
	neck: "Brawler's hook necklace"
};

// Keep the original reference stats so display updates do not change kill speeds.
export const ignecarusReferenceGear = new Gear(referenceSetup);

export const ignecarusBISGear = new Gear({
	...referenceSetup,
	ring: 'Searcrown band',
	shield: 'Dragonbane aegis'
});
