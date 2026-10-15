import { cmbClothes } from '@/lib/bso/openables/cmb.js';

import { createHash } from 'node:crypto';
import { type Item, Items } from 'oldschooljs';

export const DISCO_EVENT_END_DATE = new Date('2026-11-06T00:00:00.000Z');
export const DISCO_POINT_REWORK_DATE = new Date('2026-10-16T06:00:00.000Z');
export const holidayOpenableItemIDs = new Set<number>();
export const DISCO_CLUBS = [
	'Bloodbath',
	'Monster',
	'Keoki',
	'Skrinklada',
	'Two of Hearts',
	'Fame',
	'Money',
	'Glamour',
	'Success'
] as const;
export type DiscoClub = (typeof DISCO_CLUBS)[number];

export const DISCO_AESTHETICS = ['Futuristic', 'Ragdoll', 'Anti-Fashion'] as const;
export type DiscoAesthetic = (typeof DISCO_AESTHETICS)[number];

export const DISCO_AESTHETIC_COLORS: Record<DiscoAesthetic, { positive: string; negative: string }> = {
	Futuristic: { positive: '#00d8e8', negative: '#123c71' },
	Ragdoll: { positive: '#ff78bd', negative: '#c93570' },
	'Anti-Fashion': { positive: '#d6ff38', negative: '#91b300' }
};

export const DISCO_AESTHETIC_SHORT_NAMES: Record<DiscoAesthetic, string> = {
	Futuristic: 'F',
	Ragdoll: 'R',
	'Anti-Fashion': 'A'
};

const DISCO_HALLOWEEN_STORIES: Record<DiscoClub, { moment: string; endings: string[] }> = {
	Bloodbath: {
		moment: '🩸 *The house lights die and a red spotlight finds an empty throne. Somewhere beneath the bass, a heartbeat is keeping time.*',
		endings: [
			'🦇 *The heartbeat stops when you leave. In the silence, the crowd remembers whose blood was on the dance floor.*',
			'🪩 *The throne coughs up a disco ball, which rolls directly into coat check. Nobody claims it.*'
		]
	},
	Monster: {
		moment: '👹 *Behind the velvet curtain, something has learned every dancer’s name. It asks for yours.*',
		endings: [
			'🕸️ *The curtain opens onto an empty room, except for your name stitched into the lining. Something applauds inside the walls.*',
			'🎟️ *The curtain parts to reveal a bouncer with a clipboard. You are denied entry for wearing the wrong shoes.*'
		]
	},
	Keoki: {
		moment: '👻 *Keoki’s last record plays backward. A pale figure waits beside the booth, holding a photograph that has not been taken yet.*',
		endings: [
			'🕯️ *The photograph develops in your hand: the room is empty, and you are dancing alone. The figure bows as the needle lifts.*'
		]
	},
	Skrinklada: {
		moment: '🕷️ *The webbing over Skrinklada’s speakers trembles. Each strand hums with a voice asking the dancers to stay until morning.*',
		endings: [
			'🦇 *The webbing tears without a sound, and everyone swears they were never afraid. One silver thread remains tied around your wrist.*',
			'🕸️ *A tiny spider lowers itself onto the DJ booth and requests the next song. Everyone obeys.*'
		]
	},
	'Two of Hearts': {
		moment: '💔 *Two heartbeats come through the monitors, one too slow and one too fast. Neither belongs to the person beside you.*',
		endings: [
			'🕯️ *The music narrows to a single pulse, then nothing. At the bar, two untouched drinks continue to sweat in the dark.*',
			'💘 *A bartender unplugs the monitors and apologizes: the haunted heart-rate machine has been double-booked.*'
		]
	},
	Fame: {
		moment: '🎭 *Every mirror at Fame shows a different face wearing your clothes. Applause starts before anyone has performed.*',
		endings: ['👁️ *The mirrors go black, but one reflection keeps clapping. It smiles only after you turn away.*']
	},
	Money: {
		moment: '🪙 *Coins on the bar begin whispering their previous owners’ last wishes. The cashier counts them twice, then locks the door.*',
		endings: [
			'⚰️ *At closing, every coin has vanished except one beneath your shoe. It is warm, and it bears tomorrow’s date.*',
			'💸 *The coins stop whispering once the cashier adds a service charge. They do not stop complaining.*'
		]
	},
	Glamour: {
		moment: '🦇 *Glamour’s chandeliers dim and every guest’s shadow slips loose. They gather beneath the stage, waiting for the next song.*',
		endings: [
			'🕸️ *The shadows return to their owners one by one, all except yours. It remains beneath the stage, dancing after the lights rise.*'
		]
	},
	Success: {
		moment: '🏆 *A trophy is presented to someone who never came home. Its polished surface shows the audience wearing funeral masks.*',
		endings: [
			'👻 *The trophy cracks as the music fades, and a cold hand takes it from the stage. The crowd cheers as if it has waited years.*',
			'🥈 *The trophy’s ghost accepts second place, then demands a rematch at karaoke.*'
		]
	}
};

