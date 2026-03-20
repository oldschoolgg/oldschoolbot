import { useMemo, useState } from 'preact/hooks';

import fishablesRaw from '../../../data/osb/skills/fishing-fishables.json' with { type: 'json' };
import { MINION_API_BASE } from '../config/api.js';

type MinionData = {
	id?: string;
	user_id?: string;
	qp?: number;
	skills_xp?: Record<string, number>;
	minigames?: Record<string, number>;
	bank?: Record<string, number>;
	equipped_item_ids?: number[];
	gear?: {
		pet?: number | null;
		[key: string]: unknown;
	};
};

type FishableSubfish = {
	level: number;
	xp: number;
	intercept: number;
	slope: number;
	id: number;
};

type FishableEntry = {
	name: string;
	subfishes: FishableSubfish[];
	qp_required?: number;
	skill_reqs?: Partial<Record<'agility' | 'strength', number>>;
	ticks_per_roll: number;
	lost_ticks: number;
	banking_time?: number;
};

type MethodEstimate = {
	name: string;
	command: string;
	xpPerHour: number;
	note?: string;
};

const fishables = fishablesRaw as FishableEntry[];

const powerfishConfig: Record<string, { ticksPerRoll: number; lostTicks: number }> = {
	'Trout/Salmon': { ticksPerRoll: 3, lostTicks: 0.05 },
	'Tuna/Swordfish': { ticksPerRoll: 2, lostTicks: 0.05 },
	Lobster: { ticksPerRoll: 3, lostTicks: 0.05 },
	Shark: { ticksPerRoll: 2, lostTicks: 0.05 },
	'Barbarian fishing': { ticksPerRoll: 3, lostTicks: 0.05 }
};

const ANGLER_OUTFIT_IDS = [13258, 13259, 13260, 13261];
const ANGLER_BOOST_BY_ID: Record<number, number> = {
	13258: 0.4, // Angler hat
	13259: 0.8, // Angler top
	13260: 0.6, // Angler waders
	13261: 0.2 // Angler boots
};
const HARPOON_BOOSTS: Array<{ id: number; boostPercent: number }> = [
	{ id: 23762, boostPercent: 35 }, // Crystal harpoon
	{ id: 21028, boostPercent: 20 }, // Dragon harpoon
	{ id: 21031, boostPercent: 20 } // Infernal harpoon
];
const ITEM_NAMES: Record<number, string> = {
	13258: 'Angler hat',
	13259: 'Angler top',
	13260: 'Angler waders',
	13261: 'Angler boots',
	23762: 'Crystal harpoon',
	21028: 'Dragon harpoon',
	21031: 'Infernal harpoon'
};
const MAX_VIRTUAL_LEVEL = levelFromXP(200_000_000);

function levelFromXP(xp: number): number {
	if (xp <= 0) return 1;
	let points = 0;
	let output = 1;
	for (let lvl = 1; lvl <= 126; lvl++) {
		points += Math.floor(lvl + 300 * 2 ** (lvl / 7));
		const levelXP = Math.floor(points / 4);
		if (levelXP > xp) {
			break;
		}
		output = lvl + 1;
	}
	return Math.min(126, Math.max(1, output - 1));
}

function clamp01(num: number) {
	return Math.max(0, Math.min(1, num));
}

function getBankAmount(bank: Record<string, number> | undefined, itemID: number) {
	if (!bank) return 0;
	return bank[String(itemID)] ?? 0;
}

function getEquippedItemIDs(data: MinionData): Set<number> {
	if (Array.isArray(data.equipped_item_ids)) {
		return new Set(data.equipped_item_ids.filter(id => typeof id === 'number'));
	}

	const itemIDs = new Set<number>();
	const gear = data.gear;
	if (!gear) return itemIDs;

	for (const [setupName, setupData] of Object.entries(gear)) {
		if (setupName === 'pet') continue;
		if (!setupData || typeof setupData !== 'object') continue;
		for (const slotData of Object.values(setupData as Record<string, unknown>)) {
			if (!slotData || typeof slotData !== 'object') continue;
			const maybeItem = (slotData as { item?: unknown }).item;
			if (typeof maybeItem === 'number') {
				itemIDs.add(maybeItem);
			}
		}
	}

	return itemIDs;
}

