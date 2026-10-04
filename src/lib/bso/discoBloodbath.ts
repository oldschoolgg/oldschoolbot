import { cmbClothes } from '@/lib/bso/openables/cmb.js';

import { createHash } from 'node:crypto';
import { type Item, Items } from 'oldschooljs';

export const DISCO_EVENT_END_DATE = new Date('2026-12-01T00:00:00.000Z');
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

const DISCO_HALLOWEEN_STORIES: Record<DiscoClub, { setup: string; resolution: string }> = {
	Bloodbath: {
		setup: '🩸 *Act III begins with the house lights dead and the red spotlight fixed on an empty throne. Somewhere beneath the bass, a heartbeat is keeping time.*',
		resolution:
			'🦇 *The throne remains empty, but the heartbeat stops when you leave. In the silence, the crowd finally remembers whose blood was on the dance floor.*'
	},
	Monster: {
		setup: '👹 *The monster behind the velvet curtain has learned every dancer’s name. It asks for yours as the third act starts.*',
		resolution:
			'🕸️ *The curtain opens onto an empty room, except for your name stitched into the lining. The monster applauds from somewhere inside the walls.*'
	},
	Keoki: {
		setup: '👻 *Act III arrives with Keoki’s last record playing backward. A pale figure waits beside the booth, holding a photograph that has not been taken yet.*',
		resolution:
			'🕯️ *The photograph develops in your hand: the room is empty, and you are dancing alone. The figure bows as the needle lifts.*'
	},
	Skrinklada: {
		setup: '🕷️ *At Skrinklada, the webbing over the speakers trembles when Act III begins. Each strand hums with a voice asking the dancers to stay until morning.*',
		resolution:
			'🦇 *The webbing tears without a sound, and everyone swears they were never afraid. One silver thread is still tied around your wrist.*'
	},
	'Two of Hearts': {
		setup: '💔 *The third act begins with two heartbeats coming through the monitors, one too slow and one too fast. Neither belongs to the person beside you.*',
		resolution:
			'🕯️ *The music resolves into a single pulse, then nothing. At the bar, two untouched drinks continue to sweat in the dark.*'
	},
	Fame: {
		setup: '🎭 *Act III opens with every mirror at Fame showing a different face wearing your clothes. The applause starts before anyone has performed.*',
		resolution: '👁️ *When the mirrors go black, one reflection keeps clapping. It smiles only after you turn away.*'
	},
	Money: {
		setup: '🪙 *The third act begins when the coins on the bar start whispering their previous owners’ last wishes. The cashier counts them twice, then locks the door.*',
		resolution:
			'⚰️ *At closing, every coin has vanished except one beneath your shoe. It is warm, and it bears the date of tomorrow.*'
	},
	Glamour: {
		setup: '🦇 *Act III begins when Glamour’s chandeliers dim and every guest’s shadow slips loose. They gather beneath the stage, waiting for the next song.*',
		resolution:
			'🕸️ *The shadows return to their owners one by one, all except yours. It lingers beneath the stage and keeps dancing after the lights rise.*'
	},
	Success: {
		setup: '🏆 *The final act starts with a trophy presented to someone who never came home. Its polished surface shows the audience wearing funeral masks.*',
		resolution:
			'👻 *The trophy cracks as the final note fades, and a cold hand takes it from the stage. The crowd cheers as if it has been waiting years.*'
	}
};

export function discoHalloweenStory(club: string) {
	return DISCO_HALLOWEEN_STORIES[club as DiscoClub] ?? null;
}

export const DISCO_CLUB_THEMES: Record<
	DiscoClub,
	{
		name: string;
		description: string;
		good: DiscoAesthetic;
		bad: DiscoAesthetic;
	}