export function discoHalloweenStory(club: string) {
	return DISCO_HALLOWEEN_STORIES[club as DiscoClub] ?? null;
}

export const DISCO_CLUB_THEMES: Record<
	(typeof DISCO_CLUBS)[number],
	{
		club: (typeof DISCO_CLUBS)[number];
		name: string;
		description: string;
		good: DiscoAesthetic;
		bad: DiscoAesthetic;
	}
> = {
	Bloodbath: {
		club: 'Bloodbath',
		name: 'Techno-Chic',
		description: 'Sleek, intentional, advanced, and polished.',
		good: 'Futuristic',
		bad: 'Anti-Fashion'
	},
	Monster: {
		club: 'Monster',
		name: 'Synthetic',
		description: 'Controlled, geometric, engineered, and clean.',
		good: 'Futuristic',
		bad: 'Ragdoll'
	},
	Keoki: {
		club: 'Keoki',
		name: 'Lo-Fi',
		description: 'Raw, worn, deliberately unfashionable, and loud.',
		good: 'Anti-Fashion',
		bad: 'Futuristic'
	},
	Skrinklada: {
		club: 'Skrinklada',
		name: 'Austere',
		description: 'Understated, functional, stripped down, and sharp.',
		good: 'Anti-Fashion',
		bad: 'Ragdoll'
	},
	'Two of Hearts': {
		club: 'Two of Hearts',
		name: 'Vaudeville',
		description: 'Handmade, theatrical, eccentric, and imperfect.',
		good: 'Ragdoll',
		bad: 'Futuristic'
	},
	Fame: {
		club: 'Fame',
		name: 'Avant-Garde',
		description: 'Extravagant, performative, and impossible to ignore.',
		good: 'Ragdoll',
		bad: 'Anti-Fashion'
	},
	Money: {
		club: 'Money',
		name: 'Lo-Fi',
		description: 'Raw, worn, deliberately unfashionable, and loud.',
		good: 'Anti-Fashion',
		bad: 'Futuristic'
	},
	Glamour: {
		club: 'Glamour',
		name: 'Synthetic',
		description: 'Controlled, geometric, engineered, and clean.',
		good: 'Futuristic',
		bad: 'Ragdoll'
	},
	Success: {
		club: 'Success',
		name: 'Avant-Garde',
		description: 'Extravagant, performative, and impossible to ignore.',
		good: 'Ragdoll',
		bad: 'Anti-Fashion'
	}
};

export let skrinkBoxesGivenOut = 0;
export let skrodBoxesGivenOut = 0;

export async function loadDiscoBoxCounts() {
	const [counts] = await prisma.$queryRaw<{ skrink: bigint | null; skrod: bigint | null }[]>`
		SELECT
			COALESCE(SUM(COALESCE(("collectionLogBank"->>'75701')::integer, 0)), 0)::bigint AS skrink,
			COALESCE(SUM(COALESCE(("collectionLogBank"->>'75702')::integer, 0)), 0)::bigint AS skrod
		FROM users;
	`;
	skrinkBoxesGivenOut = Number(counts?.skrink ?? 0);
	skrodBoxesGivenOut = Number(counts?.skrod ?? 0);
}