function getAvailableItemIDs(data: MinionData): Set<number> {
	const available = getEquippedItemIDs(data);
	const bank = data.bank ?? {};
	for (const [idStr, amount] of Object.entries(bank)) {
		if (typeof amount !== 'number' || amount <= 0) continue;
		const id = Number(idStr);
		if (Number.isFinite(id)) available.add(id);
	}
	return available;
}

function estimateFishXpPerHour({
	fish,
	fishingLevel,
	agilityLevel,
	strengthLevel,
	powerfish,
	harpoonBoostMultiplier,
	anglerBoostPercent
}: {
	fish: FishableEntry;
	fishingLevel: number;
	agilityLevel: number;
	strengthLevel: number;
	powerfish: boolean;
	harpoonBoostMultiplier: number;
	anglerBoostPercent: number;
}) {
	const isBarbarian = fish.name === 'Barbarian fishing';

	let effectiveFishingLevel = fishingLevel;
	if (fishingLevel > 68) {
		if (['Shark', 'Mackerel/Cod/Bass', 'Lobster'].includes(fish.name)) {
			effectiveFishingLevel += 7;
		} else if (fish.name === 'Tuna/Swordfish' && !powerfish) {
			effectiveFishingLevel += 7;
		}
	}

	let expectedXPPerRoll = 0;
	let catchChancePerRoll = 0;
	let remaining = 1;
	for (let i = fish.subfishes.length - 1; i >= 0; i--) {
		const sub = fish.subfishes[i];
		if (fishingLevel < sub.level) continue;

		if (isBarbarian && sub.id === 11330 && (agilityLevel < 30 || strengthLevel < 30)) continue;
		if (isBarbarian && sub.id === 11332 && (agilityLevel < 45 || strengthLevel < 45)) continue;

		const catchChance = clamp01(
			(sub.intercept + (effectiveFishingLevel - 1) * sub.slope) *
				(['Tuna/Swordfish', 'Shark'].includes(fish.name) ? harpoonBoostMultiplier : 1)
		);
		const actualChance = remaining * catchChance;
		expectedXPPerRoll += actualChance * sub.xp;
		catchChancePerRoll += actualChance;
		remaining *= 1 - catchChance;
	}

	if (catchChancePerRoll <= 0 || expectedXPPerRoll <= 0) return 0;

	let ticksPerRoll = fish.ticks_per_roll;
	let lostTicks = fish.lost_ticks;
	let bankingTicks = fish.banking_time ?? 0;

	const config = powerfishConfig[fish.name];
	if (powerfish) {
		if (config) {
			ticksPerRoll = config.ticksPerRoll;
			lostTicks = config.lostTicks;
		}
		bankingTicks = 0;
	}

	const baseTicksPerRoll = ticksPerRoll * (1 + lostTicks);
	const bankingTicksPerRoll = powerfish ? 0 : (catchChancePerRoll / 26) * bankingTicks;
	const secondsPerRoll = (baseTicksPerRoll + bankingTicksPerRoll) * 0.6;

	const baseXPPerHour = (expectedXPPerRoll / secondsPerRoll) * 3600;
	return baseXPPerHour * (1 + anglerBoostPercent / 100);
}

function getAnglerBoostPercent(equippedItemIDs: Set<number>) {
	const equippedPieces = ANGLER_OUTFIT_IDS.filter(id => equippedItemIDs.has(id));
	if (equippedPieces.length === ANGLER_OUTFIT_IDS.length) return 2.5;
	return equippedPieces.reduce((sum, id) => sum + (ANGLER_BOOST_BY_ID[id] ?? 0), 0);
}

function getHarpoonBoostMultiplier(availableItemIDs: Set<number>) {
	for (const harpoon of HARPOON_BOOSTS) {
		if (availableItemIDs.has(harpoon.id)) {
			return 1 + harpoon.boostPercent / 100;
		}
	}
	return 1;
}

