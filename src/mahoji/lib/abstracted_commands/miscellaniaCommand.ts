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

	await transactItems({ userID: user.id, itemsToAdd: loot, collectionLog: true });

	return `You collected ${loot}.`;
}
