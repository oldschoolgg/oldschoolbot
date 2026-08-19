import { userMention } from '@oldschoolgg/discord';

import type { RUser } from '@/structures/RUser.js';
import { type Bits, bitsDescriptions } from '../util.js';

export async function getInfoStrOfUser(roboChimpUser: RUser) {
	const linkedAccounts = await roboChimpUser.findGroup();
	let tier = roboChimpUser.perkTierDisplay;

	if (roboChimpUser.patreonId) {
		tier += ' Patreon';
	}
	if (roboChimpUser.githubId) {
		tier += ' Github';
	}

	const isBlacklisted =
		(await roboChimpClient.blacklistedEntity.count({
			where: {
				id: roboChimpUser.id,
				type: 'user'
			}
		})) > 0;

	const result: { name: string; value: string }[] = [
		{
			name: 'Linked Accounts',
			value: linkedAccounts.length === 1 ? 'None' : linkedAccounts.map(id => userMention(id)).join(' ')
		},
		{
			name: 'Perk Tier',
			value: tier
		},
		{
			name: 'RoboChimp Bitfield',
			value: roboChimpUser.bits.map(bit => bitsDescriptions[bit as Bits]!.description).join(', ')
		},
		{
			name: 'Blacklisted',
			value: isBlacklisted ? 'Yes' : 'No'
		}
	];

	result.push({
		name: 'Global OSBSO Mastery%',
		value: `${roboChimpUser.globalMastery().toFixed(2)}%`
	});

	result.push({
		name: 'Global OSBSO CL%',
		value: `${roboChimpUser.globalCLPercent().toFixed(1)}%`
	});

	return `${roboChimpUser.id}
${result.map(r => `**${r.name}:** ${r.value}`).join('\n')}`;
}