function estimateAerialXpPerHour(fishingLevel: number, hunterLevel: number) {
	if (fishingLevel < 43 || hunterLevel < 35) return 0;
	const maxRoll = Math.ceil((fishingLevel * 2 + hunterLevel) / 3);
	const outcomes = maxRoll + 1;

	const canCommon = fishingLevel >= 56 && hunterLevel >= 51;
	const canMottled = fishingLevel >= 73 && hunterLevel >= 68;
	const canSiren = fishingLevel >= 91 && hunterLevel >= 87;

	const sirenOutcomes = canSiren && maxRoll >= 82 ? maxRoll - 82 + 1 : 0;
	const mottledRangeMax = Math.min(maxRoll, 81);
	const mottledOutcomes = canMottled && mottledRangeMax >= 67 ? mottledRangeMax - 67 + 1 : 0;
	const commonRangeMax = Math.min(maxRoll, 66);
	const commonOutcomes = canCommon && commonRangeMax >= 52 ? commonRangeMax - 52 + 1 : 0;

	const pSiren = sirenOutcomes / outcomes;
	const pMottled = mottledOutcomes / outcomes;
	const pCommon = commonOutcomes / outcomes;
	const pBluegill = Math.max(0, 1 - pSiren - pMottled - pCommon);

	const expectedXpPerCatch = pBluegill * 11.5 + pCommon * 40 + pMottled * 65 + pSiren * 100;
	const avgSecondsPerCatch = 4.75;
	return (expectedXpPerCatch / avgSecondsPerCatch) * 3600;
}

function estimateTemporossXpPerHour(fishingLevel: number, temporossKC: number) {
	if (fishingLevel < 35) return 0;
	const levelPercentBoost = (fishingLevel + 1) / 10;
	const kcPercentBoost = Math.min(100, temporossKC) / 10;

	let secondsPerKill = 15 * 60;
	secondsPerKill *= 1 - levelPercentBoost / 100;
	secondsPerKill *= 1 - kcPercentBoost / 100;

	const xpPerKill = 5500 * (fishingLevel / 40);
	return (xpPerKill / secondsPerKill) * 3600;
}

