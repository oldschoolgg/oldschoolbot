import type { Prisma } from '@prisma/client';
import { notEmpty } from 'e';
import { Items } from 'oldschooljs';

import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { type GearSetup, GearSetupTypes } from '../gear';
import { prisma } from '../settings/prisma';
import type { ItemBank } from '../types';
import { moidLink } from '../util';

export async function repairBrokenItemsFromUser(mUser: MUser): Promise<[string] | [string, any[]]> {
	const { user } = mUser;
	const changes: Prisma.UserUpdateArgs['data'] = {};
	const rawBank = user.bank as ItemBank;
	const rawCL = user.collectionLogBank as ItemBank;
	const rawTempCL = user.temp_cl as ItemBank;

	const { sacrificed_bank: rawSacLog } = (await mUser.fetchStats({ sacrificed_bank: true })) as {
		sacrificed_bank: ItemBank;
	};

	const favorites = user.favoriteItems;
	const rawTameBanks: [number, ItemBank][] = [];
	const rawTameFeeds: [number, ItemBank][] = [];

	const userTames = await prisma.tame.findMany({
		where: {
			user_id: user.id
		}
	});
	if (userTames.length > 0) {
		for (const tame of userTames) {
			rawTameBanks.push([tame.id, tame.max_total_loot as ItemBank]);
			rawTameFeeds.push([tame.id, tame.fed_items as ItemBank]);
		}
	}

	const rawAllGear = GearSetupTypes.map(i => user[`gear_${i}`]);
	const allGearItemIDs = rawAllGear
		.filter(notEmpty)
		.map((b: any) =>
			Object.values(b)
				.filter(notEmpty)
				.map((i: any) => i.item)
		)
		.flat(Number.POSITIVE_INFINITY);

	const brokenBank: number[] = [];
	const allItemsToCheck: [string, (number | string)[]][] = [
		['bank', Object.keys(rawBank)],
		['cl', Object.keys(rawCL)],
		['tempcl', Object.keys(rawTempCL)],
		['sl', Object.keys(rawSacLog)],
		['favs', favorites],
		['gear', allGearItemIDs]
	];
	const newTameFeeds: [number, ItemBank][] = [];
	const newTameBanks: [number, ItemBank][] = [];
	for (const [tameId, tameBank] of rawTameBanks) {
		allItemsToCheck.push([`tbank-${tameId}`, Object.keys(tameBank)]);
		newTameBanks.push([tameId, { ...tameBank }]);
	}
	for (const [tameId, tameFeed] of rawTameFeeds) {
		allItemsToCheck.push([`tfeed-${tameId}`, Object.keys(tameFeed)]);
		newTameFeeds.push([tameId, { ...tameFeed }]);
	}

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
	const newSacLog = { ...rawSacLog };

	for (const id of brokenBank) {
		delete newBank[id];
		delete newCL[id];
		delete newTempCL[id];
		delete newSacLog[id];
		for (const [, tameBank] of newTameBanks) {
			delete tameBank[id];
		}
		for (const [, tameFeed] of newTameFeeds) {
			delete tameFeed[id];
		}
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
		if (newFavs.includes(Number.NaN) || [newBank, newCL, newTempCL].some(i => Boolean(i.NaN))) {
			return ['Oopsie...'];
		}

		await mUser.update(changes);
		if (userTames.length > 0) {
			for (const tame of userTames) {
				const tameBank = newTameBanks.find(tb => tb[0] === tame.id)![1];
				const tameFeed = newTameFeeds.find(tf => tf[0] === tame.id)![1];
				await prisma.tame.update({
					where: {
						id: tame.id
					},
					data: {
						max_total_loot: tameBank,
						fed_items: tameFeed
					}
				});
			}
		}
		await userStatsUpdate(
			mUser.id,
			{
				sacrificed_bank: newSacLog
			},
			{}
		);

		return [
			`You had ${
				brokenBank.length
			} broken items in your bank/collection log/favorites/gear/tame, they were removed. ${moidLink(
				brokenBank
			).slice(0, 500)}`,
			Object.keys(brokenBank)
		];
	}

	return ['You have no broken items on your account!'];
}
