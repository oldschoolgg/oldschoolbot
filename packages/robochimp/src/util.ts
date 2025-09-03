import { PerkTier } from '@oldschoolgg/toolkit';
import { type MessageCreateOptions, WebhookClient } from 'discord.js';

import type { User } from '../prisma/generated/robochimp/index.js';
import { globalConfig } from './constants.js';

export async function fetchSupportServer() {
	const guild = await djsClient.guilds.fetch(globalConfig.supportServerID);
	return guild;
}

export enum Bits {
	Admin = 1,
	Mod = 2,
	Trusted = 3,
	WikiContributor = 4,
	IsContributor = 5,
	BothBotsMaxedPatronPerks = 6,
	HasPermanentTierOne = 7,
	IsPatronTier1 = 8,
	IsPatronTier2 = 9,
	IsPatronTier3 = 10,
	IsPatronTier4 = 11,
	IsPatronTier5 = 12,
	IsPatronTier6 = 13,
	HasEverBeenPatron = 14
}
type BitDescriptions = {
	[K in Bits]: { description: string };
};

export const bitsDescriptions: BitDescriptions = {
	[Bits.Admin]: { description: 'Admin' },
	[Bits.Mod]: { description: 'Moderator' },
	[Bits.Trusted]: { description: 'Trusted' },
	[Bits.WikiContributor]: { description: 'Wiki Contributor' },
	[Bits.IsContributor]: { description: 'Contributor' },
	[Bits.BothBotsMaxedPatronPerks]: { description: 'Maxed patron perks for both bots' },
	[Bits.HasPermanentTierOne]: { description: 'Has permanent Tier 1 perks' },
	[Bits.IsPatronTier1]: { description: 'Tier 1 patron' },
	[Bits.IsPatronTier2]: { description: 'Tier 2 patron' },
	[Bits.IsPatronTier3]: { description: 'Tier 3 patron' },
	[Bits.IsPatronTier4]: { description: 'Tier 4 patron' },
	[Bits.IsPatronTier5]: { description: 'Tier 5 patron' },
	[Bits.IsPatronTier6]: { description: 'Tier 6 patron' },
	[Bits.HasEverBeenPatron]: { description: 'Has been a patron before' }
};

export async function fetchUser(userID: bigint | string) {
	const result = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(userID)
		},
		create: {
			id: BigInt(userID)
		},
		update: {}
	});
	return result;
}

export const CHANNELS = {
	MODERATORS_OTHER: '830145040495411210',
	MODERATORS: '655880227469131777'
};
export const CONFUSED_MONKEY_GIF = 'https://i.imgur.com/uZwog84.gif';

enum PatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216',
	Six = '8091554'
}

export interface PatronTier {
	id: PatronTierID;
	bit: Bits;
	perkTier: PerkTier;
	number: number;
}

export const tiers: PatronTier[] = [
	{ id: PatronTierID.Six, bit: Bits.IsPatronTier6, perkTier: PerkTier.Seven, number: 6 },
	{ id: PatronTierID.Five, bit: Bits.IsPatronTier5, perkTier: PerkTier.Six, number: 5 },
	{ id: PatronTierID.Four, bit: Bits.IsPatronTier4, perkTier: PerkTier.Five, number: 4 },
	{ id: PatronTierID.Three, bit: Bits.IsPatronTier3, perkTier: PerkTier.Four, number: 3 },
	{ id: PatronTierID.Two, bit: Bits.IsPatronTier2, perkTier: PerkTier.Three, number: 2 },
	{ id: PatronTierID.One, bit: Bits.IsPatronTier1, perkTier: PerkTier.Two, number: 1 }
];

export const allPatronBits = tiers.map(t => t.bit);

export async function sendToChannelID(channelID: string, content: string | MessageCreateOptions) {
	if (!globalConfig.isProduction) return;
	const channel = djsClient.channels.cache.get(channelID);
	if (!channel || !channel.isTextBased() || channel.partial || !('send' in channel)) {
		console.error('Invalid channel');
		return;
	}
	await channel.send(content);
}

export async function findGroupOfUser(user: User) {
	if (!user.user_group_id) return [user.id.toString()];
	const group = await roboChimpClient.user.findMany({
		where: {
			user_group_id: user.user_group_id
		}
	});
	if (!group) return [user.id.toString()];
	return group.map(u => u.id.toString());
}

export const patronLogWebhook = globalConfig.isProduction
	? new WebhookClient({ url: globalConfig.patronLogWebhookURL })
	: ({} as any);
