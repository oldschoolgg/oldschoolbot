import { dwarvenOutfit } from '@/lib/bso/collection-log/main.js';
import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { BossInstance } from '@/lib/bso/structures/Boss.js';

import { EmbedBuilder } from '@oldschoolgg/discord';
import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { Gear } from '@/lib/structures/Gear.js';

export async function burningDominionCommand(
	interaction: MInteraction,
	user: MUser,
	channelId: string,
	inputName: string,
	quantity: number | undefined
) {
	if (interaction) await interaction.defer();

	const isSolo = !inputName.toLowerCase().includes('mass');
	// i have no idea if this needs to stay in to work and i can't be bothered removing it
	if (isSolo) {
		return {
			content:
				'Orym and Orrodil cannot be fought alone! You must gather a team to challenge the Burning Dominion. Use `/k burning dominion mass` instead.'
		};
	}

	const finalQuantity = quantity ?? 1;

	const instance = new BossInstance({
		interaction,
		leader: user,
		id: EBSOMonster.BURNING_DOMINION,
		baseDuration: Time.Minute * 25,
		skillRequirements: {
			slayer: 110
		},
		itemBoosts: [
			['Dragonbane glaive', 100],
			['Dragonbane aegis', 15],
			['Searcrown band', 7]
		],
		speedMaxReduction: 40,
		customDenier: async () => {
			return [false];
		},
		bisGear: new Gear({
			head: 'Searcrown band',
			body: 'Gorajan warrior top',
			legs: 'Gorajan warrior legs',
			hands: 'Gorajan warrior gloves',
			feet: 'Gorajan warrior boots',
			cape: 'TzKal cape',
			ring: 'Ignis ring(i)',
			weapon: 'Dragonbane glaive',
			shield: 'Dragonbane aegis',
			neck: "Brawler's hook necklace"
		}),
		gearSetup: 'melee',
		itemCost: async data => {
			const userBank = data.user.bank;
			const kc = await data.user.getKC(EBSOMonster.BURNING_DOMINION);

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

			const hasHeatRes = userBank.has(heatResBank);

			return hasHeatRes ? heatResBank : normalBank;
		},
		mostImportantStat: 'attack_stab',
		ignoreStats: ['attack_ranged', 'attack_magic'],
		food: () => new Bank(),
		settingsKeys: ['dominion_cost', 'dominion_loot'],
		channelId: channelId,
		activity: 'BurningDominion',
		massText: `${user.usernameOrMention} is assembling a team to fight Orym and Orrodil! Use the buttons below to join/leave.`,
		minSize: 2,
		solo: false,
		canDie: true,
		customDeathChance: (user, preCalcedDeathChance, solo) => {
			let baseDeathChance = 95;
			const gear = user.gear.melee;
			let dwarvenPieces = 0;

			for (const item of dwarvenOutfit) {
				if (gear.hasEquipped(item)) {
					baseDeathChance -= 9.5;
					dwarvenPieces++;
				}
			}

			baseDeathChance -= (100 - preCalcedDeathChance) / 10;

			if (solo) {
				baseDeathChance *= 2.5;
			}

			return baseDeathChance;
		},
		quantity: finalQuantity,
		allowMoreThan1Solo: false,
		allowMoreThan1Group: true
	});

	const { bossUsers } = await instance.start();

	const embed = new EmbedBuilder().setDescription(
		`Your team is off to fight ${instance.quantity}x Orym and Orrodil. The total trip will take ${formatDuration(
			instance.duration
		)}.

${bossUsers.map(u => `**${u.user.usernameOrMention}**: ${u.debugStr}`).join('\n\n')}
`
	);

	return {
		embeds: [embed],
		content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.'
	};
}
