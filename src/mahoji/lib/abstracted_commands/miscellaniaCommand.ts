import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { mahojiUserSettingsUpdate } from '../../../lib/MUser';
import {
	type MiscWorkerAllocation,
	type MiscellaniaData,
	defaultMiscellaniaData,
	gatherCategory,
	simulateDay
} from '../../../lib/miscellania';
import { royalTroubleRequirements } from '../../../lib/skilling/functions/questRequirements';
import type { ActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatDuration, hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

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

export async function miscellaniaDepositCommand(user: MUser, amount: number) {
	const state = await fetchMiscellaniaData(user);
	const maxCoffer = hasRoyalTrouble(user) ? 7_500_000 : 5_000_000;
	const deposit = Math.max(0, Math.min(amount, maxCoffer - state.coffer));
	if (deposit === 0) {
		return `Your coffer is already at the maximum of ${maxCoffer.toLocaleString()} GP.`;
	}

	if (user.GP < deposit) {
		return "You don't have enough GP to deposit that amount.";
	}

	await user.transactItems({ itemsToRemove: new Bank().add('Coins', deposit) });
	state.coffer += deposit;
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

	await transactItems({ userID: user.id, itemsToAdd: loot, collectionLog: true });

	return `You collected ${loot}.`;
}

export async function miscellaniaAllocateCommand(user: MUser, alloc: Partial<MiscWorkerAllocation>) {
	const state = await fetchMiscellaniaData(user);
	const royalTrouble = hasRoyalTrouble(user);
	const maxWorkers = royalTrouble ? 15 : 10;
	state.workers = maxWorkers;
	const newAlloc: MiscWorkerAllocation = { ...state.allocation, ...alloc } as MiscWorkerAllocation;

	const total = Object.values(newAlloc).reduce((t, v) => t + v, 0);
	if (total > maxWorkers) {
		return `You only have ${maxWorkers} workers to assign.`;
	}
	if (newAlloc.fishingRaw > 0 && newAlloc.fishingCooked > 0) {
		return 'Choose either raw or cooked fishing, not both.';
	}
	if (newAlloc.herbs > 0 && newAlloc.flax > 0) {
		return 'You can assign workers to herbs or flax, not both.';
	}
	if (
		(newAlloc.hardwoodBoth > 0 && (newAlloc.hardwoodMahogany > 0 || newAlloc.hardwoodTeak > 0)) ||
		(newAlloc.hardwoodMahogany > 0 && newAlloc.hardwoodTeak > 0)
	) {
		return 'Assign hardwood workers to mahogany, teak or both - only one option.';
	}

	state.allocation = newAlloc;
	await updateMiscellaniaData(user, state);
	const summary = Object.entries(newAlloc)
		.filter(([, amt]) => amt > 0)
		.map(([k, amt]) => `${amt} ${k}`)
		.join(', ');
	return `Updated allocation: ${summary || 'no workers assigned'}.`;
}
