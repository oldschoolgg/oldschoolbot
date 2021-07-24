import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util';

import { Activity, Emoji } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { IPatchData } from '../../lib/minions/farming/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { calcNumOfPatches, returnListOfPlants } from '../../lib/skilling/functions/calcsFarming';
import Farming, { plants } from '../../lib/skilling/skills/farming';
import { Plant, SkillsEnum, TSeedType } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration, stringMatches, toTitleCase } from '../../lib/util';
import itemID from '../../lib/util/itemID';

interface IPatchValidation {
	canCompost: boolean;
	compostCheck: boolean;
	useCompost: false | 'compost' | 'supercompost' | 'ultracompost';
	usePayment: boolean;
	paymentCheck: boolean;
	canPay: boolean;
	cutCheck: boolean;
	needCut: boolean;
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
		planted: IPatchData,
		currentRequiredBank: Bank
	): [boolean, IPatchValidation] {
		const validation: IPatchValidation = {
			canCompost: false,
			compostCheck: true,
			useCompost: false,
			usePayment: false,
			paymentCheck: true,
			canPay: false,
			cutCheck: true,
			needCut: false,
			itemsForThisPatch: new Bank()
		};

		const plantedPatch = planted
			? Farming.Plants.find(
					p =>
						stringMatches(p.name, planted.lastPlanted!) ||
						stringMatches(p.name.split(' ')[0], planted.lastPlanted!)
			  )
			: null;

		validation.canCompost = plant.canCompostPatch;
		validation.canPay = plant.canPayFarmer;
		validation.needCut = plantedPatch ? plantedPatch.needsChopForHarvest : false;

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

		// Check if there is a tree planted. If so, the user has to have enough level to cut it
		// OR gp to pay for it to get cut
		if (validation.needCut && plantedPatch && planted) {
			if (plantedPatch!.treeWoodcuttingLevel! > msg.author.skillLevel(SkillsEnum.Woodcutting)) {
				const gpNeeded = planted.lastQuantity * (plantedPatch.seedType === 'redwood' ? 2000 : 200);
				if (!msg.author.bank({ withGP: true }).has({ 995: gpNeeded })) {
					validation.cutCheck = false;
				} else {
					validation.itemsForThisPatch.add({ 995: gpNeeded });
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

		const isValid = validation.compostCheck && validation.paymentCheck && validation.cutCheck;
		return [isValid, validation];
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
				toCollect: IPatchData;
				duration: number;
				validation: IPatchValidation;
			}[];
		}[] = [];

		let possiblePlants = plants.sort((a, b) => b.level - a.level);
		const currentDate = new Date().getTime();
		const requiredBank = new Bank();
		const maxUserTripLength = msg.author.maxTripLength(Activity.Farming);

		// Get what the user have planted

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

			// Check if this is a valid seed that can be planted
			// const getPatchType = resolvePatchTypeSetting(plant.seedType);
			// if (!getPatchType) continue;

			let numPatchesPlanted = 0;

			// Get path info from db
			const patchData = msg.author.settings.get(UserSettings.farmingPatches);
			// Check if something is already planted in this spot
			if (patchData.length > 0) {
				for (const pd of patchData) {
					if (currentDate - pd.plantTime > plant.growthTime * Time.Minute) continue;
				}
			}

			// If path type is already being used
			const patchBeingUsed = toPlant.find(p => p.type === plant.seedType);
			if (patchBeingUsed) {
				numPatchesPlanted = patchBeingUsed.patches.map(p => p.quantity).reduce((c, p) => c + p);
				if (patchBeingUsed.maxPatchesAllowed === numPatchesPlanted) continue;
			}

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
			if (pathQty > maxPatches - numPatchesPlanted) pathQty = maxPatches - numPatchesPlanted;
			// If nothing can be planted
			if (pathQty === 0) continue;

			// Check if the user has everything
			const requiredItems = new Bank(plant.inputItems).multiply(pathQty);
			if (!msg.author.bank({ withGP: true }).has(requiredItems.bank)) continue;

			// Validate plant, if it have to be paid, can be paid, etc
			const patchValidation = this.validatePlant(msg, plant, pathQty, patchData, requiredBank);
			const durationForThisPath = (pathQty * (plant.timePerHarvest + plant.timePerPatchTravel) + 5) * Time.Second;
			if (patchValidation[1].cutCheck) {
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
			}
			// Everything OK, add this path
			if (patchBeingUsed) {
				patchBeingUsed.patches.push({
					plant,
					quantity: pathQty,
					duration: durationForThisPath,
					toCollect: patchData,
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
							toCollect: patchData,
							validation: patchValidation[1]
						}
					]
				});
			}
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
				if (_p.validation.needCut && !_p.validation.cutCheck) {
					validationFailures.push(
						'WC level too low or not enough GP to cut tree -- **THIS WILL BE IGNORED AND NOT BE PLANTED**'
					);
				} else {
					duration += _p.duration;
				}

				if (validationFailures.length > 0 && !warningMessage) warningMessage = true;
				if (_p.toCollect && !hasSomethingPlanted) hasSomethingPlanted = true;

				toBePlanted.push(
					`**${toTitleCase(_patch.type)}** - ${_p.quantity}x ${_p.plant.name} for ${formatDuration(
						_p.duration
					)} ${validationFailures.length > 0 ? `[${validationFailures.join(', ')}]` : ''}`
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

		const messageSend = `${
			warningMessage
				? `\n**${Emoji.Warning} WARNING ${Emoji.Warning}**\nSome plants have warnings. They maybe can't be paid, cut or composted. Plants that fails to be CUT will not be sent, everything else can and will, if you confirm! Check it before confirming your trip.\n\n`
				: ''
		}Here are the plants that you will be planting:\n\n${toBePlanted.join(
			'\n'
		)}\n\nThe trip will have a total duration of ${formatDuration(
			duration
		)}.\n\nThe following items will be removed from your bank: ${requiredBank}\n\n${
			boosts.length > 0 ? `**Boosts:** ${boosts.join(', ')}` : ''
		}`;

		if (warningMessage) {
			await msg.confirm(messageSend);
		} else {
			await msg.channel.send(
				toPlant.length > 0
					? messageSend
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

		const activityOptions: {
			name: string;
			type: TSeedType;
			quantity: number;
			compost: false | 'compost' | 'supercompost' | 'ultracompost';
			payment: boolean;
			duration: number;
		}[] = [];

		for (const _patch of toPlant) {
			for (const _p of _patch.patches) {
				activityOptions.push({
					name: _p.plant.name,
					duration: _p.duration,
					quantity: _p.quantity,
					compost: _p.validation.useCompost,
					payment: _p.validation.usePayment,
					type: _p.plant.seedType
				});
			}
		}
	}
}
