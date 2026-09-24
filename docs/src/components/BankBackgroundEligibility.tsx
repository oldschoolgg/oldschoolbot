import { useMemo, useState } from 'preact/hooks';

import { WebItems } from '../lib/WebItems.js';

type BackgroundRequirement = {
	id: number;
	name: string;
	available: boolean;
	perkTierNeeded: number | null;
	sacValueRequired: number | null;
	bitfield: number | null;
	skillsNeeded: Record<string, number>;
	collectionLogItemsNeeded: string[];
};

type Props = {
	backgrounds: BackgroundRequirement[];
};

type MinionPayload = Record<string, unknown>;

type EligibilityState = 'eligible' | 'ineligible' | 'unknown';

type EligibilityResult = {
	state: EligibilityState;
	reason: string;
};

const PERK_LABELS: Record<number, string> = {
	2: 'Tier 1',
	3: 'Tier 2',
	4: 'Tier 3',
	5: 'Tier 4',
	6: 'Tier 5'
};

const PET_REQ_NAMES = ['Rocky', 'Bloodhound', 'Giant squirrel', 'Baby chinchompa'];
const PET_REQ_IDS = PET_REQ_NAMES.map(name => WebItems.get(name).item?.id).filter(
	(id): id is number => typeof id === 'number'
);

function readPath<T>(obj: Record<string, unknown>, paths: string[]): T | undefined {
	for (const path of paths) {
		const segments = path.split('.');
		let current: unknown = obj;
		let ok = true;
		for (const segment of segments) {
			if (!current || typeof current !== 'object' || !(segment in current)) {
				ok = false;
				break;
			}
			current = (current as Record<string, unknown>)[segment];
		}
		if (ok) return current as T;
	}
	return undefined;
}

function readNumber(obj: Record<string, unknown>, paths: string[]): number | null {
	const val = readPath<unknown>(obj, paths);
	if (typeof val === 'number' && Number.isFinite(val)) return val;
	if (typeof val === 'string' && !Number.isNaN(Number(val))) return Number(val);
	return null;
}

function readNumberArray(obj: Record<string, unknown>, paths: string[]): number[] | null {
	const val = readPath<unknown>(obj, paths);
	if (!Array.isArray(val)) return null;
	return val.filter(v => typeof v === 'number' && Number.isFinite(v));
}

function readSkills(obj: Record<string, unknown>): Record<string, number> | null {
	const fromLevels = readPath<Record<string, unknown>>(obj, ['skillsAsLevels', 'user.skillsAsLevels']);
	if (fromLevels && typeof fromLevels === 'object') {
		const output: Record<string, number> = {};
		for (const [key, value] of Object.entries(fromLevels)) {
			if (typeof value === 'number' && Number.isFinite(value)) output[key] = value;
		}
		return output;
	}

	const maybeSkills = readPath<Record<string, unknown>>(obj, ['skills', 'user.skills']);
	if (!maybeSkills || typeof maybeSkills !== 'object') return null;

	const output: Record<string, number> = {};
	for (const [key, value] of Object.entries(maybeSkills)) {
		if (typeof value === 'number' && Number.isFinite(value) && value <= 200) {
			output[key] = value;
		}
	}
	return Object.keys(output).length > 0 ? output : null;
}

function readCLBank(obj: Record<string, unknown>): Record<string, number> | null {
	const cl = readPath<Record<string, unknown>>(obj, ['collectionLogBank', 'user.collectionLogBank', 'cl', 'user.cl']);
	if (!cl || typeof cl !== 'object') return null;
	const out: Record<string, number> = {};
	for (const [key, value] of Object.entries(cl)) {
		if (typeof value === 'number' && value > 0) out[key] = value;
	}
	return out;
}

async function fetchMinionData(discordID: string): Promise<MinionPayload> {
	const endpoints = [`https://api.oldschool.gg/minion/${discordID}`, `https://oldschool.gg/api/minion/${discordID}`];

	for (const endpoint of endpoints) {
		try {
			const res = await fetch(endpoint);
			if (!res.ok) continue;
			const contentType = res.headers.get('content-type') ?? '';
			if (!contentType.includes('application/json')) continue;
			const json = (await res.json()) as MinionPayload;
			return json;
		} catch {}
	}

	throw new Error('Failed to fetch minion data. The public API may be unavailable right now.');
}

