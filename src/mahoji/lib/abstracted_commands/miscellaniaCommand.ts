import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { mahojiUserSettingsUpdate } from '../../../lib/MUser';
import { formatDuration, hasSkillReqs } from '../../../lib/util';
import { royalTroubleRequirements } from '../../../lib/skilling/functions/questRequirements';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import type { ActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';

export interface MiscWorkerAllocation {
	woodcutting: number;
	mining: number;
	fishingRaw: number;
	fishingCooked: number;
	herbs: number;
	flax: number;
	hardwoodMahogany: number;
	hardwoodTeak: number;
	hardwoodBoth: number;
	farmSeeds: number;
}

export interface MiscellaniaData {
	approval: number;
	coffer: number;
	lastCollect: number;
	maintainApproval: boolean;
	workers: number;
	allocation: MiscWorkerAllocation;
}

export function defaultMiscellaniaData(): MiscellaniaData {
	return {
		approval: 100,
		coffer: 0,
		lastCollect: Date.now(),
		maintainApproval: false,
		workers: 10,
		allocation: {
			woodcutting: 5,
			mining: 5,
			fishingRaw: 0,
			fishingCooked: 0,
			herbs: 0,
			flax: 0,
			hardwoodMahogany: 0,
			hardwoodTeak: 0,
			hardwoodBoth: 0,
			farmSeeds: 0
		}
	};
}

export async function fetchMiscellaniaData(user: MUser): Promise<MiscellaniaData> {
	const data = (user.user.minion_miscellania as MiscellaniaData | null) ?? defaultMiscellaniaData();
	return { ...defaultMiscellaniaData(), ...data };
}

export async function updateMiscellaniaData(user: MUser, data: Partial<MiscellaniaData>) {
	const current = await fetchMiscellaniaData(user);
	const newData = { ...current, ...data };
	await mahojiUserSettingsUpdate(user.id, { minion_miscellania: newData as any });
	return newData;
}

function hasRoyalTrouble(user: MUser): boolean {
	const [hasReqs] = hasSkillReqs(user, royalTroubleRequirements);
	if (!hasReqs || user.QP < 56) return false;
	return true;
}

function simulateDay(state: MiscellaniaData, royalTrouble: boolean): number {
	const maxWithdraw = royalTrouble ? 75000 : 50000;
	const withdraw = Math.min(5 + Math.floor(state.coffer / 10), maxWithdraw, state.coffer);
	state.coffer -= withdraw;

	const workerEffectiveness = Math.floor((withdraw * 100) / 8333);
	const resourcePoints = Math.floor((workerEffectiveness * state.approval) / 100);

	if (!state.maintainApproval && state.approval > 32) {
		const decay = royalTrouble ? 131 : 160;
		state.approval = Math.max(32, state.approval - Math.ceil((decay - state.approval) / 15));
	}

	return resourcePoints;
}

function gatherCategory(bank: Bank, category: keyof MiscWorkerAllocation, workers: number, resourcePoints: number) {
	if (workers <= 0) return;
	const output = Math.floor((workers * resourcePoints) / 10);
	switch (category) {
		case 'woodcutting':
			bank.add('Maple logs', output);
			bank.add('Bird nest (seed)', Math.floor(output / 100));
			break;
		case 'mining':
			bank.add('Coal', output);
			bank.add('Uncut sapphire', Math.floor(output / 200));
			break;
		case 'fishingRaw':
			bank.add('Raw tuna', Math.floor(output * 0.5));
			bank.add('Raw swordfish', Math.floor(output * 0.15));
			break;
		case 'fishingCooked':
			bank.add('Tuna', Math.floor(output * 0.5));
			bank.add('Swordfish', Math.floor(output * 0.15));
			break;
		case 'herbs':
			bank.add('Grimy ranarr weed', Math.floor(output / 100));
			bank.add('Grimy harralander', Math.floor(output / 100));
			break;
		case 'flax':
			bank.add('Flax', output);
			bank.add('Ranarr seed', Math.floor(output / 500));
			break;
		case 'hardwoodMahogany':
			bank.add('Mahogany logs', output);
			break;
		case 'hardwoodTeak':
			bank.add('Teak logs', output);
			break;
		case 'hardwoodBoth':
			bank.add('Mahogany logs', Math.floor(output * 0.5));
			bank.add('Teak logs', Math.floor(output * 0.5));
			break;
		case 'farmSeeds':
			bank.add('Apple tree seed', Math.floor(output / 500));
			bank.add('Ranarr seed', Math.floor(output / 300));
			break;
	}
}

export async function miscellaniaDepositCommand(user: MUser, amount: number) {
	const state = await fetchMiscellaniaData(user);
	const maxCoffer = hasRoyalTrouble(user) ? 7_500_000 : 5_000_000;
	const deposit = Math.max(0, amount);
	state.coffer = Math.min(state.coffer + deposit, maxCoffer);
	await updateMiscellaniaData(user, state);
	return `Deposited ${deposit.toLocaleString()} GP into your coffer. New balance: ${state.coffer.toLocaleString()} GP.`;
}

export async function miscellaniaStatusCommand(user: MUser) {
	const state = await fetchMiscellaniaData(user);
	const days = Math.floor((Date.now() - state.lastCollect) / Time.Day);
	return `Approval: ${state.approval.toFixed(1)}%\nCoffer: ${state.coffer.toLocaleString()} gp\nDays since last collect: ${days}`;
}

export async function miscellaniaApprovalCommand(user: MUser, channelID: string) {
	const state = await fetchMiscellaniaData(user);
	const missingApproval = 100 - state.approval;

	if (missingApproval <= 0) {
		return 'Your approval is already at 100%.';
	}

	const duration = missingApproval * 20_000;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithNoChanges>({
		type: 'Miscellania',
		duration,
		userID: user.id,
		channelID: channelID.toString()
	});

	return `${user.minionName} is working to restore your approval! It will take around ${formatDuration(duration)} to finish.`;
}

export async function miscellaniaCollectCommand(user: MUser) {
	const state = await fetchMiscellaniaData(user);
	const royalTrouble = hasRoyalTrouble(user);
	const days = Math.floor((Date.now() - state.lastCollect) / Time.Day);
	if (days <= 0) return 'Nothing to collect yet.';

	let resourcePoints = 0;
	for (let i = 0; i < days; i++) {
		resourcePoints += simulateDay(state, royalTrouble);
	}
	resourcePoints = Math.min(262143, resourcePoints);
	state.lastCollect = Date.now();
	await updateMiscellaniaData(user, state);

	const loot = new Bank();
	for (const [category, workers] of Object.entries(state.allocation) as [keyof MiscWorkerAllocation, number][]) {
		gatherCategory(loot, category, workers, resourcePoints);
	}

	return `You collected ${loot}.`;
}
