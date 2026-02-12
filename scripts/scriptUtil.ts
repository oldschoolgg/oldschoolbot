import './base.js';

import { type ExecOptions, exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';
import { Stopwatch } from '@oldschoolgg/toolkit';
import { Bank, Items, LootTable } from 'oldschooljs';
import { isFunction, isObjectType, toSnakeCase } from 'remeda';

import { SlayerRewardsShop } from '@/lib/slayer/slayerUnlocks.js';

const rawExecAsync = promisify(execNonPromise);

export async function execAsync(command: string | string[], options?: ExecOptions): Promise<void> {
	try {
		console.log('   Running command:', command);

		const results = Array.isArray(command)
			? await Promise.all(command.map(cmd => rawExecAsync(cmd, options)))
			: [await rawExecAsync(command, options)];

		for (const result of results) {
			if (result.stderr) {
				console.error(result.stderr);
			}
		}
	} catch (err) {
		console.error(err);
	}
}

export async function runTimedLoggedFn(name: string, fn: () => unknown) {
	const stopwatch = new Stopwatch();
	console.log(`Starting ${name}...`);
	await fn();
	stopwatch.stop();
	console.log(`${name} completed in ${stopwatch.toString()}`);
}

export function serializeSnapshotItem(item: any): any {
	if (!isObjectType(item)) return item;
	if (Array.isArray(item)) return item.map(serializeSnapshotItem);

	// Items
	const mustHaveKeys = ['id', 'name'];
	const optionalKeys = ['tradeable', 'equipment', 'equipable', 'cost', 'lowalch', 'members'];
	const isItem =
		mustHaveKeys.every(k => k in item) && (optionalKeys.some(k => k in item) || Object.keys(item).length === 2);
	if (isItem && 'name' in item) {
		return item.name;
	}

	const result: any = {};
	for (let [key, value] of Object.entries(item) as [string, any][]) {
		const isObj = isObjectType(value);

		key = toSnakeCase(key);

		// Slayer Unlocks
		if (key === 'required_slayer_unlocks' && Array.isArray(value)) {
			result[key] = value.map((v: any) => SlayerRewardsShop.find(_t => _t.id === v)!.name);
			continue;
		}

		// Item arrays
		const notItemKeys = ['burn_kourend_bonus'];
		const definitelyItemKeys = ['items', 'all_items'];
		if (
			Array.isArray(value) &&
			value.every(
				i => typeof i === 'number' && Items.has(i) && (definitelyItemKeys.includes(key) ? true : i > 100)
			) &&
			!notItemKeys.includes(key)
		) {
			result[key] = Util.ItemArr(value);
			continue;
		}

		// LootTable
		if (value instanceof LootTable || (isObj && 'cachedOptimizedTable' in value)) {
			continue;
		}

		// Bank
		if (isObj && (value instanceof Bank || 'frozen' in value) && 'toJSON' in value && isFunction(value.toJSON)) {
			result[key] = (value as Bank).toJSON();
			continue;
		}

		// Monsters
		if (
			isObj &&
			'data' in value &&
			'aliases' in value &&
			'allItems' in value &&
			'kill' in value &&
			isFunction(value.kill)
		) {
			continue;
		}

		// Items
		if (
			isObj &&
			'id' in value &&
			'name' in value &&
			('tradeable' in value || 'customItemData' in value || 'wiki_name' in value || 'equipable' in value)
		) {
			result[key] = value.name;
			continue;
		}

		if (key === 'aliases' || key === 'alias') {
			continue;
		}

		if (Array.isArray(value)) {
			result[key] = value.map(serializeSnapshotItem);
			continue;
		}

		if (isObjectType(value) && 'toJSON' in value && isFunction(value.toJSON)) {
			result[key] = (value as any).toJSON();
			continue;
		}

		result[key] = serializeSnapshotItem(value);
	}

	return result;
}

export const Util = {
	ItemName: (input: number | string) => Items.getItem(input)?.name ?? '???UNKNOWN???',
	ItemArr: (arr: Parameters<typeof Items.deepResolveNames>[0]) => {
		const res = Items.deepResolveNames(arr, { sort: 'alphabetical' });
		return res;
	}
};
