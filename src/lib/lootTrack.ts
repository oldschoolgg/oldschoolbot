import { cleanString, formatDuration } from '@oldschoolgg/toolkit/util';
import type { LootTrack, loot_track_type } from '@prisma/client';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import type { ItemBank } from './types';
import { makeBankImage } from './util/makeBankImage';

type TrackLootOptions =
	| {
			id: string;
			type: loot_track_type;
			duration: number;
			kc: number;
			totalLoot: Bank;
			changeType: 'loot';
			users: {
				id: string;
				loot: Bank;
				duration: number;
			}[];
	  }
	| {
			id: string;
			type: loot_track_type;
			totalCost: Bank;
			changeType: 'cost';
			users: {
				id: string;
				cost: Bank;
			}[];
	  };

async function trackIndividualsLoot({
	key,
	userID,
	data,
	bankToAdd,
	duration,
	type
}: {
	duration: number;
	bankToAdd: Bank;
	key: string;
	userID: bigint | null;
	data: TrackLootOptions;
	type: loot_track_type;
}) {
	// Find the existing loot track
	const current = await prisma.lootTrack.findFirst({
		where: {
			key,
			user_id: userID,
			type
		}
	});

	// If no existing loot track, create one.
	if (!current) {
		return prisma.lootTrack.create({
			data: {
				key,
				total_kc: data.changeType === 'loot' ? data.kc : 0,
				total_duration: duration,
				[data.changeType]: bankToAdd.toJSON(),
				type: data.type,
				user_id: userID
			}
		});
	}
	// If there was one, update it.
	return prisma.lootTrack.update({
		where: {
			id: current.id
		},
		data: {
			total_duration:
				data.changeType === 'loot'
					? {
							increment: duration
						}
					: undefined,
			total_kc:
				data.changeType === 'loot'
					? {
							increment: data.kc
						}
					: undefined,
			[data.changeType]: new Bank(current?.[data.changeType] as ItemBank | undefined).add(bankToAdd).toJSON(),
			user_id: userID
		}
	});
}

export async function trackLoot(opts: TrackLootOptions) {
	const key = cleanString(opts.id).toLowerCase().replace(/ /g, '_');
	const totalBank = opts.changeType === 'cost' ? opts.totalCost : opts.totalLoot;
	if (totalBank.length === 0) return;

	let teamDuration = 0;
	if (opts.changeType === 'loot') {
		teamDuration = Math.floor((opts.duration * opts.users.length) / Time.Minute);
	}

	if (opts.users) {
		await Promise.all(
			opts.users.map(u =>
				trackIndividualsLoot({
					key,
					bankToAdd: 'cost' in u ? u.cost : u.loot,
					duration: 'duration' in opts ? Math.floor(opts.duration / Time.Minute) : 0,
					data: opts,
					userID: BigInt(u.id),
					type: opts.type
				})
			)
		);
	}
	return trackIndividualsLoot({
		key,
		bankToAdd: totalBank,
		duration: teamDuration,
		data: opts,
		userID: null,
		type: opts.type
	});
}

export async function getAllTrackedLootForUser(userID: string) {
	return prisma.lootTrack.findMany({
		where: {
			user_id: BigInt(userID)
		}
	});
}

export async function getDetailsOfSingleTrackedLoot(user: MUser, trackedLoot: LootTrack) {
	const [cost, loot] = await Promise.all([
		makeBankImage({ bank: new Bank(trackedLoot.cost as ItemBank), title: `Cost For ${trackedLoot.key}` }),
		makeBankImage({ bank: new Bank(trackedLoot.loot as ItemBank), title: `Loot For ${trackedLoot.key}` })
	]);

	return {
		content: `Loot/Cost from ${trackedLoot.total_kc.toLocaleString()}x ${trackedLoot.key} for ${user.rawUsername}
**Total Duration:** ${formatDuration(trackedLoot.total_duration * Time.Minute)}
**Total KC:** ${trackedLoot.total_kc}`,
		files: [cost.file, loot.file]
	};
}
