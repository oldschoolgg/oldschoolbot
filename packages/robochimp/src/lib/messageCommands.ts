import { userMention } from '@oldschoolgg/discord';

import type { RUser } from '@/structures/RUser.js';
import { type Bits, bitsDescriptions } from '../util.js';

export async function getInfoStrOfUser(roboChimpUser: RUser) {
	const djsUser = await globalClient.fetchUser(roboChimpUser.id.toString()).catch(() => null);

	const linkedAccounts = await roboChimpUser.findGroup();
	let tier = `Tier ${roboChimpUser.perkTier?.number ?? 'None'}`;

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

	const richMember = await globalClient.fetchMainServerMember(roboChimpUser.id.toString()).catch(() => null);
	if (richMember) {
		result.push({
			name: 'Roles',
			value: richMember.roles_detailed.map(role => role.name).join(', ')
		});
	}

	return `${djsUser?.username} (${djsUser?.id})
${result.map(r => `**${r.name}:** ${r.value}`).join('\n')}`;
}
