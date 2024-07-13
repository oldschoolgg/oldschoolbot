import type { Prisma } from '@prisma/client';
import { notEmpty } from 'e';
import { Items } from 'oldschooljs';

import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import type { ItemBank } from '../types';
import { type GearSetup, GearSetupTypes } from '../gear/types';

interface ItemSwaps {
    item: string;
    wrongID: number;
    correctID: number;
}

const itemswaps: ItemSwaps[] = [
    {
        item: 'Bellator ring',
        wrongID: 25488,
        correctID: 28316
    },
    {
        item: 'Ultor ring',
        wrongID: 25485,
        correctID: 28307
    },
    {
        item: 'Magus ring',
        wrongID: 25486,
        correctID: 28313
    },
    {
        item: 'Venator ring',
        wrongID: 25487,
        correctID: 28310
    }
    /* TODO: id 28338 is missing from OSJS in item_data.json
    {
        item: 'Soulreaper axe',
        wrongID: 25484,
        correctID: 28338
    }
    */
]

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

    for (const [, ids] of allItemsToCheck) {
        for (const id of ids.map(i => Number(i))) {
            const item = Items.get(id);
            if (!item) {
                brokenBank.push(id);
            } else {
                const swap = itemswaps.find(s => s.wrongID === id);
                if (swap) {
                    brokenBank.push(id);
                }
            }
        }
    }

	const newFavs = favorites.filter(i => !brokenBank.includes(i));
	const newBank = { ...rawBank };
	const newCL = { ...rawCL };
	const newTempCL = { ...rawTempCL };
	const newSacLog = { ...rawSacLog };

    for (const id of brokenBank) {
        const swap = itemswaps.find(s => s.wrongID === id);
        
        if (swap) {
                newBank[swap.correctID] = (newBank[swap.correctID] || 0) + newBank[id];
                delete newBank[id];
                newCL[swap.correctID] = (newCL[swap.correctID] || 0) + newCL[id];
                delete newCL[id];
                newTempCL[swap.correctID] = (newTempCL[swap.correctID] || 0) + newTempCL[id];
                delete newTempCL[id];
                newSacLog[swap.correctID] = (newSacLog[swap.correctID] || 0) + newSacLog[id];
                delete newSacLog[id];
        } else {
            delete newBank[id];
            delete newCL[id];
            delete newTempCL[id];
            delete newSacLog[id];
        }
    }

	for (const setupType of GearSetupTypes) {
		const _gear = user[`gear_${setupType}`] as GearSetup | null;
		if (_gear === null) continue;
		const gear = { ..._gear };
		for (const [key, value] of Object.entries(gear)) {
			if (value === null) continue;
            const swap = itemswaps.find(s => s.wrongID === value.item);
            if (brokenBank.includes(value.item)) {
                delete gear[key as keyof GearSetup];
            } 
            if (swap) {
                gear[key as keyof GearSetup] = { ...value, item: swap.correctID };
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
			} broken items in your bank/collection log/favorites/gear/tame, they were removed. ${
				brokenBank
			.slice(0, 500)}`,
			Object.keys(brokenBank)
		];
	}

	return ['You have no broken items on your account!'];
}
