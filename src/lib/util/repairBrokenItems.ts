import { deepEqual, deepObjectDiff } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';
import { deepClone, notEmpty, uniqueArr } from 'e';
import { Items } from 'oldschooljs';

import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { type GearSetup, type GearSetupType, GearSetupTypes } from '../gear';

import type { ItemBank } from '../types';
import { moidLink } from '../util';

type GearX = Required<Record<`gear_${GearSetupType}`, GearSetup | null>>;
type Changes = {
	bank: ItemBank;
	collectionLogBank: ItemBank;
	sacrificedBank: ItemBank;
	favoriteItems: number[];
	tames: { id: number; max_total_loot: ItemBank; fed_items: ItemBank }[];
} & GearX;

export async function repairBrokenItemsFromUser(mUser: MUser) {
	const previousUser = deepClone(mUser.user);

	const { user } = mUser;
	const userTames = await prisma.tame.findMany({
		where: {
			user_id: mUser.id
		}
	});
	const __currentValues: Changes = {
		bank: user.bank as ItemBank,
		collectionLogBank: user.collectionLogBank as ItemBank,
		sacrificedBank: (await mUser.fetchStats({ sacrificed_bank: true })).sacrificed_bank as ItemBank,
		favoriteItems: user.favoriteItems,
		tames: userTames.map(t => ({
			id: t.id,
			max_total_loot: t.max_total_loot as ItemBank,
			fed_items: t.fed_items as ItemBank
		})),
		gear_fashion: user.gear_fashion as GearSetup | null,
		gear_melee: user.gear_melee as GearSetup | null,
		gear_mage: user.gear_mage as GearSetup | null,
		gear_range: user.gear_range as GearSetup | null,
		gear_misc: user.gear_misc as GearSetup | null,
		gear_other: user.gear_other as GearSetup | null,
		gear_skilling: user.gear_skilling as GearSetup | null,
		gear_wildy: user.gear_wildy as GearSetup | null
	};
	const currentValues: Changes = deepClone(__currentValues);
	const currentGearValues = [
		currentValues.gear_fashion,
		currentValues.gear_melee,
		currentValues.gear_mage,
		currentValues.gear_range,
		currentValues.gear_misc,
		currentValues.gear_other,
		currentValues.gear_skilling,
		currentValues.gear_wildy
	].filter(notEmpty);

	const allGearItemIDs = currentGearValues
		.map(b => {
			const gear = b as GearSetup | null;
			if (!gear) return [];
			return Object.values(gear)
				.filter(notEmpty)
				.map(i => i.item);
		})
		.flat(2);

	// Find broken items
	const allItemsToCheck = uniqueArr([
		...Object.keys(currentValues.bank),
		...Object.keys(currentValues.collectionLogBank),
		...Object.keys(currentValues.sacrificedBank),
		...currentValues.favoriteItems,
		...allGearItemIDs
	]).map(id => Number(id));
	const brokenBank: number[] = [];
	for (const id of allItemsToCheck) {
		const item = Items.get(id);
		if (!item) brokenBank.push(id);
	}

	// Fix
	const newValues = deepClone(currentValues);
	newValues.favoriteItems = currentValues.favoriteItems.filter(i => !brokenBank.includes(i));
	for (const id of brokenBank) {
		delete newValues.bank[id];
		delete newValues.collectionLogBank[id];
		delete newValues.sacrificedBank[id];
		for (const tame of newValues.tames) {
			delete tame.fed_items[id];
			delete tame.max_total_loot[id];
		}
	}
	for (const setupType of GearSetupTypes) {
		const _gear = currentValues[`gear_${setupType}`] as GearSetup | null;
		if (_gear === null) continue;
		const gear = { ..._gear };
		for (const [key, value] of Object.entries(gear)) {
			if (value === null) continue;
			if (brokenBank.includes(value.item)) {
				gear[key as keyof GearSetup] = null;
			}
		}
		newValues[`gear_${setupType}`] = gear;
	}

	// If there are broken items, update the user
	if (brokenBank.length > 0) {
		const changes: Prisma.UserUpdateArgs['data'] = {};

		if (!deepEqual(currentValues.bank, newValues.bank)) {
			changes.bank = newValues.bank;
		}
		if (!deepEqual(currentValues.collectionLogBank, newValues.collectionLogBank)) {
			changes.collectionLogBank = newValues.collectionLogBank;
		}

		if (!deepEqual(currentValues.favoriteItems, newValues.favoriteItems)) {
			changes.favoriteItems = newValues.favoriteItems;
		}
		for (const setupType of GearSetupTypes) {
			if (!deepEqual(currentValues[`gear_${setupType}`], newValues[`gear_${setupType}`])) {
				changes[`gear_${setupType}`] = newValues[`gear_${setupType}`] as any as Prisma.InputJsonValue;
			}
		}

		if (Object.values(changes).length > 0) {
			debugLog(`${mUser.logName} repair bank: 
Broken Items: ${brokenBank.join(', ')}	
Changes: ${JSON.stringify(changes, null, '	')}
Previous User: ${JSON.stringify(previousUser)}
`);

			await mUser.update(changes);
			await mUser.sync();

			debugLog(`${mUser.logName} repair bank: 
New User: ${JSON.stringify(mUser.user)}
`);
		}

		for (const tame of newValues.tames) {
			await prisma.tame.update({
				where: {
					id: tame.id
				},
				data: {
					max_total_loot: tame.max_total_loot,
					fed_items: tame.fed_items
				}
			});
		}

		if (!deepEqual(currentValues.sacrificedBank, newValues.sacrificedBank)) {
			debugLog(
				`${mUser.logName} repair bank sacrifice bank changes: ${JSON.stringify(deepObjectDiff(currentValues.sacrificedBank, newValues.sacrificedBank))}`
			);
			await userStatsUpdate(
				mUser.id,
				{
					sacrificed_bank: newValues.sacrificedBank
				},
				{}
			);
		}

		return `You had ${
			brokenBank.length
		} broken items in your bank/collection log/favorites/gear/tame, they were removed. ${moidLink(brokenBank).slice(
			0,
			500
		)}`;
	}

	return 'You have no broken items on your account!';
}
