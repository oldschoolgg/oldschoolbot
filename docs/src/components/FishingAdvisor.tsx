import { useMemo, useState } from 'preact/hooks';

import fishablesRaw from '../../../data/osb/skills/fishing-fishables.json' with { type: 'json' };

type MinionData = {
	id?: string;
	user_id?: string;
	qp?: number;
	skills_xp?: Record<string, number>;
	minigames?: Record<string, number>;
	bank?: Record<string, number>;
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
};

const fishables = fishablesRaw as FishableEntry[];

const powerfishConfig: Record<string, { ticksPerRoll: number; lostTicks: number }> = {
	'Trout/Salmon': { ticksPerRoll: 3, lostTicks: 0.05 },
	'Tuna/Swordfish': { ticksPerRoll: 2, lostTicks: 0.05 },
	Lobster: { ticksPerRoll: 3, lostTicks: 0.05 },
	Shark: { ticksPerRoll: 2, lostTicks: 0.05 },
	'Barbarian fishing': { ticksPerRoll: 3, lostTicks: 0.05 }
};

const ANGLE_OUTFIT_IDS = [13258, 13259, 13260, 13261];

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

function estimateFishXpPerHour({
	fish,
	fishingLevel,
	agilityLevel,
	strengthLevel,
	powerfish
}: {
	fish: FishableEntry;
	fishingLevel: number;
	agilityLevel: number;
	strengthLevel: number;
	powerfish: boolean;
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

		const catchChance = clamp01(sub.intercept + (effectiveFishingLevel - 1) * sub.slope);
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

	return (expectedXPPerRoll / secondsPerRoll) * 3600;
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

	const hasAnglerOutfit = ANGLE_OUTFIT_IDS.every(id => getBankAmount(bank, id) > 0);

	const estimates: MethodEstimate[] = [];
	for (const fish of fishables) {
		const minLevel = Math.min(...fish.subfishes.map(sub => sub.level));
		if (fishingLevel < minLevel) continue;
		if (fish.qp_required && qp < fish.qp_required) continue;
		if (fish.skill_reqs?.agility && agilityLevel < fish.skill_reqs.agility) continue;
		if (fish.skill_reqs?.strength && strengthLevel < fish.skill_reqs.strength) continue;
		if (fish.name === 'Minnow' && !hasAnglerOutfit) continue;

		const normalXp = estimateFishXpPerHour({
			fish,
			fishingLevel,
			agilityLevel,
			strengthLevel,
			powerfish: false
		});
		if (normalXp > 0) {
			estimates.push({
				name: fish.name,
				command: `/fish name:${fish.name}`,
				xpPerHour: normalXp
			});
		}

		const canPowerfish = Boolean(powerfishConfig[fish.name]) && !['Minnow', 'Karambwanji'].includes(fish.name);
		if (canPowerfish) {
			const powerXp = estimateFishXpPerHour({
				fish,
				fishingLevel,
				agilityLevel,
				strengthLevel,
				powerfish: true
			});
			if (powerXp > 0) {
				estimates.push({
					name: `${fish.name} (Powerfish)`,
					command: `/fish name:${fish.name} powerfish:true`,
					xpPerHour: powerXp
				});
			}
		}
	}

	const aerialXP = estimateAerialXpPerHour(fishingLevel, hunterLevel);
	if (aerialXP > 0) {
		estimates.push({
			name: 'Aerial fishing',
			command: '/activities aerialfishing',
			xpPerHour: aerialXP
		});
	}

	const temporossXP = estimateTemporossXpPerHour(fishingLevel, temporossKC);
	if (temporossXP > 0) {
		estimates.push({
			name: 'Tempoross',
			command: '/activities tempoross',
			xpPerHour: temporossXP
		});
	}

	return estimates.sort((a, b) => b.xpPerHour - a.xpPerHour);
}

export function FishingAdvisor() {
	const [userID, setUserID] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<MinionData | null>(null);

	const methods = useMemo(() => getFishingEstimates(data), [data]);
	const topMethod = methods[0];

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
							fetch(`https://api.oldschool.gg/minion/${userID}`)
								.then(async response => {
									const payload = await response.json();
									if (!response.ok || !payload || typeof payload !== 'object') {
										throw new Error('Could not find that user.');
									}
									setData(payload as MinionData);
								})
								.catch(() => {
									setData(null);
									setError('Could not load this minion. Check the ID and try again.');
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
					<table>
						<thead>
							<tr>
								<th>Method</th>
								<th>Estimated Fishing XP/hr</th>
								<th>Command</th>
							</tr>
						</thead>
						<tbody>
							{methods.slice(0, 15).map(method => (
								<tr key={method.command}>
									<td>{method.name}</td>
									<td>{Math.round(method.xpPerHour).toLocaleString()}</td>
									<td>
										<code>{method.command}</code>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p>
						Privacy: this only shows method recommendations and XP rates. It does not show bank quantities,
						bank value, or item lists.
					</p>
				</>
			) : null}
		</div>
	);
}
