import { Prisma, User } from '@prisma/client';
import { notEmpty } from 'e';
import { Items } from 'oldschooljs';

import { mahojiUserSettingsUpdate } from '../../mahoji/mahojiSettings';
import { GearSetup, GearSetupTypes } from '../gear';
import { ItemBank } from '../types';
import { moidLink } from '../util';

export async function repairBrokenItemsFromUser(user: User): Promise<[string] | [string, any[]]> {
	const changes: Prisma.UserUpdateArgs['data'] = {};
	const rawBank = user.bank as ItemBank;
	const rawCL = user.collectionLogBank as ItemBank;
	const rawTempCL = user.temp_cl as ItemBank;
	const rawSB = user.sacrificedBank as ItemBank;
	const favorites = user.favoriteItems;

	const rawAllGear = GearSetupTypes.map(i => user[`gear_${i}`]);
	const allGearItemIDs = rawAllGear
		.filter(notEmpty)
		.map((b: any) =>
			Object.values(b)
				.filter(notEmpty)
				.map((i: any) => i.item)
		)
		.flat(Infinity);

	const brokenBank: number[] = [];
	const allItemsToCheck = [
		['bank', Object.keys(rawBank)],
		['cl', Object.keys(rawCL)],
		['tempcl', Object.keys(rawTempCL)],
		['sacbank', Object.keys(rawSB)],
		['favs', favorites],
		['gear', allGearItemIDs]
	] as const;

	for (const [, ids] of allItemsToCheck) {
		for (const id of ids.map(i => Number(i))) {
			const item = Items.get(id);
			if (!item) {
				brokenBank.push(id);
			}
		}
	}

	const newFavs = favorites.filter(i => !brokenBank.includes(i));

	const newBank = { ...rawBank };
	const newCL = { ...rawCL };
	const newTempCL = { ...rawTempCL };
	const newSB = { ...rawSB };
	for (const id of brokenBank) {
		delete newBank[id];
		delete newCL[id];
		delete newTempCL[id];
		delete newSB[id];
	}

	for (const setupType of GearSetupTypes) {
		const _gear = user[`gear_${setupType}`] as GearSetup | null;
		if (_gear === null) continue;
		const gear = { ..._gear };
		for (const [key, value] of Object.entries(gear)) {
			if (value === null) continue;
			if (brokenBank.includes(value.item)) {
				delete gear[key as keyof GearSetup];
			}
		}
		// @ts-ignore ???
		changes[`gear_${setupType}`] = gear;
	}

	if (brokenBank.length > 0) {
		changes.favoriteItems = newFavs;
		changes.bank = newBank;
		changes.collectionLogBank = newCL;
		changes.temp_cl = newTempCL;
		changes.sacrificedBank = newSB;
		if (newFavs.includes(NaN) || [newBank, newCL, newTempCL, newSB].some(i => Boolean(i['NaN']))) {
			return ['Oopsie...'];
		}

		await mahojiUserSettingsUpdate(user.id, changes);

		return [
			`You had ${
				brokenBank.length
			} broken items in your bank/collection log/sacrifices/favorites/gear, they were removed. ${moidLink(
				brokenBank
			).slice(0, 500)}`,
			Object.keys(brokenBank)
		];
	}

	return ['You have no broken items on your account!'];
}
