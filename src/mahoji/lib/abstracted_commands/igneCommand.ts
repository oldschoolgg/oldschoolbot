import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { dwarvenOutfit } from '../../../lib/data/CollectionsExport';
import { Ignecarus } from '../../../lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { BossInstance } from '../../../lib/structures/Boss';
import { Gear } from '../../../lib/structures/Gear';
import { channelIsSendable, formatDuration } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';

export async function igneCommand(
	interaction: ChatInputCommandInteraction | null,
	user: MUser,
	channelID: string,
	inputName: string,
	quantity: number | undefined
) {
	if (interaction) await deferInteraction(interaction);
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'Invalid channel.';
	const type = inputName.toLowerCase().includes('mass') ? 'mass' : 'solo';

	const instance = new BossInstance({
		leader: user,
		id: Ignecarus.id,
		baseDuration: Time.Minute * 25,
		skillRequirements: {
			slayer: 110
		},
		itemBoosts: [
			['Drygore longsword', 15],
			['Ignis ring(i)', 10],
			['TzKal cape', 6],
			["Brawler's hook necklace", 4]
		],
		speedMaxReduction: 40,
		customDenier: async () => {
			return [false];
		},
		bisGear: new Gear({
			head: 'Dwarven full helm',
			body: 'Dwarven platebody',
			legs: 'Dwarven platelegs',
			hands: 'Dwarven gloves',
			feet: 'Dwarven boots',
			cape: 'TzKal cape',
			ring: 'Ignis ring(i)',
			weapon: 'Drygore longsword',
			shield: 'Dragonfire shield',
			neck: "Brawler's hook necklace"
		}),
		gearSetup: 'melee',
		itemCost: async data => {
			const userBank = data.user.bank;
			const kc = await data.user.getKC(Ignecarus.id);

			let brewsNeeded = Math.max(1, 10 - Math.max(1, Math.ceil((kc + 1) / 30))) + 2;
			if (data.solo) {
				brewsNeeded = Math.floor(brewsNeeded * 1.5);
			}
			const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));

			const heatResBank = new Bank()
				.add('Heat res. brew', brewsNeeded)
				.add('Heat res. restore', restoresNeeded)
				.multiply(data.kills);
			const normalBank = new Bank()
				.add('Saradomin brew(4)', brewsNeeded)
				.add('Super restore(4)', restoresNeeded)
				.multiply(data.kills);
			return userBank.has(heatResBank.bank) ? heatResBank : normalBank;
		},
		mostImportantStat: 'attack_crush',
		ignoreStats: ['attack_ranged', 'attack_magic'],
		food: () => new Bank(),
		settingsKeys: ['ignecarus_cost', 'ignecarus_loot'],
		channel,
		activity: 'Ignecarus',
		massText: `${user.usernameOrMention} is assembling a team to fight Ignecarus! Use the buttons below to join/leave.`,
		minSize: 1,
		solo: type === 'solo',
		canDie: true,
		customDeathChance: (user, preCalcedDeathChance, solo) => {
			let baseDeathChance = 95;
			const gear = user.gear.melee;
			for (const item of dwarvenOutfit) {
				if (gear.hasEquipped(item)) {
					baseDeathChance -= 9.5;
				}
			}
			if (gear.hasEquipped('Dragonfire shield')) {
				baseDeathChance -= 33;
			}
			baseDeathChance -= (100 - preCalcedDeathChance) / 10;
			if (solo) {
				baseDeathChance *= 2.5;
			}
			return baseDeathChance;
		},
		quantity,
		allowMoreThan1Solo: true,
		allowMoreThan1Group: true
	});
	const hasNormalFood = [];
	for (const user of instance.bossUsers) {
		if (user.itemsToRemove.has('Saradomin brew(4)')) {
			hasNormalFood.push(user.user.id);
		}
	}

	try {
		const { bossUsers } = await instance.start();

		const embed = new EmbedBuilder()
			.setDescription(
				`Your team is off to fight ${instance.quantity}x Ignecarus. The total trip will take ${formatDuration(
					instance.duration
				)}.

${bossUsers.map(u => `**${u.user.usernameOrMention}**: ${u.debugStr}`).join('\n\n')}
`
			)
			.setImage(
				'https://cdn.discordapp.com/attachments/357422607982919680/857358542456487996/grzegorz-rutkowski-dragons-breath-1920-2.jpg'
			);

		return {
			embeds: [embed.data],
			content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.'
		};
	} catch (err: any) {
		return `The mass failed to start for this reason: ${err}.`;
	}
}