function checkBackgroundEligibility(
	background: BackgroundRequirement,
	user: {
		perkTier: number | null;
		sacrificedValue: number | null;
		bitfield: number[] | null;
		skills: Record<string, number> | null;
		clBank: Record<string, number> | null;
	}
): EligibilityResult {
	if (!background.available) {
		return { state: 'ineligible', reason: 'Currently unavailable.' };
	}

	if (background.sacValueRequired) {
		if (user.sacrificedValue === null) {
			return { state: 'unknown', reason: 'Needs sacrificed GP check, but this profile did not include it.' };
		}
		if (user.sacrificedValue < background.sacValueRequired) {
			return {
				state: 'ineligible',
				reason: `Requires ${background.sacValueRequired.toLocaleString()} sacrificed GP.`
			};
		}
	}

	if (Object.keys(background.skillsNeeded).length > 0) {
		if (!user.skills) {
			return { state: 'unknown', reason: 'Needs skill check, but this profile did not include skill levels.' };
		}
		for (const [skill, level] of Object.entries(background.skillsNeeded)) {
			if ((user.skills[skill] ?? 0) < level) {
				return {
					state: 'ineligible',
					reason: `Missing skill requirement: ${skill} ${level}.`
				};
			}
		}
	}

	if (background.bitfield !== null) {
		if (!user.bitfield) {
			return { state: 'unknown', reason: 'Needs unlock check, but this profile did not include bitfields.' };
		}
		if (!user.bitfield.includes(background.bitfield)) {
			return { state: 'ineligible', reason: 'Requires a special unlock.' };
		}
	}

	if (background.collectionLogItemsNeeded.length > 0) {
		if (!user.clBank) {
			return {
				state: 'unknown',
				reason: 'Needs Collection Log check, but this profile did not include Collection Log data.'
			};
		}

		const missing: string[] = [];
		for (const itemName of background.collectionLogItemsNeeded) {
			const item = WebItems.get(itemName).item;
			if (!item) continue;
			if (!user.clBank[String(item.id)]) missing.push(itemName);
		}
		if (missing.length > 0) {
			return {
				state: 'ineligible',
				reason: `Missing Collection Log item(s): ${missing.join(', ')}.`
			};
		}
	}

	if (background.perkTierNeeded) {
		if (user.perkTier === null) {
			return {
				state: 'unknown',
				reason: `Needs ${PERK_LABELS[background.perkTierNeeded] ?? 'patron tier'} check, but this profile did not include tier data.`
			};
		}
		if (user.perkTier < background.perkTierNeeded) {
			return {
				state: 'ineligible',
				reason: `Requires ${PERK_LABELS[background.perkTierNeeded] ?? `perk tier ${background.perkTierNeeded}`}.`
			};
		}
	}

	if (background.name === 'Pets') {
		if (!user.clBank) {
			return {
				state: 'unknown',
				reason: 'Needs pet Collection Log check, but this profile did not include Collection Log data.'
			};
		}
		const hasPet = PET_REQ_IDS.some(id => Boolean(user.clBank![String(id)]));
		if (!hasPet) {
			return {
				state: 'ineligible',
				reason: `Requires one of: ${PET_REQ_NAMES.join(', ')}.`
			};
		}
	}

	return { state: 'eligible', reason: 'Eligible based on available profile data.' };
}

export function BankBackgroundEligibility({ backgrounds }: Props) {
	const [userID, setUserID] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [payload, setPayload] = useState<MinionPayload | null>(null);

	const eligibilityResults = useMemo(() => {
		if (!payload) return [];

		const normalized = {
			perkTier: readNumber(payload, ['perk_tier', 'perkTier', 'user.perk_tier', 'user.perkTier']),
			sacrificedValue: readNumber(payload, ['sacrificedValue', 'user.sacrificedValue']),
			bitfield: readNumberArray(payload, ['bitfield', 'user.bitfield']),
			skills: readSkills(payload),
			clBank: readCLBank(payload)
		};

		return backgrounds
			.map(background => ({
				background,
				result: checkBackgroundEligibility(background, normalized)
			}))
			.sort((a, b) => a.background.id - b.background.id);
	}, [backgrounds, payload]);

	const totals = useMemo(() => {
		let eligible = 0;
		let ineligible = 0;
		let unknown = 0;
		for (const item of eligibilityResults) {
			if (item.result.state === 'eligible') eligible++;
			if (item.result.state === 'ineligible') ineligible++;
			if (item.result.state === 'unknown') unknown++;
		}
		return { eligible, ineligible, unknown };
	}, [eligibilityResults]);

	return (
		<div className="bank-bg-eligibility">
			<p>
				Enter your Discord user ID to check your current bank background eligibility. This uses the same
				requirement rules as the bot where possible.
			</p>
			<div className="no_margin">
				<input
					className="input w-52"
					placeholder="Discord User ID"
					value={userID}
					onInput={e => setUserID(e.currentTarget.value)}
				/>
				<button
					className="button"
					type="button"
					disabled={loading || !userID.trim()}
					onClick={async () => {
						setLoading(true);
						setError(null);
						try {
							const data = await fetchMinionData(userID.trim());
							setPayload(data);
						} catch (err) {
							setPayload(null);
							setError(err instanceof Error ? err.message : 'Failed to fetch user data.');
						} finally {
							setLoading(false);
						}
					}}
				>
					{loading ? 'Checking...' : 'Check Eligibility'}
				</button>
			</div>
			{error ? <p className="bank-bg-error">{error}</p> : null}
			{eligibilityResults.length > 0 ? (
				<>
					<p>
						Eligible: {totals.eligible} | Not eligible: {totals.ineligible} | Unknown: {totals.unknown}
					</p>
					<table>
						<thead>
							<tr>
								<th>Background</th>
								<th>Status</th>
								<th>Reason</th>
							</tr>
						</thead>
						<tbody>
							{eligibilityResults.map(({ background, result }) => (
								<tr key={background.id}>
									<td>
										{background.name} #{background.id}
									</td>
									<td
										className={
											result.state === 'eligible'
												? 'bank-bg-ok'
												: result.state === 'ineligible'
													? 'bank-bg-no'
													: 'bank-bg-unknown'
										}
									>
										{result.state}
									</td>
									<td>{result.reason}</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			) : null}
		</div>
	);
}