> = {
	Bloodbath: {
		name: 'Techno-Chic',
		description: 'Sleek, intentional, advanced, and polished.',
		good: 'Futuristic',
		bad: 'Anti-Fashion'
	},
	Monster: {
		name: 'Synthetic',
		description: 'Controlled, geometric, engineered, and clean.',
		good: 'Futuristic',
		bad: 'Ragdoll'
	},
	Keoki: {
		name: 'Lo-Fi',
		description: 'Raw, worn, deliberately unfashionable, and loud.',
		good: 'Anti-Fashion',
		bad: 'Futuristic'
	},
	Skrinklada: {
		name: 'Austere',
		description: 'Understated, functional, stripped down, and sharp.',
		good: 'Anti-Fashion',
		bad: 'Ragdoll'
	},
	'Two of Hearts': {
		name: 'Vaudeville',
		description: 'Handmade, theatrical, eccentric, and imperfect.',
		good: 'Ragdoll',
		bad: 'Futuristic'
	},
	Fame: {
		name: 'Avant-Garde',
		description: 'Extravagant, performative, and impossible to ignore.',
		good: 'Ragdoll',
		bad: 'Anti-Fashion'
	},
	Money: {
		name: 'Techno-Chic',
		description: 'Sleek, intentional, advanced, and polished.',
		good: 'Futuristic',
		bad: 'Anti-Fashion'
	},
	Glamour: {
		name: 'Synthetic',
		description: 'Controlled, geometric, engineered, and clean.',
		good: 'Futuristic',
		bad: 'Ragdoll'
	},
	Success: {
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

export function recordDiscoBoxClaim(box: 'Skrink box' | 'Skrod box') {
	if (box === 'Skrink box') skrinkBoxesGivenOut++;
	else skrodBoxesGivenOut++;
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

	constructor(item: Item | number | string) {
		this.item = typeof item === 'object' ? item : Items.getOrThrow(item);
		this.name = this.item.name.toLowerCase();
		const cmb = cmbClothes.includes(this.item.id);
		const bytes = hashBytes(this.name);
		const words = this.name.split(/\s+/).filter(Boolean);
		const first = aestheticFromWord(words[0] ?? this.name);
		const second = aestheticFromWord(words[1] ?? words[0] ?? this.name);
		this.aesthetics = [...new Set([first, second])];
		this.points = { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 };

		const positive = [hashScore(bytes.slice(0, 8), cmb), hashScore(bytes.slice(8), cmb)];
		for (const [index, aesthetic] of [first, second].entries()) this.points[aesthetic] += positive[index];

		const negativeAesthetic = DISCO_AESTHETICS[byteSum(bytes) % 4] as DiscoAesthetic | undefined;
		if (negativeAesthetic && this.points[negativeAesthetic] === 0) {
			this.points[negativeAesthetic] = -byteSum(bytes) % (cmb ? 0x3f : 0x5f);
		}
	}
}

export function scoreDiscoFashion(fashion: Record<string, { item: number; quantity?: number } | null>) {
	const points: Record<DiscoAesthetic, number> = { Futuristic: 0, Ragdoll: 0, 'Anti-Fashion': 0 };
	const items: { item: DiscoItem; slot: string }[] = [];
	for (const [slot, equipped] of Object.entries(fashion)) {
		if (!equipped || slot === 'ammo') continue;
		const item = new DiscoItem(equipped.item);
		items.push({ item, slot });
		for (const aesthetic of DISCO_AESTHETICS) points[aesthetic] += item.points[aesthetic];
	}
	for (const aesthetic of DISCO_AESTHETICS) points[aesthetic] = Math.max(0, Math.min(500, points[aesthetic]));
	return { points, items };
}

function seededValue(seed: string) {
	return Number.parseInt(createHash('md5').update(seed).digest('hex').slice(0, 8), 16);
}

export function discoHourSeed(date = new Date()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
}

export function discoPopularity(club: DiscoClub, date = new Date()) {
	return 50 + (seededValue(`${discoHourSeed(date)}:${club}`) % 51);
}

export function discoClubOrder(date = new Date()): DiscoClub[] {
	return [...DISCO_CLUBS].sort(
		(a, b) => seededValue(`${discoHourSeed(date)}:${a}`) - seededValue(`${discoHourSeed(date)}:${b}`)
	);
}

export function discoClubTheme(club: DiscoClub, date = new Date()) {
	return DISCO_CLUB_THEMES[DISCO_CLUBS[discoClubOrder(date).indexOf(club)]];
}

export function isDiscoEventActive(date = new Date()) {
	return date.getTime() < DISCO_EVENT_END_DATE.getTime();
}

export function isDiscoHalloween(date = new Date()) {
	return date.getUTCMonth() === 9;
}
