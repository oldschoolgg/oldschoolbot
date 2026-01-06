import { randInt } from '@oldschoolgg/rng';
import type { IAutoCompleteInteractionOption } from '@oldschoolgg/schemas';
import { stringMatches, toTitleCase } from '@oldschoolgg/toolkit';
import { Monsters } from 'oldschooljs';

import { PerkTier } from '@/lib/constants.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { SlayerRewardsShop } from '@/lib/slayer/slayerUnlocks.js';
import { assignNewSlayerTask, getAssignableSlayerTaskIDs, getCommonTaskName } from '@/lib/slayer/slayerUtil.js';
import type { SlayerMaster, SlayerSkipSettings } from '@/lib/slayer/types.js';
import { patronMsg } from '@/lib/util/smallUtils.js';

const MAX_AUTOCOMPLETE_RESULTS = 25;
const AUTO_SKIP_COST = 30;
const MAX_AUTO_SKIP_ATTEMPTS = 20;

const slayerMonsterChoices = Array.from(
	new Map(
		slayerMasters
			.flatMap(master => master.tasks.map(task => [task.monster.id, getCommonTaskName(task.monster)] as const))
			.map(([id, name]) => [id, name])
	).entries()
).map(([, name]) => ({ name, value: name }));
slayerMonsterChoices.sort((a, b) => a.name.localeCompare(b.name));

export function getMasterKey(master: SlayerMaster): string {
	return master.aliases[0];
}

export function resolveSlayerMaster(input: string | undefined | null): SlayerMaster | null {
	if (!input) return null;
	return (
		slayerMasters.find(m => stringMatches(m.name, input) || m.aliases.some(alias => stringMatches(alias, input))) ??
		null
	);
}

export function findTaskForMaster(master: SlayerMaster, monsterInput: string | undefined) {
	if (!monsterInput) return null;
	const task = master.tasks.find(taskOption => {
		if (stringMatches(taskOption.monster.name, monsterInput)) return true;
		if (stringMatches(getCommonTaskName(taskOption.monster), monsterInput)) return true;
		if (taskOption.monster.aliases?.some(alias => stringMatches(alias, monsterInput))) return true;
		return stringMatches(taskOption.monster.id.toString(), monsterInput);
	});
	if (!task) return null;
	return {
		task,
		monsterID: task.monster.id,
		monsterName: getCommonTaskName(task.monster)
	};
}

export function getMasterSkipEntry(masterKey: string, monsterIDs: number[]) {
	const master =
		slayerMasters.find(
			m => getMasterKey(m) === masterKey || m.aliases.some(alias => stringMatches(alias, masterKey))
		) ?? null;
	const masterName = master?.name ?? toTitleCase(masterKey);
	const monsterNames = monsterIDs
		.map(id => {
			const taskFromMaster = master?.tasks.find(t => t.monster.id === id);
			if (taskFromMaster) {
				return getCommonTaskName(taskFromMaster.monster);
			}
			return Monsters.get(id)?.name ?? `Monster ${id}`;
		})
		.filter(Boolean);
	return { masterName, monsterNames };
}

export function formatSkipList(settings: SlayerSkipSettings): string {
	const entries = Object.entries(settings);
	const populatedEntries = entries.filter(([, monsterIDs]) => monsterIDs.length > 0);
	if (populatedEntries.length === 0) {
		return "You don't have any Slayer skip entries yet.";
	}
	const lines: string[] = [];
	for (const [key, monsterIDs] of populatedEntries) {
		const { masterName, monsterNames } = getMasterSkipEntry(key, monsterIDs);
		lines.push(`${masterName}: ${monsterNames.join(', ')}`);
	}
	return lines.join('\n');
}

