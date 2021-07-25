import { ArrayActions } from '@klasa/settings-gateway';
import { MessageButton } from 'discord.js';
import { deepClone, objectValues, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util';
import { Not } from 'typeorm';

import { Activity, Emoji, SILENT_ERROR } from '../../lib/constants';
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

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int] [plantName:...string]',
			aliases: ['plant', 'harvest', 'af'],
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
	async run(msg: KlasaMessage, [quantity = NaN, plantName = '']: [number, string, boolean]) {
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

		const toPlant: {
			type: TSeedType;
			maxPatchesAllowed: number;
			patches: {
				plant: Plant;
				quantity: number;
				duration: number;
				validation: IPatchValidation;
			}[];
		}[] = [];

		const toCollect: FarmingPatchesTable[] = [];

		let possiblePlants = plants.sort((a, b) => b.level - a.level);
		const requiredBank = new Bank();
		const maxUserTripLength = msg.author.maxTripLength(Activity.Farming);
		console.log(maxUserTripLength, formatDuration(maxUserTripLength));
		const alreadyPlanted = <Record<TSeedType, number>>{};
		const currentDate = new Date();

		// Get what the user have planted
		const planted = await this.getPlanted(msg.author);
		const harvestPatchDuration = <Record<TSeedType, number>>{};
		const paidToCut: Record<number, boolean> = {};

		loopPlant: for (const plant of possiblePlants) {
			// If a plant has been informed, those plants will be checked
			if (plantName) {
				const plantToCheck = plantName.split(',').map(n => n.trim());
				let plantFound = false;
				for (const check of plantToCheck) {
					if (stringMatches(plant.name, check) || plant.aliases.some(a => stringMatches(a, check))) {
						plantFound = true;
						break;
					}
				}
				if (!plantFound) continue;
			}

			if (!alreadyPlanted[plant.seedType]) {
				try {
					alreadyPlanted[plant.seedType] = planted
						.filter(p => p.patchType === plant.seedType && p.finishDate > currentDate)
						.map(p => p.quantity)
						.reduce((c, p) => c + p);
				} catch (e) {
					alreadyPlanted[plant.seedType] = 0;
				}

				for (const _planted of planted) {
					if (_planted.patchType === plant.seedType && _planted.finishDate <= currentDate) {
						// Check if user can harvest this seed (it it is a tree, it may not allow it due to the user
						// not having enough WC Level or GP
						const plantedPlant = Farming.Plants.find(p => p.name === _planted.plant)!;
						// Check if it needs to be cut
						const priceToCut = _planted.quantity * (plantedPlant.seedType === 'redwood' ? 2000 : 200);
						let canCollect = true;
						if (plantedPlant.needsChopForHarvest) {
							// User has WC level...
							if (msg.author.skillLevel(SkillsEnum.Woodcutting) < plantedPlant.treeWoodcuttingLevel!) {
								if (msg.author.settings.get(UserSettings.GP) < priceToCut) {
									canCollect = false;
								} else {
									requiredBank.add(995, priceToCut);
									paidToCut[_planted.id] = true;
								}
							}
						}
						// If it cant be collected, increase the already planted qty with the amount that is planted
						if (!canCollect) {
							alreadyPlanted[plant.seedType] += _planted.quantity;
						} else if (!toCollect.find(c => c.id === _planted.id)) {
							toCollect.push(_planted);
							// Add to the harvested Patch Duration
							if (!harvestPatchDuration[_planted.patchType]) harvestPatchDuration[_planted.patchType] = 0;
							harvestPatchDuration[_planted.patchType] +=
								_planted.quantity * (plant.timePerHarvest + plant.timePerPatchTravel + 5) * Time.Second;
						}
					}
				}
			}

			const patchBeingUsed = toPlant.find(p => p.type === plant.seedType);

			// If the user can plant it
			if (msg.author.skillLevel(SkillsEnum.Farming) < plant.level) continue;

			// Get number of patches the player will be doing
			const maxPatches = calcNumOfPatches(plant, msg.author, msg.author.settings.get(UserSettings.QP));

			// Check what can be planted, either the maximum the user can or limited to what the user sets as quantity
			let pathQty = maxPatches;
			for (const item of new Bank(plant.inputItems).items()) {
				let numInBank = msg.author.bank().amount(item[0].id);
				if (numInBank === 0) continue loopPlant;

				let checkItem = Math.floor(numInBank / item[1]);
				if (quantity < checkItem) checkItem = quantity;
				if (checkItem < pathQty) pathQty = checkItem;
			}
			// Limit to max that can be planted
			if (pathQty > maxPatches - alreadyPlanted[plant.seedType]) {
				pathQty = maxPatches - alreadyPlanted[plant.seedType];
			}

			// Only plant stuff if harvest is not set
			if (
				msg.flagArgs.harvest ||
				pathQty === 0 ||
				// Ignore if not favorite
				(farmingSettings.favoritePlants &&
					farmingSettings.favoritePlants[plant.seedType] &&
					farmingSettings.favoritePlants[plant.seedType] !== plant.name) ||
				// Ignore if patch is blocked
				(farmingSettings.blockedPatches && farmingSettings.blockedPatches.includes(plant.seedType))
			) {
				continue;
			}

			// Check if the user has everything
			const requiredItems = new Bank(plant.inputItems).multiply(pathQty);
			if (!msg.author.bank({ withGP: true }).has(requiredItems.bank)) continue;

			// Validate plant, if it have to be paid, can be paid, etc
			const patchValidation = this.validatePlant(msg, plant, pathQty, requiredBank, farmingSettings);
			const durationForThisPath = pathQty * (plant.timePerHarvest + plant.timePerPatchTravel + 5) * Time.Second;

			let checkCollectTime = 0;
			if (harvestPatchDuration[plant.seedType]) {
				harvestPatchDuration[plant.seedType] -= durationForThisPath;
				checkCollectTime = harvestPatchDuration[plant.seedType];
			}

			requiredItems.add(patchValidation[1].itemsForThisPatch);
			// Check if the user have time to plant this
			if (
				toPlant.length > 0 &&
				toPlant
					// Will sum all durations from all seeds to be planted in this patch type
					.map(p => (p.patches ? p.patches.map(pp => pp.duration).reduce((p, c) => p + c) : 0))
					// Sum the total of all patches
					.reduce((p, c) => p + c) +
					durationForThisPath +
					checkCollectTime >
					maxUserTripLength
			)
				continue;

			// Everything OK, add this path
			if (patchBeingUsed) {
				patchBeingUsed.patches.push({
					plant,
					quantity: pathQty,
					duration: durationForThisPath,
					validation: patchValidation[1]
				});
			} else {
				// Calculate maximum number of patches the user can plant
				toPlant.push({
					type: plant.seedType,
					maxPatchesAllowed: maxPatches,
					patches: [
						{
							plant,
							quantity: pathQty,
							duration: durationForThisPath,
							validation: patchValidation[1]
						}
					]
				});
			}
			alreadyPlanted[plant.seedType] += pathQty;
			requiredBank.add(requiredItems);
		}

		let duration: number = 0;
		let warningMessage: boolean = false;
		let hasSomethingPlanted: boolean = false;
		let toBePlanted: string[] = [];

		for (const _patch of toPlant) {
			for (const _p of _patch.patches) {
				const validationFailures: string[] = [];

				if (_p.validation.useCompost && !_p.validation.compostCheck) {
					validationFailures.push(`Not enough ${_p.validation.useCompost}`);
					_p.validation.useCompost = false;
				}
				if (_p.validation.usePayment && !_p.validation.paymentCheck) {
					validationFailures.push('Not enough to pay');
					_p.validation.usePayment = false;
				}
				duration += _p.duration;

				if (validationFailures.length > 0 && !warningMessage) warningMessage = true;

				toBePlanted.push(
					`${_p.quantity}x ${_p.plant.name} ${
						validationFailures.length > 0 ? `(${validationFailures.join(', ')})` : ''
					}`
				);
			}
		}

		// Add harvesting duration for the crops that doesnt mix with the ones being planted
		if (objectValues(harvestPatchDuration).length > 0) {
			duration += Object.values(harvestPatchDuration)
				.map(d => {
					if (d > 0) return d;
					return 0;
				})
				.reduce((c, p) => c + p);
		}

		// Apply boosts
		const boosts: string[] = [];
		if (await userhasDiaryTier(msg.author, ArdougneDiary.elite)) {
			boosts.push(`4% for ${ArdougneDiary.name} ${ArdougneDiary.elite.name}`);
			duration *= 0.96;
		}

		if (hasSomethingPlanted) {
			if (msg.author.hasItemEquippedOrInBank('Magic secateurs'))
				boosts.push('10% crop yield for Magic Secateurs');
			if (msg.author.hasItemEquippedAnywhere(['Farming cape(t)', 'Farming cape']))
				boosts.push('5% crop yield for Farming Skillcape');
		}

		const messageSend: string[] = [];

		if (warningMessage)
			messageSend.push(
				`${Emoji.Warning}\n__**WARNING**__\nSome plants have warnings. They maybe can't be paid, cut or composted. Plants that fails to be CUT will not be sent, everything else can and will, if you confirm! Check it before confirming your trip.`
			);

		if (toBePlanted.length > 0)
			messageSend.push(`__Here are the plants that you will be planting__:\n${toBePlanted.join(', ')}`);

		if (toCollect.length > 0)
			messageSend.push(
				`__Here are the plants that you will be harvesting__:\n${toCollect
					.map(c => `${c.quantity}x ${c.plant}`)
					.join(', ')}`
			);

		if (requiredBank.items().length > 0)
			messageSend.push(`__The following items will be removed from your bank__:\n${requiredBank}`);

		if (boosts.length > 0) messageSend.push(`__**Boosts:**__:\n${boosts.join(', ')}`);

		if (toPlant.length === 0 && toCollect.length === 0) {
			return msg.channel.send(
				'There is nothing you can plant at the moment. Check +cp for more information about your patches.'
			);
		}

		const message = await msg.channel.send({
			content: messageSend.join('\n\n'),
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
						label: `Trip length: ${formatDuration(duration)}`,
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
				content: `${message.content}\n\n${msg.author}, ${
					msg.author.minionName
				} is now on a farming trip and it will take around ${formatDuration(duration)} to finish it.`
			});
		} catch {
			return message.edit({
				components: [],
				content: `${message.content}\n\n${msg.author}, your farming trip will not start.`
			});
		}

		// For a last validation, make sure the user has everything that will be used in this trip. This should never fail.
		if (!msg.author.bank({ withGP: true }).has(requiredBank.bank)) {
			return msg.channel.send(
				`You don't have the required items for this trip. You are missing: ${requiredBank.remove(
					msg.author.bank()
				)}`
			);
		}

		const activityOptions: IFarmingPatchesToPlant[] = [];

		for (const _patch of toPlant) {
			for (const _p of _patch.patches) {
				activityOptions.push({
					plant: _p.plant.name,
					duration: _p.duration,
					quantity: _p.quantity,
					compost: _p.validation.useCompost,
					payment: _p.validation.usePayment,
					type: _p.plant.seedType
				});
			}
		}

		await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			toPlant: activityOptions,
			toCollect: toCollect.map(c => {
				return { id: c.id, paidToCut: paidToCut[c.id] || false };
			}),
			currentDate: currentDate.getTime(),
			type: Activity.Farming
		});
	}
}
