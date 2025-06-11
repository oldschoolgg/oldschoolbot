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
		allocation: { woodcutting: 5, mining: 5 }
	};
}

function hasRoyalTrouble(user: MUser): boolean {
	const [hasReqs] = hasSkillReqs(user, royalTroubleRequirements);
	if (!hasReqs || user.QP < 56) {
		return false;
	}
	return true;
}

function approvalDecay(current: number, royalTrouble: boolean): number {
	if (current <= 32) return 32;
	const decay = royalTrouble ? 131 : 160;
	return Math.max(32, current - Math.ceil((decay - current) / 15));
}

export async function fetchMiscellaniaData(user: MUser): Promise<MiscellaniaData> {
	const data = (user.user.minion_miscellania as MiscellaniaData | null) ?? defaultMiscellaniaData();
	return data;
}

export async function updateMiscellaniaData(user: MUser, data: Partial<MiscellaniaData>) {
	const current = await fetchMiscellaniaData(user);
	const newData = { ...current, ...data };
	await mahojiUserSettingsUpdate(user.id, { minion_miscellania: newData as any });
	return newData;
}

function simulateDay(state: MiscellaniaData, royalTrouble: boolean): number {
	const maxWithdraw = royalTrouble ? 75_000 : 50_000;
	const withdraw = Math.min(Math.floor(state.coffer / 10), maxWithdraw);
	state.coffer -= withdraw;
	const effective = (withdraw * state.approval) / 100;
	state.approval = state.maintainApproval ? 100 : approvalDecay(state.approval, royalTrouble);
	return effective;
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

	let totalEffective = 0;
	for (let i = 0; i < days; i++) {
		totalEffective += simulateDay(state, royalTrouble);
	}
	state.lastCollect = Date.now();
	await updateMiscellaniaData(user, state);

	const allocation = state.allocation;
	const totalWorkers = royalTrouble ? 15 : 10;

	const woodShare = allocation.woodcutting / totalWorkers;
	const miningShare = allocation.mining / totalWorkers;

	const mapleLogs = Math.floor((woodShare * totalEffective) / 56.1);
	const coal = Math.floor((miningShare * totalEffective) / 91.6);

	const loot = new Bank().add('Maple logs', mapleLogs).add('Coal', coal);

	return `You collected ${loot}.`;
}
