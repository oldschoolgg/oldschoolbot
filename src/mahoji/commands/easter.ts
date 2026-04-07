import { formatDuration, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import {
	EASTER_EVENT_START,
	getEasterTurnInMessage,
	getExpectedPassiveEasterLoot,
	type PassiveEasterLootResult,
	rollEasterTurnInLoot,
	rollPassiveEasterLoot
} from '@/lib/easter.js';

function formatExpectedAmount(amount: number) {
	return amount.toLocaleString(undefined, {
		minimumFractionDigits: amount > 0 && amount < 1 ? 2 : 0,
		maximumFractionDigits: 2
	});
}

function getDrynessRemark({
	label,
	actualWabbitEggs,
	actualMagneggs,
	boostedExpectedWabbitEggs,
	boostedExpectedMagneggs
}: {
	label: string;
	actualWabbitEggs: number;
	actualMagneggs: number;
	boostedExpectedWabbitEggs: number;
	boostedExpectedMagneggs: number;
}) {
	const spoon = '\u{1F944}';
	const eggAhead = actualWabbitEggs > boostedExpectedWabbitEggs;
	const magneggAhead = actualMagneggs > boostedExpectedMagneggs;
	const eggFarBehind = boostedExpectedWabbitEggs >= 1 && actualWabbitEggs < boostedExpectedWabbitEggs * 0.65;
	const magneggFarBehind = boostedExpectedMagneggs >= 1 && actualMagneggs < boostedExpectedMagneggs * 0.65;

	if (eggAhead && magneggAhead) {
		return `${spoon} Your ${label.toLowerCase()} is disgustingly spooned. Save some Easter luck for everyone else.`;
	}
	if (magneggAhead) {
		return `${spoon} Your ${label.toLowerCase()} is ahead of the boosted Magnegg rate. Completely unserious luck.`;
	}
	if (eggAhead) {
		return `${spoon} Your ${label.toLowerCase()} is ahead of the boosted Wabbit egg rate. The Wabbits clearly favor you.`;
	}
	if (eggFarBehind && magneggFarBehind) {
		return `Your ${label.toLowerCase()} is brutally dry. The Easter Bunny has you on a list.`;
	}
	if (magneggFarBehind) {
		return `Your ${label.toLowerCase()} is dry on Magneggs. Frankly embarrassing for the rabbit ecosystem.`;
	}
	if (eggFarBehind) {
		return `Your ${label.toLowerCase()} is behind on Wabbit eggs. The rabbits are dodging you on purpose.`;
	}
	return `Your ${label.toLowerCase()} is hovering around expectation. Annoyingly ordinary.`;
}

function buildDrynessSection({
	label,
	tame,
	duration,
	actualWabbitEggs,
	actualMagneggs
}: {
	label: string;
	tame: boolean;
	duration: number;
	actualWabbitEggs: number;
	actualMagneggs: number;
}) {
	const withoutBoost = getExpectedPassiveEasterLoot({ duration, tame });
	const withBoost = getExpectedPassiveEasterLoot({ duration, tame, petBoost: true });
	const boostText = tame ? 'with fed Easter pet boost' : 'with Easter pet boost';

	return (
		[
			`**${label} Trips**`,
			`**Time in event**: ${formatDuration(duration)}`,
			`**Wabbit eggs expected**: ${formatExpectedAmount(withoutBoost.expectedWabbitEggs)} without boost, ${formatExpectedAmount(withBoost.expectedWabbitEggs)} ${boostText}.`,
			`**Magneggs expected**: ${formatExpectedAmount(withoutBoost.expectedMagneggs)} without boost, ${formatExpectedAmount(withBoost.expectedMagneggs)} ${boostText}.`,
			`**Actually obtained**: ${actualWabbitEggs.toLocaleString()} Wabbit eggs, ${actualMagneggs.toLocaleString()} Magneggs.`,
			'\n\n*' +
				getDrynessRemark({
					label,
					actualWabbitEggs,
					actualMagneggs,
					boostedExpectedWabbitEggs: withBoost.expectedWabbitEggs,
					boostedExpectedMagneggs: withBoost.expectedMagneggs
				})
		].join('\n') + '*'
	);
}

function getEasterTurnInQuantityChoices(
	owned: number,
	input: string | number | null = null
): { name: string; value: string }[] {
	if (owned < 1) return [{ name: 'No Wabbit eggs', value: '0' }];

	const theirInput = !Number.isNaN(input) ? Number(input) : 0;
	const quantities: number[] = [1, 3, 5, 10, 15, 25, 50, 69, owned];

	if (theirInput !== 0) {
		const possible = Math.min(theirInput, owned);
		if (!quantities.includes(possible)) quantities.push(possible);
	}

	const choices = [
		...Array.from(quantities)
			.filter(quantity => quantity > 0 && quantity < owned)
			.sort((a, b) => {
				let sortVal = b - a;
				if (b === theirInput) sortVal = 1;
				if (a === theirInput) sortVal = -1;
				return sortVal;
			})
			.map(quantity => ({
				name: `${quantity.toLocaleString()} (${owned.toLocaleString()}x Owned)`,
				value: quantity.toString()
			}))
	];
	if (theirInput === 0 || theirInput === owned) {
		choices.unshift({
			name: `All (${owned.toLocaleString()}x Owned)`,
			value: owned.toString()
		});
	} else {
		choices.splice(1, 0, {
			name: `All (${owned.toLocaleString()}x Owned)`,
			value: owned.toString()
		});
	}

	return choices.slice(0, 25);
}

export const easterCommand = defineCommand({
	name: 'easter',
	description: 'Turn in Wabbit eggs for Easter rewards.',
	attributes: {
		examples: ['/easter turn_in 5']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'turn_in',
			description: 'Turn in Wabbit eggs for Easter loot.',
			options: [
				{
					type: 'String',
					name: 'quantity',
					description: 'The number of Wabbit eggs to turn in.',
					required: true,
					autocomplete: async ({ user, value }: StringAutoComplete) => {
						Logging.logDebug(
							`Autocompleting Easter turn-in quantity for user ${user.username} with value ${value}`
						);
						const choices = getEasterTurnInQuantityChoices(user.bank.amount('Wabbit eggs'), value);
						Logging.logDebug(
							`Generated [{${choices.map(c => `'${c.name}': '${c.value}'`).join('}, {')}}] Easter turn-in quantity choices for user ${user.username}`
						);
						return choices;
					}
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'dryness',
			description: 'See how dry you are',
			options: []
		}
	],
	run: async ({ options, user }) => {
		if (options.dryness) {
			const [activityStats, tameActivityStats, tames] = await Promise.all([
				prisma.activity.aggregate({
					_sum: {
						duration: true
					},
					where: {
						user_id: BigInt(user.id),
						completed: true,
						finish_date: {
							gte: EASTER_EVENT_START
						}
					}
				}),
				prisma.tameActivity.aggregate({
					_sum: {
						duration: true
					},
					where: {
						user_id: user.id,
						completed: true,
						finish_date: {
							gte: EASTER_EVENT_START
						}
					}
				}),
				user.fetchTames()
			]);

			const minionDuration = activityStats._sum.duration ?? 0;
			const tameDuration = tameActivityStats._sum.duration ?? 0;
			const tameCL = new Bank();
			for (const tame of tames) {
				tameCL.add(tame.totalLoot);
			}

			return [
				`Easter dryness since ${EASTER_EVENT_START.toISOString()}:`,
				'',
				buildDrynessSection({
					label: 'Minion',
					tame: false,
					duration: minionDuration,
					actualWabbitEggs: user.cl.amount('Wabbit eggs'),
					actualMagneggs: user.cl.amount('Magnegg')
				}),
				'',
				buildDrynessSection({
					label: 'Tame',
					tame: true,
					duration: tameDuration,
					actualWabbitEggs: tameCL.amount('Wabbit eggs'),
					actualMagneggs: tameCL.amount('Magnegg')
				})
			].join('\n');
		}

		let quantity: string | undefined | number = options.turn_in?.quantity;
		if (!quantity) {
			return `You must choose how many Wabbit eggs to turn in.`;
		}

		quantity = parseInt(quantity, 10);
		if (Number.isNaN(quantity) || quantity <= 0) {
			return `Invalid quantity: ${quantity}. Please enter a positive number.`;
		}

		if (quantity === 969_696 && user.isAdmin()) {
			const discountTameLoot = new Bank();
			const discountMinionLoot = new Bank();
			const fullCostTameLoot = new Bank();
			const fullCostMinionLoot = new Bank();

			const banks = [discountTameLoot, discountMinionLoot, fullCostTameLoot, fullCostMinionLoot];
			const names = ['Tame Discount', 'Minion Discount', 'Tame Full', 'Minion Full'];
			const testDuration = Time.Minute * 60;

			for (let i = 0; i < 4; i++) {
				const bank = banks[i];
				for (let j = 0; j < 1000; j++) {
					let easterResult: PassiveEasterLootResult | null | undefined;
					switch (i) {
						case 0:
							easterResult = rollPassiveEasterLoot(true, testDuration, true, true);
							if (easterResult?.loot) bank.add(easterResult.loot);
							break;
						case 1:
							easterResult = rollPassiveEasterLoot(true, testDuration);
							if (easterResult?.loot) bank.add(easterResult.loot);
							break;
						case 2:
							easterResult = rollPassiveEasterLoot(user, testDuration, true, false);
							if (easterResult?.loot) bank.add(easterResult.loot);
							break;
						case 3:
							easterResult = rollPassiveEasterLoot(false, testDuration);
							if (easterResult?.loot) bank.add(easterResult.loot);
							break;
						default:
							break;
					}
				}
			}

			let resultMsg = '';
			for (let i = 0; i < 4; i++) {
				resultMsg += `\n\n${names[i]}: ${banks[i]}`;
			}
			return `The results are in... ${resultMsg}`;
		}

		const cost = new Bank().add('Wabbit eggs', quantity);
		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}

		const { loot, magneggs } = rollEasterTurnInLoot(user, quantity);
		await user.transactItems({
			itemsToRemove: cost,
			itemsToAdd: loot,
			collectionLog: true
		});

		return new MessageBuilder()
			.setContent(
				getEasterTurnInMessage({
					cost,
					loot,
					magneggs
				})
			)
			.addBankImage({
				bank: loot,
				title: 'Easter Turn In',
				user
			});
	}
});
