import { ClueStatus, Prisma } from '@prisma/client';
import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { shuffle } from 'random-js';
import { MersenneTwister19937 } from 'random-js/dist/engine/MersenneTwister19937';

import { getMahojiBank, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { prisma } from '../settings/prisma';
import { Skills } from '../types';
import { assert } from '../util';
import { ClueTier, ClueTiers } from './clueTiers';
import { allStashUnitTiers } from './stashUnits';

export interface ClueReq {
	itemCost?: Bank;
	skillReqs?: Partial<Skills>;
	stashUnitID?: number;
	weight?: number;
	// If this exists, there is no requirement for this step.
	noReq?: true;
}

export interface ClueReqs {
	tier: ClueTier['name'];
	reqs: ClueReq[];
}

export const beginnerReqs: ClueReqs = {
	tier: 'Beginner',
	reqs: [
		...new Array(15).fill({ noReq: true }),
		{
			skillReqs: {
				cooking: 15
			}
		},
		{
			skillReqs: {
				cooking: 20
			}
		},
		{
			skillReqs: {
				fishing: 10
			}
		},
		{
			skillReqs: {
				fishing: 20
			}
		},
		{
			skillReqs: {
				mining: 15
			}
		},
		{
			skillReqs: {
				crafting: 14
			}
		},
		{
			skillReqs: {
				crafting: 18
			}
		},
		...allStashUnitTiers.find(i => i.tier === 'Beginner')!.units.map(i => ({ stashUnitID: i.id }))
	]
};

function makeClueStatus(userID: bigint, tier: ClueTier): Prisma.ClueStatusCreateInput {
	return {
		user_id: userID,
		tier: tier.enumTier,
		seed: randInt(1, 100_000_000),
		steps: randInt(tier.steps[0], tier.steps[1])
	};
}

export async function verifyClueStatusesForUser(userID: string, tier: ClueTier) {
	const clueStatuses = await prisma.clueStatus.findMany({ where: { user_id: BigInt(userID) } });
	const user = await mahojiUsersSettingsFetch(userID, { bank: true });
	const userBank = getMahojiBank(user);

	const amountOfThisTier = userBank.amount(tier.scrollID);
	if (!amountOfThisTier) return;
	const statusesOfThisTier = clueStatuses.filter(i => i.tier === tier.enumTier);
	// If they have less statuses than clues, create them
	const amountOfStatusesToMake = amountOfThisTier - statusesOfThisTier.length;
	if (amountOfStatusesToMake > 0) {
		await prisma.clueStatus.createMany({
			data: new Array(amountOfStatusesToMake).map(() => makeClueStatus(BigInt(userID), tier))
		});
	}

	const newClueStatuses = await prisma.clueStatus.findMany({ where: { user_id: BigInt(userID) } });
	const newUser = await mahojiUsersSettingsFetch(userID, { bank: true });
	const newUserBank = getMahojiBank(newUser);
	assert(newUserBank.amount(tier.scrollID) <= newClueStatuses.filter(i => i.tier === tier.enumTier).length);

	return newClueStatuses.map(parseClueStatus);
}

function parseClueStatus(status: ClueStatus) {
	const { reqs } = ClueTiers.find(i => i.enumTier === status.tier)!.reqs;
	const engine = MersenneTwister19937.seed(status.seed);
	return {
		requirements: shuffle(engine, [...reqs])
			.slice(0, status.steps)
			.filter(i => !i.noReq)
	};
}