function getFishingEstimates(data: MinionData | null): MethodEstimate[] {
	if (!data) return [];
	const skillsXP = data.skills_xp ?? {};
	const fishingLevel = levelFromXP(skillsXP.fishing ?? 0);
	const agilityLevel = levelFromXP(skillsXP.agility ?? 0);
	const strengthLevel = levelFromXP(skillsXP.strength ?? 0);
	const hunterLevel = levelFromXP(skillsXP.hunter ?? 0);
	const qp = data.qp ?? 0;
	const bank = data.bank ?? {};
	const temporossKC = data.minigames?.tempoross ?? 0;
	const equippedItemIDs = getEquippedItemIDs(data);
	const availableItemIDs = getAvailableItemIDs(data);
	const anglerBoostPercent = getAnglerBoostPercent(equippedItemIDs);
	const harpoonBoostMultiplier = getHarpoonBoostMultiplier(equippedItemIDs);

	const hasAnglerOutfitEquippedOrInBank = ANGLER_OUTFIT_IDS.every(id => {
		return getBankAmount(bank, id) > 0 || equippedItemIDs.has(id);
	});

	const estimates: MethodEstimate[] = [];
	for (const fish of fishables) {
		const minLevel = Math.min(...fish.subfishes.map(sub => sub.level));
		if (fishingLevel < minLevel) continue;
		if (fish.qp_required && qp < fish.qp_required) continue;
		if (fish.skill_reqs?.agility && agilityLevel < fish.skill_reqs.agility) continue;
		if (fish.skill_reqs?.strength && strengthLevel < fish.skill_reqs.strength) continue;
		if (fish.name === 'Minnow' && !hasAnglerOutfitEquippedOrInBank) continue;
		const requirementNotes: string[] = [];
		if (fish.qp_required) requirementNotes.push(`QP ${fish.qp_required}+`);
		if (fish.skill_reqs?.agility) requirementNotes.push(`Agility ${fish.skill_reqs.agility}+`);
		if (fish.skill_reqs?.strength) requirementNotes.push(`Strength ${fish.skill_reqs.strength}+`);
		if (fish.name === 'Minnow') requirementNotes.push('Angler outfit (equipped or banked)');

		const normalXp = estimateFishXpPerHour({
			fish,
			fishingLevel,
			agilityLevel,
			strengthLevel,
			powerfish: false,
			harpoonBoostMultiplier,
			anglerBoostPercent
		});
		if (normalXp > 0) {
			const dynamicNotes = [...requirementNotes];
			if (anglerBoostPercent > 0) dynamicNotes.push(`Angler XP +${anglerBoostPercent.toFixed(1)}%`);
			if (harpoonBoostMultiplier > 1 && ['Tuna/Swordfish', 'Shark'].includes(fish.name)) {
				dynamicNotes.push(`Harpoon catch-rate boost x${harpoonBoostMultiplier.toFixed(2)}`);
			}
			const missingAnglerPieces = ANGLER_OUTFIT_IDS.filter(
				id => availableItemIDs.has(id) && !equippedItemIDs.has(id)
			).map(id => ITEM_NAMES[id]);
			if (missingAnglerPieces.length > 0) {
				dynamicNotes.push(`Equip for boost: ${missingAnglerPieces.join(', ')}`);
			}
			if (['Tuna/Swordfish', 'Shark'].includes(fish.name) && harpoonBoostMultiplier === 1) {
				const bestOwnedHarpoon = HARPOON_BOOSTS.find(h => availableItemIDs.has(h.id));
				if (bestOwnedHarpoon && !equippedItemIDs.has(bestOwnedHarpoon.id)) {
					dynamicNotes.push(`Equip for boost: ${ITEM_NAMES[bestOwnedHarpoon.id]}`);
				}
			}
			estimates.push({
				name: fish.name,
				command: `/fish name:${fish.name}`,
				xpPerHour: normalXp,
				note: dynamicNotes.join(' | ')
			});
		}

		const canPowerfish = Boolean(powerfishConfig[fish.name]) && !['Minnow', 'Karambwanji'].includes(fish.name);
		if (canPowerfish) {
			const powerXp = estimateFishXpPerHour({
				fish,
				fishingLevel,
				agilityLevel,
				strengthLevel,
				powerfish: true,
				harpoonBoostMultiplier,
				anglerBoostPercent
			});
			if (powerXp > 0) {
				const powerfishNotes = [...requirementNotes, 'Powerfish'];
				if (anglerBoostPercent > 0) powerfishNotes.push(`Angler XP +${anglerBoostPercent.toFixed(1)}%`);
				if (harpoonBoostMultiplier > 1 && ['Tuna/Swordfish', 'Shark'].includes(fish.name)) {
					powerfishNotes.push(`Harpoon catch-rate boost x${harpoonBoostMultiplier.toFixed(2)}`);
				}
				const missingAnglerPieces = ANGLER_OUTFIT_IDS.filter(
					id => availableItemIDs.has(id) && !equippedItemIDs.has(id)
				).map(id => ITEM_NAMES[id]);
				if (missingAnglerPieces.length > 0) {
					powerfishNotes.push(`Equip for boost: ${missingAnglerPieces.join(', ')}`);
				}
				if (['Tuna/Swordfish', 'Shark'].includes(fish.name) && harpoonBoostMultiplier === 1) {
					const bestOwnedHarpoon = HARPOON_BOOSTS.find(h => availableItemIDs.has(h.id));
					if (bestOwnedHarpoon && !equippedItemIDs.has(bestOwnedHarpoon.id)) {
						powerfishNotes.push(`Equip for boost: ${ITEM_NAMES[bestOwnedHarpoon.id]}`);
					}
				}
				estimates.push({
					name: `${fish.name} (Powerfish)`,
					command: `/fish name:${fish.name} powerfish:true`,
					xpPerHour: powerXp,
					note: powerfishNotes.join(' | ')
				});
			}
		}
	}

	const aerialXP = estimateAerialXpPerHour(fishingLevel, hunterLevel);
	if (aerialXP > 0) {
		estimates.push({
			name: 'Aerial fishing',
			command: '/activities aerial_fishing',
			xpPerHour: aerialXP,
			note: 'Fishing 43+ | Hunter 35+'
		});
	}

	const temporossXP = estimateTemporossXpPerHour(fishingLevel, temporossKC);
	if (temporossXP > 0) {
		estimates.push({
			name: 'Tempoross',
			command: '/k name:Tempoross',
			xpPerHour: temporossXP,
			note: 'Fishing 35+'
		});
	}

	return estimates.sort((a, b) => b.xpPerHour - a.xpPerHour);
}

