import { EmbedBuilder, type TextChannel } from 'discord.js';
import { Time } from 'e';

import { OWNER_IDS, production } from '../config';

import { getPHeadDescriptor } from './simulation/pumpkinHead';
import { BossInstance, type BossOptions, type BossUser } from './structures/Boss';
import type { NewBossOptions } from './types/minions';
import { formatDuration } from './util';
import getOSItem from './util/getOSItem';
import { logError } from './util/logError';

interface BossEvent {
	id: number;
	name: string;
	bossOptions: Omit<BossOptions, 'leader' | 'channel' | 'massText' | 'settingsKeys'>;
	handleFinish: (options: NewBossOptions, bossUsers: BossUser[]) => Promise<void>;
}

export const bossEventChannelID = production ? '897170239333220432' : '1023760501957722163';

export const scaryEatables = [
	{
		item: getOSItem('Candy teeth'),
		healAmount: 3
	},
	{
		item: getOSItem('Toffeet'),
		healAmount: 5
	},
	{
		item: getOSItem('Chocolified skull'),
		healAmount: 8
	},
	{
		item: getOSItem('Rotten sweets'),
		healAmount: 9
	},
	{
		item: getOSItem('Hairyfloss'),
		healAmount: 12
	},
	{
		item: getOSItem('Eyescream'),
		healAmount: 13
	},
	{
		item: getOSItem('Goblinfinger soup'),
		healAmount: 20
	},
	{
		item: getOSItem("Benny's brain brew"),
		healAmount: 50
	},
	{
		item: getOSItem('Roasted newt'),
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
		leader: await mUserFetch(OWNER_IDS[0])
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
