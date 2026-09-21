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

export function isDiscoEventActive(date = new Date()) {
	return date.getTime() < DISCO_EVENT_END_DATE.getTime();
}