function getTheoreticalBestFishingEstimate(): MethodEstimate | null {
	const fishingLevel = MAX_VIRTUAL_LEVEL;
	const agilityLevel = MAX_VIRTUAL_LEVEL;
	const strengthLevel = MAX_VIRTUAL_LEVEL;
	const hunterLevel = MAX_VIRTUAL_LEVEL;
	const qp = 999;
	const temporossKC = 100;
	const hasAnglerOutfitEquippedOrInBank = true;
	const anglerBoostPercent = 2.5;
	const harpoonBoostMultiplier = 1.35;

	const estimates: MethodEstimate[] = [];
	for (const fish of fishables) {
		const minLevel = Math.min(...fish.subfishes.map(sub => sub.level));
		if (fishingLevel < minLevel) continue;
		if (fish.qp_required && qp < fish.qp_required) continue;
		if (fish.skill_reqs?.agility && agilityLevel < fish.skill_reqs.agility) continue;
		if (fish.skill_reqs?.strength && strengthLevel < fish.skill_reqs.strength) continue;
		if (fish.name === 'Minnow' && !hasAnglerOutfitEquippedOrInBank) continue;

		const normalXp = estimateFishXpPerHour({
			fish,
			fishingLevel,
			agilityLevel,
			strengthLevel,
			powerfish: false,
			harpoonBoostMultiplier,
			anglerBoostPercent
		});
		if (normalXp > 0) {
			estimates.push({
				name: fish.name,
				command: `/fish name:${fish.name}`,
				xpPerHour: normalXp,
				note: 'Theoretical max setup'
			});
		}

		const canPowerfish = Boolean(powerfishConfig[fish.name]) && !['Minnow', 'Karambwanji'].includes(fish.name);
		if (canPowerfish) {
			const powerXp = estimateFishXpPerHour({
				fish,
				fishingLevel,
				agilityLevel,
				strengthLevel,
				powerfish: true,
				harpoonBoostMultiplier,
				anglerBoostPercent
			});
			if (powerXp > 0) {
				estimates.push({
					name: `${fish.name} (Powerfish)`,
					command: `/fish name:${fish.name} powerfish:true`,
					xpPerHour: powerXp,
					note: 'Theoretical max setup'
				});
			}
		}
	}

	const aerialXP = estimateAerialXpPerHour(fishingLevel, hunterLevel);
	if (aerialXP > 0) {
		estimates.push({
			name: 'Aerial fishing',
			command: '/activities aerial_fishing',
			xpPerHour: aerialXP,
			note: 'Theoretical max setup'
		});
	}

	const temporossXP = estimateTemporossXpPerHour(fishingLevel, temporossKC);
	if (temporossXP > 0) {
		estimates.push({
			name: 'Tempoross',
			command: '/k name:Tempoross',
			xpPerHour: temporossXP,
			note: 'Theoretical max setup'
		});
	}

	return estimates.sort((a, b) => b.xpPerHour - a.xpPerHour)[0] ?? null;
}

function getTheoreticalRequirementsForMethodName(methodName: string): number[] {
	const required = [...ANGLER_OUTFIT_IDS];
	if (methodName.includes('Tuna/Swordfish') || methodName.includes('Shark')) {
		required.push(23762); // Crystal harpoon
	}
	return required;
}

function getTheoreticalSkillRequirementsForMethodName(methodName: string): Array<{ skill: string; target: number }> {
	if (methodName === 'Aerial fishing') {
		return [
			{ skill: 'Fishing', target: MAX_VIRTUAL_LEVEL },
			{ skill: 'Hunter', target: MAX_VIRTUAL_LEVEL }
		];
	}
	if (methodName === 'Tempoross') {
		return [{ skill: 'Fishing', target: MAX_VIRTUAL_LEVEL }];
	}
	const baseName = methodName.replace(' (Powerfish)', '');
	const matchedFish = fishables.find(fish => fish.name === baseName);
	if (!matchedFish) return [{ skill: 'Fishing', target: MAX_VIRTUAL_LEVEL }];
	const reqs: Array<{ skill: string; target: number }> = [{ skill: 'Fishing', target: MAX_VIRTUAL_LEVEL }];
	if (matchedFish.skill_reqs?.agility) reqs.push({ skill: 'Agility', target: matchedFish.skill_reqs.agility });
	if (matchedFish.skill_reqs?.strength) reqs.push({ skill: 'Strength', target: matchedFish.skill_reqs.strength });
	return reqs;
}