export async function setSlayerAutoSkipBufferCommand(user: MUser, amount: number) {
	const perkTier = await user.fetchPerkTier();
	if (perkTier < PerkTier.Two) {
		return patronMsg(PerkTier.Two);
	}
	if (amount < 0) {
		return 'Your buffer must be 0 or greater.';
	}
	await user.setSlayerAutoSkipBuffer(amount);
	if (amount === 0) {
		return 'Auto-skip Slayer point buffer cleared.';
	}
	return `Set your auto-skip Slayer point buffer to ${amount.toLocaleString()} points.`;
}

export async function handleSlayerSkipListCommand({
	user,
	action,
	master: masterInput,
	monster: monsterInput
}: {
	user: MUser;
	action: 'add' | 'remove' | 'list';
	master?: string | null;
	monster?: string | null;
}) {
	const perkTier = await user.fetchPerkTier();
	if (perkTier < PerkTier.Two) {
		return patronMsg(PerkTier.Two);
	}

	if (action === 'list') {
		return formatSkipList(user.getSlayerSkipSettings());
	}

	if (!masterInput) {
		return 'You need to specify a Slayer master.';
	}
	if (!monsterInput) {
		return 'You need to specify a monster.';
	}

	const master = resolveSlayerMaster(masterInput);
	if (!master) {
		return `Invalid Slayer master: ${masterInput}`;
	}

	const resolvedTask = findTaskForMaster(master, monsterInput);
	if (!resolvedTask) {
		return `${master.name} doesn't assign ${monsterInput}.`;
	}

	const masterKey = getMasterKey(master);
	const assignableTaskIDs = getAssignableSlayerTaskIDs(user, master);
	if (!assignableTaskIDs.includes(resolvedTask.monsterID)) {
		return `${resolvedTask.monsterName} can't currently be assigned to you by ${master.name}.`;
	}
	const currentSettings = user.getSlayerSkipSettings();
	const currentMonsters = new Set(currentSettings[masterKey] ?? []);

	if (action === 'add') {
		currentMonsters.add(resolvedTask.monsterID);
		await user.updateSlayerSkipSettings(masterKey, [...currentMonsters]);
		const updatedSettings = user.getSlayerSkipSettings();
		const { masterName, monsterNames } = getMasterSkipEntry(masterKey, updatedSettings[masterKey] ?? []);
		const listSummary = monsterNames.length > 0 ? monsterNames.join(', ') : 'None';
		return `Added ${resolvedTask.monsterName} to ${master.name}'s skip list.\nCurrent skip list for ${masterName}: ${listSummary}`;
	}

	if (!currentMonsters.has(resolvedTask.monsterID)) {
		return `${resolvedTask.monsterName} wasn't on your ${master.name} skip list.`;
	}

	currentMonsters.delete(resolvedTask.monsterID);
	await user.updateSlayerSkipSettings(masterKey, [...currentMonsters]);
	return `Removed ${resolvedTask.monsterName} from ${master.name}'s skip list.`;
}

export async function slayerMasterAutocomplete(value: string) {
	return slayerMasters
		.filter(
			master =>
				!value || stringMatches(master.name, value) || master.aliases.some(alias => stringMatches(alias, value))
		)
		.slice(0, MAX_AUTOCOMPLETE_RESULTS)
		.map(master => ({ name: master.name, value: getMasterKey(master) }));
}