function hashBytes(value: string): number[] {
	return [...createHash('md5').update(value).digest()];
}

function byteSum(bytes: number[]) {
	return bytes.reduce((total, value) => total + value, 0);
}

function aestheticFromWord(word: string): DiscoAesthetic {
	return DISCO_AESTHETICS[byteSum(hashBytes(word)) % DISCO_AESTHETICS.length];
}

function hashScore(bytes: number[], cmb: boolean) {
	return byteSum(bytes) % (cmb ? 0xff : 0x7f);
}

export class DiscoItem {
	readonly item: Item;
	readonly name: string;
	readonly aesthetics: DiscoAesthetic[];
	readonly points: Record<DiscoAesthetic, number>;

	constructor(item: Item | number | string, options?: { hashSeed?: string }) {
		this.item = typeof item === 'object' ? item : Items.getOrThrow(item);
		this.name = this.item.name.toLowerCase();
		const cmb = cmbClothes.includes(this.item.id);
		const hashSeed = options?.hashSeed ?? this.name;
		const bytes = hashBytes(hashSeed);
		const words = hashSeed.split(/\s+/).filter(Boolean);
		const first = aestheticFromWord(words[0] ?? hashSeed);
		const second = aestheticFromWord(words[1] ?? words[0] ?? hashSeed);
		this.aesthetics = [...new Set([first, second])];
		this.points = { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 };

		const positive = [hashScore(bytes.slice(0, 8), cmb), hashScore(bytes.slice(8), cmb)];
		for (const [index, aesthetic] of [first, second].entries()) this.points[aesthetic] += positive[index];

		const negativeAesthetic = DISCO_AESTHETICS[byteSum(bytes) % 4] as DiscoAesthetic | undefined;
		if (negativeAesthetic && this.points[negativeAesthetic] === 0) {
			this.points[negativeAesthetic] = -byteSum(bytes) % (cmb ? 0x3f : 0x5f);
		}
		if (holidayOpenableItemIDs.has(this.item.id)) {
			for (const aesthetic of DISCO_AESTHETICS) this.points[aesthetic] *= 2;
		}
	}
}

export function scoreDiscoFashion(fashion: Record<string, { item: number; quantity?: number } | null>) {
	const points: Record<DiscoAesthetic, number> = { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 };
	const rawPoints = { ... points };
	const items: { item: DiscoItem; slot: string }[] = [];
	for (const [slot, equipped] of Object.entries(fashion)) {
		if (!equipped || slot === 'ammo') continue;
		const item = new DiscoItem(equipped.item);
		items.push({ item, slot });
		for (const aesthetic of DISCO_AESTHETICS) {
			rawPoints[aesthetic] += Math.min(item.points[aesthetic], 500);
		}
	}
	for (const aesthetic of DISCO_AESTHETICS) {
		points[aesthetic] =
			new Date() >= DISCO_POINT_REWORK_DATE
				? (rawPoints[aesthetic] / 1750) * 500
				: Math.max(0, Math.min(500, rawPoints[aesthetic]));
	}
	return { points, items, rawPoints };
}

function seededValue(seed: string) {
	return Number.parseInt(createHash('md5').update(seed).digest('hex').slice(0, 8), 16);
}

export function discoHourSeed(date = new Date()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(date.getHours() / 4) * 4).getTime();
}

export function discoPopularity(club: DiscoClub, date = new Date()) {
	return 44 + (seededValue(`${discoHourSeed(date)}:${club}`) % 75);
}

export function discoClubOrder(date = new Date()): DiscoClub[] {
	return [...DISCO_CLUBS].sort(
		(a, b) => seededValue(`${discoHourSeed(date)}:${a}`) - seededValue(`${discoHourSeed(date)}:${b}`)
	);
}

export function isDiscoEventActive(date = new Date()) {
	return date.getTime() < DISCO_EVENT_END_DATE.getTime();
}

export function isDiscoHalloween(date = new Date()) {
	return date.getUTCMonth() === 9;
}