function buildSkillingEquipCommand(itemNames: string[]): string {
	const deduped = [...new Set(itemNames)];
	return `/gear equip gear_setup:skilling items:${deduped.join(', ')}`;
}

export function FishingAdvisor() {
	const [userID, setUserID] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<MinionData | null>(null);
	const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

	const methods = useMemo(() => getFishingEstimates(data), [data]);
	const topMethod = methods[0];
	const theoreticalBestMethod = useMemo(() => getTheoreticalBestFishingEstimate(), []);
	const gapToTheoreticalBest =
		topMethod && theoreticalBestMethod ? Math.max(0, theoreticalBestMethod.xpPerHour - topMethod.xpPerHour) : null;
	const currentVsTheoreticalPct =
		topMethod && theoreticalBestMethod && theoreticalBestMethod.xpPerHour > 0
			? Math.min(100, (topMethod.xpPerHour / theoreticalBestMethod.xpPerHour) * 100)
			: null;
	const currentFishingLevel = data ? levelFromXP(data.skills_xp?.fishing ?? 0) : null;
	const currentHunterLevel = data ? levelFromXP(data.skills_xp?.hunter ?? 0) : null;
	const currentAgilityLevel = data ? levelFromXP(data.skills_xp?.agility ?? 0) : null;
	const currentStrengthLevel = data ? levelFromXP(data.skills_xp?.strength ?? 0) : null;
	const equippedItemIDs = data ? getEquippedItemIDs(data) : new Set<number>();
	const availableItemIDs = data ? getAvailableItemIDs(data) : new Set<number>();
	const theoreticalSkillMissing: string[] = [];
	let theoreticalEquipNow: string[] = [];
	let theoreticalNeedItems: string[] = [];
	let theoreticalEquipCommand: string | null = null;
	if (data && theoreticalBestMethod) {
		const currentLevels: Record<string, number> = {
			Fishing: currentFishingLevel ?? 1,
			Hunter: currentHunterLevel ?? 1,
			Agility: currentAgilityLevel ?? 1,
			Strength: currentStrengthLevel ?? 1
		};
		for (const req of getTheoreticalSkillRequirementsForMethodName(theoreticalBestMethod.name)) {
			const current = currentLevels[req.skill] ?? 1;
			if (current < req.target) theoreticalSkillMissing.push(`${req.skill} ${current}/${req.target}`);
		}
		const requiredItems = getTheoreticalRequirementsForMethodName(theoreticalBestMethod.name);
		const canEquipNow = requiredItems
			.filter(id => availableItemIDs.has(id) && !equippedItemIDs.has(id))
			.map(id => ITEM_NAMES[id] ?? `Item ${id}`);
		const notOwnedYet = requiredItems
			.filter(id => !availableItemIDs.has(id))
			.map(id => ITEM_NAMES[id] ?? `Item ${id}`);
		theoreticalEquipNow = canEquipNow;
		theoreticalNeedItems = notOwnedYet;
		if (canEquipNow.length > 0) {
			theoreticalEquipCommand = buildSkillingEquipCommand(canEquipNow);
		}
	}

	const copyCommandToClipboard = async (command: string) => {
		try {
			await navigator.clipboard.writeText(command);
			setCopiedCommand(command);
			setTimeout(() => setCopiedCommand(current => (current === command ? null : current)), 1200);
		} catch {
			setError('Could not copy command from browser clipboard.');
		}
	};

	return (
		<div className="mt-3">
			<div className="flex flex-col">
				<label for="fishing-user" className="font-bold">
					Discord User ID
				</label>
				<div className="no_margin">
					<input
						id="fishing-user"
						name="fishing-user"
						value={userID}
						onInput={e => setUserID(e.currentTarget.value.trim())}
						className="w-52 input"
					/>
					<button
						className="button"
						type="button"
						disabled={isLoading || !userID}
						onClick={() => {
							setError(null);
							setIsLoading(true);
							fetch(`${MINION_API_BASE}/minion/${userID}`)
								.then(async response => {
									const payload = await response.json().catch(() => null);
									if (!response.ok || !payload || typeof payload !== 'object') {
										const apiMessage =
											payload && typeof payload === 'object' && 'message' in payload
												? String((payload as { message?: string }).message)
												: null;
										if (response.status === 404) {
											throw new Error(
												'No public OSB minion data was found for this ID (404). Check the ID, or that this account has an OSB minion.'
											);
										}
										throw new Error(apiMessage ?? `Lookup failed (${response.status}).`);
									}
									setData(payload as MinionData);
								})
								.catch(err => {
									setData(null);
									setError(err instanceof Error ? err.message : 'Could not load this minion.');
								})
								.finally(() => setIsLoading(false));
						}}
					>
						Look Up
					</button>
				</div>
			</div>

			{error ? <p>{error}</p> : null}

			{data ? (
				<>
					{topMethod ? (
						<p>
							Best estimated Fishing XP/hr: <strong>{topMethod.name}</strong> (~
							{Math.round(topMethod.xpPerHour).toLocaleString()}/hr)
						</p>
					) : (
						<p>No eligible Fishing methods found for this account yet.</p>
					)}
					{theoreticalBestMethod ? (
						<p>
							Theoretical best possible in bot (max virtual stats + best setup):{' '}
							<strong>{theoreticalBestMethod.name}</strong> (~
							{Math.round(theoreticalBestMethod.xpPerHour).toLocaleString()}/hr)
							{gapToTheoreticalBest !== null && currentVsTheoreticalPct !== null ? (
								<>
									{' '}
									| Gap:{' '}
									<strong>
										{Math.round(gapToTheoreticalBest).toLocaleString()}/hr (
										{currentVsTheoreticalPct.toFixed(1)}% of theoretical)
									</strong>
								</>
							) : null}
						</p>
					) : null}
					{theoreticalSkillMissing.length > 0 ||
					theoreticalEquipNow.length > 0 ||
					theoreticalNeedItems.length > 0 ? (
						<p>
							Missing for theoretical best:{' '}
							{theoreticalSkillMissing.length > 0 ? (
								<strong>{theoreticalSkillMissing.join(' | ')}</strong>
							) : null}
							{theoreticalSkillMissing.length > 0 &&
							(theoreticalEquipNow.length > 0 || theoreticalNeedItems.length > 0)
								? ' | '
								: null}
							{theoreticalEquipNow.length > 0 ? (
								<>
									<strong>Equip: {theoreticalEquipNow.join(', ')}</strong>
									{theoreticalEquipCommand ? (
										<>
											{' '}
											(
											<button
												type="button"
												className={`discord_command_copy${
													copiedCommand === theoreticalEquipCommand ? ' copied' : ''
												}`}
												onClick={() => copyCommandToClipboard(theoreticalEquipCommand!)}
											>
												{copiedCommand === theoreticalEquipCommand
													? 'Copied'
													: theoreticalEquipCommand}
											</button>
											)
										</>
									) : null}
								</>
							) : null}
							{theoreticalEquipNow.length > 0 && theoreticalNeedItems.length > 0 ? ' | ' : null}
							{theoreticalNeedItems.length > 0 ? (
								<strong>Need item: {theoreticalNeedItems.join(', ')}</strong>
							) : null}
						</p>
					) : null}
					<table>
						<thead>
							<tr>
								<th>Method</th>
								<th>Estimated Fishing XP/hr</th>
								<th>Command</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
							{methods.slice(0, 15).map(method => (
								<tr key={`${method.name}:${method.command}`}>
									<td>{method.name}</td>
									<td>{Math.round(method.xpPerHour).toLocaleString()}</td>
									<td>
										<button
											className={`discord_command_copy${copiedCommand === method.command ? ' copied' : ''}`}
											type="button"
											onClick={() => copyCommandToClipboard(method.command)}
										>
											{copiedCommand === method.command ? 'Copied' : method.command}
										</button>
									</td>
									<td>{method.note ?? ''}</td>
								</tr>
							))}
						</tbody>
					</table>
					<p>
						Privacy: this only shows method recommendations and XP rates. It does not show bank quantities,
						bank value, or item lists.
					</p>
					<p>Note: Minnow eligibility uses the same equipped-or-bank rule as `/fish`.</p>
				</>
			) : null}
		</div>
	);
}