function norm(s: string) {
	return s
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function buildMonsterChoicesForMaster(master: SlayerMaster) {
	const set = new Map<number, string>();

	for (const task of master.tasks) {
		set.set(task.monster.id, getCommonTaskName(task.monster));
	}

	return [...set.values()].sort((a, b) => a.localeCompare(b)).map(name => ({ name, value: name }));
}

// value-only matcher for autocomplete
function filterChoices(choices: { name: string; value: string }[], value: string) {
	const v = norm(value ?? '');
	if (!v) return choices.slice(0, MAX_AUTOCOMPLETE_RESULTS);
	return choices.filter(c => norm(c.name).includes(v)).slice(0, MAX_AUTOCOMPLETE_RESULTS);
}

function findStringOptionValue(options: IAutoCompleteInteractionOption[] | undefined, optionName: string) {
	for (const option of options ?? []) {
		if ('value' in option && option.name === optionName && typeof option.value === 'string') {
			return option.value;
		}
		if ('options' in option) {
			const nested = findStringOptionValue(
				option.options as IAutoCompleteInteractionOption[] | undefined,
				optionName
			);
			if (nested) return nested;
		}
	}
	return null;
}

// Autocomplete that can “see” the other selected options:
export async function slayerMonsterAutocomplete({
	value,
	options
}: StringAutoComplete & { options?: IAutoCompleteInteractionOption[] }) {
	const masterInput = findStringOptionValue(options, 'master');

	if (masterInput) {
		const master = resolveSlayerMaster(masterInput);
		if (master) {
			return filterChoices(buildMonsterChoicesForMaster(master), value ?? '');
		}
	}

	// fallback: global list
	return filterChoices(slayerMonsterChoices, value ?? '');
}

type AssignedSlayerTask = Awaited<ReturnType<typeof assignNewSlayerTask>>;

export async function applySlayerTaskExtension(user: MUser, task: AssignedSlayerTask) {
	const myUnlocks = user.user.slayer_unlocks ?? [];
	const extendReward = SlayerRewardsShop.find(srs => srs.extendID?.includes(task.currentTask.monster_id));
	if (extendReward && myUnlocks.includes(extendReward.id)) {
		const quantity = task.assignedTask.extendedAmount
			? randInt(task.assignedTask.extendedAmount[0], task.assignedTask.extendedAmount[1])
			: Math.ceil(task.currentTask.quantity * extendReward.extendMult!);
		task.currentTask.quantity = quantity;
		await prisma.slayerTask.update({
			where: {
				id: task.currentTask.id
			},
			data: {
				quantity,
				quantity_remaining: quantity
			}
		});
	}
	return task;
}

export async function assignExtendedSlayerTask(user: MUser, master: SlayerMaster) {
	const newTask = await assignNewSlayerTask(user, master);
	return applySlayerTaskExtension(user, newTask);
}

export async function autoSkipFromSkipList({
	user,
	master,
	initialTask
}: {
	user: MUser;
	master: SlayerMaster;
	initialTask: AssignedSlayerTask;
}) {
	const masterKey = getMasterKey(master);
	const skipList = new Set(user.getSlayerSkipSettings()[masterKey] ?? []);
	if (skipList.size === 0) {
		return { finalTask: initialTask, skippedTasks: 0, stopReason: undefined, finalTaskWasSkipped: false };
	}

	const perkTier = await user.fetchPerkTier();
	if (perkTier < PerkTier.Two) {
		return { finalTask: initialTask, skippedTasks: 0, stopReason: undefined, finalTaskWasSkipped: false };
	}

	let currentTask = initialTask;
	let skippedTasks = 0;
	let stopReason: 'limit' | 'points' | 'buffer' | undefined;

	while (skipList.has(currentTask.assignedTask.monster.id)) {
		if (skippedTasks >= MAX_AUTO_SKIP_ATTEMPTS) {
			stopReason = 'limit';
			break;
		}

		const buffer = user.user.slayer_auto_skip_buffer ?? 0;
		const nextPoints = user.user.slayer_points - AUTO_SKIP_COST;
		if (nextPoints < 0) {
			stopReason = 'points';
			break;
		}
		if (nextPoints < buffer) {
			stopReason = 'buffer';
			break;
		}

		await user.update({
			slayer_points: {
				decrement: AUTO_SKIP_COST
			}
		});
		await prisma.slayerTask.update({
			where: {
				id: currentTask.currentTask.id
			},
			data: {
				skipped: true,
				quantity_remaining: 0
			}
		});
		skippedTasks += 1;
		currentTask = await assignExtendedSlayerTask(user, master);
	}

	const finalTaskWasSkipped = skipList.has(currentTask.assignedTask.monster.id);

	return {
		finalTask: currentTask,
		skippedTasks,
		stopReason,
		finalTaskWasSkipped
	};
}
