import { ArrayActions } from '@klasa/settings-gateway';
import { MessageButton } from 'discord.js';
import { deepClone, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util';
import { Not } from 'typeorm';

import { Activity, COINS_ID, Emoji, SILENT_ERROR } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcNumOfPatches, returnListOfPlants } from '../../lib/skilling/functions/calcsFarming';
import Farming, { plants } from '../../lib/skilling/skills/farming';
import { IFarmingSettings, Plant, SkillsEnum, TSeedType } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FarmingPatchesTable, FarmingPatchStatus } from '../../lib/typeorm/FarmingPatchesTable.entity';
import { FarmingActivityTaskOptions, IFarmingPatchesToPlant } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

interface IPatchValidation {
	canCompost: boolean;
	compostCheck: boolean;
	useCompost: false | 'compost' | 'supercompost' | 'ultracompost';
	usePayment: boolean;
	paymentCheck: boolean;
	canPay: boolean;
	itemsForThisPatch: Bank;
}

function sumAll(current: number, previous: number) {
	return current + previous;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[plantName:...string]',
			aliases: ['plant', 'harvest'],
			usageDelim: ' ',
			description: 'Allows a player to plant or harvest and replant seeds for farming.',
			examples: ['+plant ranarr seed', '+farm oak tree'],
			categoryFlags: ['minion']
		});
	}

	validatePlant(
		msg: KlasaMessage,
		plant: Plant,
		quantity: number,
		currentRequiredBank: Bank,
		farmingSettings: IFarmingSettings
	): [boolean, IPatchValidation] {
		const validation: IPatchValidation = {
			canCompost: false,
			compostCheck: true,
			useCompost: false,
			usePayment: false,
			paymentCheck: true,
			canPay: false,
			itemsForThisPatch: new Bank()
		};

		validation.canCompost = plant.canCompostPatch;
		validation.canPay = plant.canPayFarmer;

		if (validation.canCompost) {
			validation.useCompost = farmingSettings.defaultCompost ?? false;
			if (msg.flagArgs.sc || msg.flagArgs.supercompost) validation.useCompost = 'supercompost';
			if (msg.flagArgs.uc || msg.flagArgs.ultracompost) validation.useCompost = 'ultracompost';
		}

		// Check if payment will be made
		if (validation.canPay) {
			validation.usePayment = farmingSettings.defaultPay ?? false;
			if (msg.flagArgs.pay) validation.usePayment = true;
			if (validation.usePayment) {
				const paymentBank = new Bank(plant.protectionPayment);
				if (
					msg.author
						.bank({ withGP: true })
						.has(addBanks([paymentBank.multiply(quantity).bank, currentRequiredBank.bank]))
				) {
					validation.itemsForThisPatch.add(paymentBank, quantity);
				} else {
					validation.paymentCheck = false;
				}
			}
		}

		// Remove use of compost if patch cant be composted while user is paying patch
		if (validation.useCompost && validation.useCompost !== 'compost') {
			if (!plant.canCompostandPay && validation.usePayment) validation.useCompost = false;
		}

		// Add compost to use
		if (validation.useCompost) {
			const compostBank = { [itemID(validation.useCompost)]: quantity };
			if (msg.author.bank({ withGP: true }).has(addBanks([currentRequiredBank.bank, compostBank]))) {
				validation.itemsForThisPatch.add(compostBank);
			} else if (validation.useCompost !== 'compost') {
				validation.compostCheck = false;
			}
		}

		const isValid = validation.compostCheck && validation.paymentCheck;
		return [isValid, validation];
	}

	async getPlanted(user: KlasaUser) {
		return FarmingPatchesTable.find({
			where: {
				userID: user.id,
				status: Not(FarmingPatchStatus.Harvested)
			}
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [plantName = '']: [string]) {
		if (msg.flagArgs.plants) {
			return returnListOfPlants(msg);
		}

		await msg.author.settings.sync(true);

		const farmingSettings = {
			...deepClone(await msg.author.settings.get(UserSettings.Minion.FarmingSettings))
		};

		if (msg.flagArgs.togglereminders) {
			farmingSettings.remindersEnabled = !farmingSettings.remindersEnabled;
			await msg.author.settings.update(UserSettings.Minion.FarmingSettings, farmingSettings, {
				arrayAction: ArrayActions.Overwrite
			});
			return msg.channel.send(
				`${farmingSettings.remindersEnabled ? 'Enabled' : 'Disabled'} farming patch reminders.`
			);
		}

		const plantsToCheck = plantName
			.split(',')
			.map(n => n.trim())
			.filter(f => f);

		const quantity = Number(msg.flagArgs.qty) ?? NaN;

		let subQtyInformed = false;
		const plantsQty: Record<string, number> = {};
		for (let i = 0; i < plantsToCheck.length; i++) {
			const check = plantsToCheck[i].split(' ');
			const qty = Number(check.shift());
			if (!isNaN(qty)) {
				plantsToCheck[i] = check.join(' ').trim();
				plantsQty[plantsToCheck[i]] = Number(qty);
				subQtyInformed = true;
			}
		}

		const toPlant: {
			type: TSeedType;
			maxPatchesAllowed: number;
			totalToHarvest: number;
			patches: {
				plant: Plant;
				quantity: number;
				duration: number;
				items: Bank;
			}[];
		}[] = [];

		const userFarmingLevel = msg.author.skillLevel(SkillsEnum.Farming);
		const userWoodcuttingLevel = msg.author.skillLevel(SkillsEnum.Woodcutting);
		const userQP = msg.author.settings.get(UserSettings.QP);
		let possiblePlants = plants.sort((a, b) => b.level - a.level);
		const requiredBank = new Bank();
		const currentDate = new Date();
		// If the user wants to force a certain patch
		const patchesForced = (msg.flagArgs.patches ?? '').split(',').filter(f => f);

		const errors: string[] = [];

		// Get everything the user planted
		const planted = await this.getPlanted(msg.author);
		// Check what can be harvested
		const canBeHarvested = planted.filter(p => p.finishDate <= currentDate);
		// Start iterating over everything the user wants to plant
		loopPlant: for (const plant of possiblePlants) {
			// Check if user has enough level to plant it
			if (plant.level > userFarmingLevel) continue;
			// Check if user is forcing a certain patch
			const forcedPatch = patchesForced.find(p => stringMatches(p, plant.seedType));
			if (patchesForced.length > 0) if (!forcedPatch) continue;
			// Check if user is forcing a seed and this is not it
			const userForcedSeed = plantsToCheck.find(
				p => stringMatches(plant.name, p) || plant.aliases.some(a => stringMatches(a, p))
			);
			if (plantsToCheck.length > 0 && !userForcedSeed) continue;
			// Check if favorite & block
			let block = farmingSettings.blockedPatches && farmingSettings.blockedPatches.includes(plant.seedType);
			if (
				(block && plantsToCheck.length > 0 && userForcedSeed) ||
				(block && patchesForced.length > 0 && forcedPatch)
			) {
				block = false;
			}
			if (
				// Has a favorite for this patch type and it is not this plant
				(farmingSettings.favoritePlants &&
					farmingSettings.favoritePlants[plant.seedType] &&
					farmingSettings.favoritePlants[plant.seedType] !== plant.name &&
					!userForcedSeed) ||
				// Has this patch type blocked
				block
			) {
				continue;
			}
			// Get how many can be planted in total
			const maxPatches = calcNumOfPatches(plant, msg.author, userQP);
			if (maxPatches === 0 && userForcedSeed) {
				errors.push(`You do not meet all requirements to plant a ${plant.name}.`);
			}

			// Calculate the maximum number that can be planted, based on how many are currently planted, will be
			// harvested and are being planted
			let totalPlanted = 0;
			if (planted.length > 0) {
				const plantedPatch = planted.filter(f => f.patchType === plant.seedType).map(p => p.quantity);
				if (plantedPatch.length > 0) totalPlanted = plantedPatch.reduce(sumAll);
			}
			let totalToHarvest = 0;
			if (canBeHarvested.length > 0) {
				const harvestPatch = canBeHarvested.filter(f => f.patchType === plant.seedType).map(p => p.quantity);
				if (harvestPatch.length > 0) totalToHarvest = harvestPatch.reduce(sumAll);
			}
			let totalToPlant = 0;
			if (toPlant.length > 0) {
				const patchType = toPlant
					.filter(f => f.type === plant.seedType)
					.map(p => p.patches.map(pp => pp.quantity).reduce(sumAll));
				if (patchType.length > 0) totalToPlant = patchType.reduce(sumAll);
			}

			let qtyToPlant =
				maxPatches -
				(isNaN(totalPlanted) ? 0 : totalPlanted) +
				(isNaN(totalToHarvest) ? 0 : totalToHarvest) -
				(isNaN(totalToPlant) ? 0 : totalToPlant);

			if (userForcedSeed && plantsQty[userForcedSeed]) {
				if (plantsQty[userForcedSeed] < qtyToPlant) qtyToPlant = plantsQty[userForcedSeed];
			} else if (!isNaN(quantity) && quantity < qtyToPlant) qtyToPlant = quantity;
			else if (subQtyInformed && qtyToPlant > 1) qtyToPlant = 1;

			// Not enough to plant, skip seed
			if (qtyToPlant === 0) continue;

			// Validate if user has enough base items to plant this
			const plantBank = new Bank().add(plant.inputItems);
			const checkBank = new Bank().add(msg.author.bank()).remove(requiredBank);
			// Uses the minimum qty the user can plant between all required items
			for (const item of plantBank.items()) {
				let numInBank = checkBank.amount(item[0].id);
				if (numInBank === 0) {
					if (userForcedSeed) errors.push(`You do not have enough ${item[0].name} to plant a ${plant.name}.`);
					continue loopPlant;
				}
				let checkItem = Math.floor(numInBank / item[1]);
				if (checkItem === 0) {
					if (userForcedSeed) errors.push(`You do not have enough ${item[0].name} to plant a ${plant.name}.`);
					continue loopPlant;
				}
				// This is what defined how many will be able to plant
				if (checkItem < qtyToPlant) qtyToPlant = checkItem;
			}

			// Store what the user can plant of this patch so it can be sorted and filtered later, on the trip length
			// and validation check (for trees)
			// We store individual values, so the qty can be altered later
			const patchOptions = {
				plant,
				quantity: qtyToPlant,
				duration: plant.timePerHarvest + plant.timePerPatchTravel + 5,
				items: plantBank
			};
			const patchBeingUsed = toPlant.find(p => p.type === plant.seedType);
			if (patchBeingUsed) {
				patchBeingUsed.patches.push(patchOptions);
			} else {
				toPlant.push({
					type: plant.seedType,
					maxPatchesAllowed: maxPatches,
					patches: [patchOptions],
					totalToHarvest
				});
			}
		}

		// Calculate the user tripLength
		const collectChecked: number[] = [];
		const maxTripLength = msg.author.maxTripLength(Activity.Farming);
		let tripLengthLeft = maxTripLength;
		const harvesting: Record<
			string,
			{
				harvested: number;
				harvestedDuration: number;
				harvestedChecked: number;
				cantHarvest: number;
				planted: number;
			}
		> = {};

		// Apply boosts
		let durationBoost: number = 1;
		const boosts: string[] = [];
		if ((await userhasDiaryTier(msg.author, ArdougneDiary.elite))[0] ?? false) {
			boosts.push(`4% for ${ArdougneDiary.name} ${ArdougneDiary.elite.name}`);
			durationBoost *= 0.96;
		}
		if (msg.author.hasGracefulEquipped()) {
			boosts.push('10% for having Graceful equipped.');
			durationBoost *= 0.9;
		}

		let gpNeeded = 0;
		const finalPlant = [];
		const finalCollectIds: number[] = [];
		const paidToCut: Record<number, boolean> = {};

		// Iterate over plants that will be planted
		if (!msg.flagArgs.harvest) {
			forPatch: for (const p of toPlant) {
				for (const pp of p.patches) {
					// Check if it will need to harvest something to plant this
					// Initiate the counters so we can calculate the trip length
					if (!harvesting[pp.plant.seedType]) {
						harvesting[pp.plant.seedType] = {
							planted: 0,
							harvested: 0,
							harvestedChecked: 0,
							harvestedDuration: 0,
							cantHarvest: 0
						};
					}
					// Only iterate over harvested if the patch cant be planted
					if (harvesting[pp.plant.seedType].harvested - harvesting[pp.plant.seedType].planted < pp.quantity) {
						// Iterate over patches to harvest of the same type that is planted, ordering by highest qty
						for (const collect of canBeHarvested
							.filter(
								c =>
									!collectChecked.includes(c.id) &&
									(c.plant === pp.plant.name || c.patchType === pp.plant.seedType)
							)
							// This will make sure the same the user is planting is always take into consideration first
							.sort((a, b) => {
								if (a.plant === b.plant) return 0;
								if (a.plant === pp.plant.name) return -1;
								if (b.plant === pp.plant.name) return 1;
								return a.quantity - b.quantity;
							})) {
							const collectPlant = Farming.Plants.find(f => f.name === collect.plant)!;
							// Ignore patches that the user cant cut
							if (collectPlant.needsChopForHarvest) {
								if (userWoodcuttingLevel < (collectPlant.treeWoodcuttingLevel ?? 0)) {
									const gpForThisPlant =
										collect.quantity * (collectPlant.seedType === 'redwood' ? 2000 : 200);
									if (
										msg.author.bank({ withGP: true }).amount(COINS_ID) >=
										gpNeeded + gpForThisPlant
									) {
										paidToCut[collect.id] = true;
										gpNeeded += gpForThisPlant;
									} else {
										// Prevent this plant to be checked again
										collectChecked.push(collect.id);
										harvesting[pp.plant.seedType].cantHarvest += collect.quantity;
										errors.push(
											`You can't cut ${collect.quantity}x ${
												collectPlant.name
											} because you don't have level ${
												collectPlant.treeWoodcuttingLevel
											} in Woodcutting or ${gpForThisPlant.toLocaleString()} GP to pay for it to be cut down.`
										);

										continue;
									}
								}
							}
							harvesting[pp.plant.seedType].harvested += collect.quantity;
							// Keep the average time between multiple type of seeds
							if (harvesting[pp.plant.seedType].harvestedDuration > 0) {
								harvesting[pp.plant.seedType].harvestedDuration = Math.floor(
									(harvesting[pp.plant.seedType].harvestedDuration +
										collectPlant.timePerHarvest +
										collectPlant.timePerPatchTravel +
										5) /
										2
								);
							} else {
								harvesting[pp.plant.seedType].harvestedDuration =
									collectPlant.timePerHarvest + collectPlant.timePerPatchTravel + 5;
							}
							// Prevent this plant to be checked again
							collectChecked.push(collect.id);
							finalCollectIds.push(collect.id);
							// Enough qty harvested to plant this
							if (
								harvesting[pp.plant.seedType].harvested - harvesting[pp.plant.seedType].planted >=
								pp.quantity
							)
								break;
						}
					}

					if (p.maxPatchesAllowed - harvesting[pp.plant.seedType].cantHarvest - pp.quantity < 0) {
						pp.quantity = p.maxPatchesAllowed - harvesting[pp.plant.seedType].cantHarvest;
					}

					const canHarvest =
						harvesting[pp.plant.seedType].harvested - harvesting[pp.plant.seedType].harvestedChecked;
					let tripTime = canHarvest * harvesting[pp.plant.seedType].harvestedDuration * Time.Second;
					// Means that we are planting more than we can harvest
					if (harvesting[pp.plant.seedType].planted + pp.quantity > harvesting[pp.plant.seedType].harvested) {
						tripTime += (pp.quantity - canHarvest) * pp.duration * Time.Second;
					}
					// If harvesting and planting at the same time, instead of doubling the time needed, add the time
					// for 1 extra interaction, as it takes much less time to plant than it takes to harvest, as the user
					// is already at the place to plant
					if (canHarvest) tripTime += pp.duration * Time.Second;

					if (pp.quantity === 0) continue;

					// Apply boost
					tripTime *= durationBoost;

					if (tripLengthLeft - tripTime >= 0) {
						// If enters here, means the total harvest/planting can be done for this seed
						tripLengthLeft -= tripTime;
					} else {
						// Recalculates de qty to try and match an amount that can be planted
						const recalculatedQty = Math.floor(tripLengthLeft / (pp.duration * Time.Second));
						if (recalculatedQty > 0 && pp.quantity > recalculatedQty) {
							pp.quantity = recalculatedQty;
							tripLengthLeft -= recalculatedQty * pp.duration * Time.Second;
						} else {
							// Skipping, not enough time to plant any if this seed
							continue;
						}
					}

					finalPlant.push(pp);

					// Update the number of planteds, so the next plant knows what to deduct
					harvesting[pp.plant.seedType].planted += pp.quantity;
					harvesting[pp.plant.seedType].harvestedChecked += canHarvest;

					// If we cant do any more of this seed type, jumps to the next one
					if (
						harvesting[pp.plant.seedType].cantHarvest + harvesting[pp.plant.seedType].planted ===
						p.maxPatchesAllowed
					) {
						continue forPatch;
					}
				}
			}
		}

		// Iterate over plants to harvest that can still be harvested, if the trip time allows and have not been
		// checked already
		for (const collect of canBeHarvested.filter(c => !collectChecked.includes(c.id))) {
			if (!harvesting[collect.patchType]) {
				harvesting[collect.patchType] = {
					planted: 0,
					harvested: 0,
					harvestedChecked: 0,
					harvestedDuration: 0,
					cantHarvest: 0
				};
			}

			const collectPlant = Farming.Plants.find(f => f.name === collect.plant)!;

			// Check if user is forcing a certain patch
			if (patchesForced.length > 0)
				if (!patchesForced.find(p => stringMatches(p, collectPlant.seedType))) continue;
			// Check if user is forcing a seed and this is not it
			const userForcedSeed = plantsToCheck.find(
				p => stringMatches(collectPlant.name, p) || collectPlant.aliases.some(a => stringMatches(a, p))
			);
			if (plantsToCheck.length > 0 && !userForcedSeed) continue;

			// Ignore patches that the user cant cut
			if (collectPlant.needsChopForHarvest) {
				if (userWoodcuttingLevel < (collectPlant.treeWoodcuttingLevel ?? 0)) {
					const gpForThisPlant = collect.quantity * (collectPlant.seedType === 'redwood' ? 2000 : 200);
					if (msg.author.bank({ withGP: true }).amount(COINS_ID) >= gpNeeded + gpForThisPlant) {
						gpNeeded += gpForThisPlant;
						paidToCut[collect.id] = true;
					} else {
						errors.push(
							`You can't cut ${collect.quantity}x ${collectPlant.name} because you don't have level ${
								collectPlant.treeWoodcuttingLevel
							} in Woodcutting or ${gpForThisPlant.toLocaleString()} GP to pay for it to be cut down.`
						);
						continue;
					}
				}
			}
			let timeForThisPlant =
				(collect.quantity * collectPlant.timePerHarvest + collectPlant.timePerPatchTravel + 5) * Time.Second;
			// Apply boost
			timeForThisPlant *= durationBoost;
			if (tripLengthLeft - timeForThisPlant >= 0) {
				tripLengthLeft -= timeForThisPlant;
				harvesting[collect.patchType].harvested += collect.quantity;
				finalCollectIds.push(collect.id);
			}
		}

		// Harvest boosts (only visible)
		if (finalCollectIds.length > 0) {
			if (msg.author.hasItemEquippedOrInBank('Magic secateurs')) {
				boosts.push('10% crop yield for Magic Secateurs');
			}
			if (msg.author.hasItemEquippedOrInBank('Farming cape') && userFarmingLevel >= 99) {
				boosts.push('5% crop yield for Farming Skillcape');
			}
		}

		const activityOptions: IFarmingPatchesToPlant[] = [];
		const messageSend: string[] = [];
		let warningMessage = false;

		// Add GP to cut trees (if any was calculated)
		if (gpNeeded > 0) requiredBank.add({ 995: gpNeeded });

		// Prepare plants to plant
		const plantMessage: string[] = [];
		for (const plant of finalPlant) {
			// Validate compost and payments for patch
			const patchValidation = this.validatePlant(msg, plant.plant, plant.quantity, requiredBank, farmingSettings);
			requiredBank.add(plant.items.multiply(plant.quantity)).add(patchValidation[1].itemsForThisPatch);
			// Prepare the errors to show
			const validationFailures: string[] = [];
			if (patchValidation[1].useCompost && !patchValidation[1].compostCheck) {
				validationFailures.push(`Not enough ${patchValidation[1].useCompost}`);
				patchValidation[1].useCompost = false;
			}
			if (patchValidation[1].usePayment && !patchValidation[1].paymentCheck) {
				validationFailures.push('Not enough to pay');
				patchValidation[1].usePayment = false;
			}

			activityOptions.push({
				plant: plant.plant.name,
				duration: plant.duration * plant.quantity * Time.Second,
				quantity: plant.quantity,
				compost: patchValidation[1].useCompost,
				payment: patchValidation[1].usePayment,
				type: plant.plant.seedType
			});

			if (validationFailures.length > 0 && !warningMessage) warningMessage = true;

			plantMessage.push(
				`${plant.quantity}x ${plant.plant.name} ${
					validationFailures.length > 0 ? `(${validationFailures.join(', ')})` : ''
				}`
			);
		}

		if (warningMessage)
			messageSend.push(
				`${Emoji.Warning}\n__**WARNING**__\nSome plants have warnings. They maybe can't be paid, cut or composted. Check it before confirming your trip.`
			);

		if (plantMessage.length > 0)
			messageSend.push(`__Here are the plants that you will be planting__:\n${plantMessage.join(', ')}`);

		if (finalCollectIds.length > 0)
			messageSend.push(
				`__Here are the plants that you will be harvesting__:\n${canBeHarvested
					.filter(c => finalCollectIds.includes(c.id))
					.map(c => `${c.quantity}x ${c.plant}`)
					.join(', ')}`
			);

		if (requiredBank.items().length > 0)
			messageSend.push(`__The following items will be removed from your bank__:\n${requiredBank}`);

		if (errors.length > 0) {
			messageSend.push(`__Warnings__:\n${errors.join(', ')}`);
		}

		if (boosts.length > 0) messageSend.push(`__**Boosts:**__:\n${boosts.join(', ')}`);

		if (toPlant.length === 0 && finalCollectIds.length === 0) {
			return msg.channel.send(
				`There is nothing you can plant at the moment. Check +cp for more information about your patches.${
					errors.length > 0 ? `\n\n__Warnings__:\n${errors.join(', ')}` : ''
				}`
			);
		}

		let finalMessage = messageSend.join('\n\n');

		// Cut long messages so the button to confirm can show without errors
		let stringToSend = '';
		if (finalMessage.length > 2000) {
			for (const message of finalMessage.split('\n')) {
				if (`${stringToSend}\n${message}`.length >= 2000) {
					await msg.channel.send(stringToSend);
					stringToSend = message;
				} else {
					stringToSend += `\n${message}`;
				}
			}
		} else {
			stringToSend = finalMessage;
		}

		if (msg.flagArgs.cf || msg.flagArgs.confirm || farmingSettings.confirmationEnabled === false) {
			await msg.channel.send({
				content: `${stringToSend}\n\n${msg.author.username}, ${
					msg.author.minionName
				} is now on a farming trip and it will take around ${formatDuration(
					maxTripLength - tripLengthLeft
				)} to finish it.`
			});
		} else {
			const message = await msg.channel.send({
				content: stringToSend,
				components: [
					[
						new MessageButton({
							type: 'BUTTON',
							label: 'Confirm',
							customID: 'confirm',
							style: 'PRIMARY'
						}),
						new MessageButton({
							type: 'BUTTON',
							label: 'Cancel',
							customID: 'cancel',
							style: 'SECONDARY'
						}),
						new MessageButton({
							type: 'BUTTON',
							label: `Trip length: ${formatDuration(maxTripLength - tripLengthLeft)}`,
							customID: 'triplength',
							style: 'SECONDARY',
							disabled: true
						})
					]
				]
			});

			try {
				const selection = await message.awaitMessageComponentInteraction({
					filter: i => {
						if (i.user.id !== msg.author.id) {
							i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
							return false;
						}
						return true;
					},
					time: Time.Second * 45
				});
				if (selection.customID === 'cancel')
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(SILENT_ERROR);

				await message.edit({
					components: [],
					content: `${message.content}\n\n${msg.author.username}, ${
						msg.author.minionName
					} is now on a farming trip and it will take around ${formatDuration(
						maxTripLength - tripLengthLeft
					)} to finish it.`
				});
			} catch {
				return message.edit({
					components: [],
					content: `${message.content}\n\n${msg.author.username}, your farming trip will not start.`
				});
			}
		}

		await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration: maxTripLength - tripLengthLeft,
			toPlant: activityOptions,
			toCollect: finalCollectIds.map(c => {
				return { id: c, paidToCut: paidToCut[c] ?? false };
			}),
			currentDate: currentDate.getTime(),
			type: Activity.Farming
		});
	}
}
