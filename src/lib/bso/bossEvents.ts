import { Time } from '@oldschoolgg/toolkit';
import { formatDuration } from '@oldschoolgg/toolkit/util';
import { EmbedBuilder, type TextChannel } from 'discord.js';
import { Items } from 'oldschooljs';

import { getPHeadDescriptor } from '@/lib/bso/pumpkinHead.js';
import { globalConfig } from '@/lib/constants.js';
import { BossInstance, type BossOptions, type BossUser } from '../structures/Boss.js';
import type { NewBossOptions } from '../types/minions.js';
import { logError } from '../util/logError.js';

interface BossEvent {
	id: number;
	name: string;
	bossOptions: Omit<BossOptions, 'leader' | 'channel' | 'massText' | 'settingsKeys'>;
	handleFinish: (options: NewBossOptions, bossUsers: BossUser[]) => Promise<void>;
}

export const bossEventChannelID = globalConfig.isProduction ? '897170239333220432' : '1023760501957722163';

export const scaryEatables = [
	{
		item: Items.getOrThrow('Candy teeth'),
		healAmount: 3
	},
	{
		item: Items.getOrThrow('Toffeet'),
		healAmount: 5
	},
	{
		item: Items.getOrThrow('Chocolified skull'),
		healAmount: 8
	},
	{
		item: Items.getOrThrow('Rotten sweets'),
		healAmount: 9
	},
	{
		item: Items.getOrThrow('Hairyfloss'),
		healAmount: 12
	},
	{
		item: Items.getOrThrow('Eyescream'),
		healAmount: 13
	},
	{
		item: Items.getOrThrow('Goblinfinger soup'),
		healAmount: 20
	},
	{
		item: Items.getOrThrow("Benny's brain brew"),
		healAmount: 50
	},
	{
		item: Items.getOrThrow('Roasted newt'),
		healAmount: 120
	}
];

export const bossEvents: BossEvent[] = [];

export async function bossActiveIsActiveOrSoonActive(id?: BossEvent['id']) {
	const results = await prisma.activity.findMany({
		where: {
			completed: false,
			type: 'BossEvent'
		}
	});

	const otherResults = await prisma.bossEvent.findMany({
		where: {
			completed: false,
			start_date: {
				lt: new Date(Date.now() + Time.Minute * 20)
			},
			id:
				id === undefined
					? undefined
					: {
							not: id
						}
		}
	});

	return results.length > 0 || otherResults.length > 0;
}

export async function startBossEvent({ boss, id }: { boss: BossEvent; id?: BossEvent['id'] }) {
	if (await bossActiveIsActiveOrSoonActive(id)) {
		throw new Error('There is already a boss event activity going on.');
	}
	const channel = globalClient.channels.cache.get(bossEventChannelID) as TextChannel;
	const instance = new BossInstance({
		...boss.bossOptions,
		channel,
		massText: `<@&896845245873025067> Pumpkinhead the Pumpkinheaded ${getPHeadDescriptor()} ${getPHeadDescriptor()} Horror has spawned! Who will fight him?!`,
		allowedMentions: { roles: ['896845245873025067'] },
		quantity: 1,
		leader: await mUserFetch(globalConfig.adminUserIDs[0])
	});
	try {
		const { bossUsers } = await instance.start();
		const embed = new EmbedBuilder()
			.setDescription(
				`A group of ${bossUsers.length} users is off to fight ${
					boss.name
				}, good luck! The total trip will take ${formatDuration(instance.duration)}.`
			)
			.setImage('https://cdn.discordapp.com/attachments/357422607982919680/896527691849826374/PHEAD.png')
			.setColor('#ff9500');

		return channel.send({
			embeds: [embed],
			content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.',
			allowedMentions: {
				roles: ['896845245873025067']
			}
		});
	} catch (err: unknown) {
		logError(err);
	}
}
