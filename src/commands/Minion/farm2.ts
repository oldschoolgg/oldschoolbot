import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util';
import { Not } from 'typeorm';

import { Activity, Emoji } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcNumOfPatches, returnListOfPlants } from '../../lib/skilling/functions/calcsFarming';
import { plants } from '../../lib/skilling/skills/farming';
import { Plant, SkillsEnum, TSeedType } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FarmingPatchesTable, FarmingPatchStatus } from '../../lib/typeorm/FarmingPatchesTable.entity';
import { FarmingActivityTaskOptions, IFarmingPatchesToPlant } from '../../lib/types/minions';
import { stringMatches } from '../../lib/util';
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
			// aliases: ['plant'],
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
		currentRequiredBank: Bank
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
			validation.useCompost = msg.author.settings.get(UserSettings.Minion.DefaultCompostToUse);
			if (msg.flagArgs.sc || msg.flagArgs.supercompost) validation.useCompost = 'supercompost';
			if (msg.flagArgs.uc || msg.flagArgs.ultracompost) validation.useCompost = 'ultracompost';
		}

		// Check if payment will be made
		if (validation.canPay) {
			validation.usePayment = msg.author.settings.get(UserSettings.Minion.DefaultPay);
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

		if (msg.flagArgs.togglereminders) {
			const currentReminderSetting = await msg.author.settings.get(UserSettings.FarmingPatchReminders);
			await msg.author.settings.update(UserSettings.FarmingPatchReminders, !currentReminderSetting);
			return msg.channel.send(`${!currentReminderSetting ? 'Enabled' : 'Disabled'} farming patch reminders.`);
		}

		await msg.author.settings.sync(true);

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
		const alreadyPlanted = <Record<TSeedType, number>>{};
		const currentDate = new Date();

		// Get what the user have planted
		const planted = await this.getPlanted(msg.author);

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
						if (!toCollect.find(c => c.id === _planted.id)) toCollect.push(_planted);
					}
				}
			}

			const patchBeingUsed = toPlant.find(p => p.type === plant.seedType);

			// If the user can plant it
			if (msg.author.skillLevel(SkillsEnum.Farming) < plant.level) continue;

			// Get number of patches the player will be doing
			const maxPatches = calcNumOfPatches(plant, msg.author, msg.author.settings.get(UserSettings.QP));

			// If nothing is informed as qty, uses what user have in bank
			// Forces qty to be very high, so we can use the minimal amount the user has in bank

			let pathQty = Number.MAX_SAFE_INTEGER;
			for (const item of new Bank(plant.inputItems).items()) {
				let numInBank = msg.author.bank().amount(item[0].id);
				if (numInBank === 0) {
					continue loopPlant;
				} else if (quantity < numInBank) {
					numInBank = quantity;
				}
				if (numInBank * item[1] < pathQty) pathQty = numInBank;
			}

			// Limit to max that can be planted
			if (pathQty > maxPatches - alreadyPlanted[plant.seedType]) {
				pathQty = maxPatches - alreadyPlanted[plant.seedType];
			}
			// If nothing can be planted
			if (pathQty === 0) continue;

			// Check if the user has everything
			const requiredItems = new Bank(plant.inputItems).multiply(pathQty);
			if (!msg.author.bank({ withGP: true }).has(requiredItems.bank)) continue;

			// Validate plant, if it have to be paid, can be paid, etc
			const patchValidation = this.validatePlant(msg, plant, pathQty, requiredBank);
			const durationForThisPath = (pathQty * (plant.timePerHarvest + plant.timePerPatchTravel) + 5) * Time.Second;

			requiredItems.add(patchValidation[1].itemsForThisPatch);
			// Check if the user have time to plant this
			if (
				toPlant.length > 0 &&
				toPlant
					// Will sum all durations from all seeds to be planted in this patch type
					.map(p => (p.patches ? p.patches.map(pp => pp.duration).reduce((p, c) => p + c) : 0))
					// Sum the total of all patches
					.reduce((p, c) => p + c) +
					durationForThisPath >
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
				// if (_p.toCollect && !hasSomethingPlanted) hasSomethingPlanted = true;

				toBePlanted.push(
					`${_p.quantity}x ${_p.plant.name} ${
						validationFailures.length > 0 ? `(${validationFailures.join(', ')})` : ''
					}`
				);
			}
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

		if (warningMessage) {
			await msg.confirm(messageSend.join('\n\n'));
		} else {
			await msg.channel.send(
				toPlant.length > 0
					? messageSend.join('\n\n')
					: 'There is nothing you can plant at the moment. Check +cp for more information about your patches.'
			);
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
					plant: _p.plant,
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
			toCollect: toCollect.map(c => c.id),
			currentDate: currentDate.getTime(),
			type: Activity.Farming
		});

		// for (const act of activityOptions) {
		// 	const finishDate = new Date();
		// 	finishDate.setTime(currentDate.getTime() + act.plant.growthTime * Time.Minute);
		// 	const rec = new FarmingPatchesTable();
		// 	rec.plant = act.plant.name;
		// 	rec.patchType = act.plant.seedType;
		// 	rec.quantity = act.quantity;
		// 	rec.compostUsed = act.compost || null;
		// 	rec.carePayment = act.payment;
		// 	rec.userID = msg.author.id;
		// 	rec.finishDate = finishDate;
		// 	rec.plantDate = currentDate;
		// 	rec.status = FarmingPatchStatus.Planted;
		// 	await rec.save();
		// }
	}
}
