import { activity_type_enum } from '@prisma/client';
import { AttachmentBuilder, ButtonBuilder, MessageCollector } from 'discord.js';
import { percentChance, randInt, Time } from 'e';
import { Bank } from 'oldschooljs';

import { alching } from '../../mahoji/commands/laps';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { handleTriggerShootingStar } from '../../mahoji/lib/abstracted_commands/shootingStarsCommand';
import { updateGPTrackSetting, userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';
import { MysteryBoxes } from '../bsoOpenables';
import { ClueTiers } from '../clues/clueTiers';
import { BitField, COINS_ID, Emoji, PerkTier } from '../constants';
import { handleGrowablePetGrowth } from '../growablePets';
import { handlePassiveImplings } from '../implings';
import { inventionBoosts, InventionID, inventionItemBoost } from '../invention/inventions';
import { triggerRandomEvent } from '../randomEvents';
import { RuneTable, WilvusTable, WoodTable } from '../simulation/seedTable';
import { DougTable, PekyTable } from '../simulation/sharedTables';
import { SkillsEnum } from '../skilling/types';
import { getUsersCurrentSlayerInfo } from '../slayer/slayerUtil';
import { ActivityTaskOptions } from '../types/minions';
import { channelIsSendable, isGroupActivity, itemID, makeComponents, roll, toKMB } from '../util';
import {
	makeAutoContractButton,
	makeBirdHouseTripButton,
	makeDoClueButton,
	makeNewSlayerTaskButton,
	makeOpenCasketButton,
	makeOpenSeedPackButton,
	makeRepeatTripButton
} from './globalInteractions';
import { updateBankSetting } from './updateBankSetting';
import { sendToChannelID } from './webhook';

export const collectors = new Map<string, MessageCollector>();

const activitiesToTrackAsPVMGPSource: activity_type_enum[] = [
	'GroupMonsterKilling',
	'MonsterKilling',
	'Raids',
	'ClueCompletion'
];

export interface TripFinishEffect {
	name: string;
	fn: (options: { data: ActivityTaskOptions; user: MUser; loot: Bank | null; messages: string[] }) => unknown;
}

async function christmasEffect(messages: string[], data: ActivityTaskOptions) {
	const isMass = isGroupActivity(data);
	const users = isMass ? data.users : [data.userID];
	let soloMsg: string | null = null;
	let usersWhoGotSnowballs = 0;
	await Promise.all(
		users.map(async uID => {
			const user = await mUserFetch(uID);
			const loot = new Bank();
			if (!user.bank.has('Christmas snowglobe') && roll(2) && user.cl.amount('Christmas snowglobe') < 3) {
				loot.add('Christmas snowglobe');
				await user.addItemsToBank({ items: loot, collectionLog: true });
				messages.push(`${user.rawUsername} received ${loot}!`);
				return;
			}

			const minutes = Math.floor(data.duration / Time.Minute);
			if (minutes > 1 && user.owns('Christmas snowglobe')) {
				for (let i = 0; i < minutes; i++) {
					if (percentChance(80)) {
						loot.add('Snowball');
					}
				}

				await user.addItemsToBank({ items: loot, collectionLog: true });
				usersWhoGotSnowballs++;
				soloMsg = `<:santaHat:785874868905181195> Your snowglobe collects you ${loot}...`;
			}
		})
	);
	if (users.length === 1 && soloMsg !== null) messages.push(soloMsg);
	if (usersWhoGotSnowballs > 0 && users.length !== 1) {
		messages.push(`${usersWhoGotSnowballs} users got snowballs in this trip!`);
	}
}

const tripFinishEffects: TripFinishEffect[] = [
	{
		name: 'Track GP Analytics',
		fn: ({ data, loot }) => {
			if (loot && activitiesToTrackAsPVMGPSource.includes(data.type)) {
				const GP = loot.amount(COINS_ID);
				if (typeof GP === 'number') {
					updateGPTrackSetting('gp_pvm', GP);
				}
			}
		}
	},
	{
		name: 'Implings',
		fn: async ({ data, messages, user }) => {
			const imp = await handlePassiveImplings(user, data);
			if (imp && imp.bank.length > 0) {
				const many = imp.bank.length > 1;
				messages.push(`Caught ${many ? 'some' : 'an'} impling${many ? 's' : ''}, you received: ${imp.bank}`);
				userStatsBankUpdate(user.id, 'passive_implings_bank', imp.bank);
				await transactItems({ userID: user.id, itemsToAdd: imp.bank, collectionLog: true });
			}
		}
	},
	{
		name: 'Growable Pets',
		fn: async ({ data, messages, user }) => {
			await handleGrowablePetGrowth(user, data, messages);
		}
	},
	{
		name: 'Random Events',
		fn: async ({ data, messages, user }) => {
			await triggerRandomEvent(user, data.duration, messages);
		}
	},
	{
		name: 'Loot Doubling',
		fn: async ({ data, messages, user, loot }) => {
			const cantBeDoubled = ['GroupMonsterKilling', 'KingGoldemar', 'Ignecarus', 'Inferno', 'Alching', 'Agility'];
			if (
				loot &&
				!data.cantBeDoubled &&
				!cantBeDoubled.includes(data.type) &&
				data.duration > Time.Minute * 20 &&
				roll(user.usingPet('Mr. E') ? 12 : 15)
			) {
				const otherLoot = new Bank().add(MysteryBoxes.roll());
				const bonusLoot = new Bank().add(loot).add(otherLoot);
				messages.push(`<:mysterybox:680783258488799277> **You received 2x loot and ${otherLoot}.**`);
				userStatsBankUpdate(user.id, 'doubled_loot_bank', bonusLoot);
				await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
				updateBankSetting('trip_doubling_loot', bonusLoot);
			}
		}
	},
	{
		name: 'Custom Pet Perk',
		fn: async ({ data, messages, user }) => {
			const pet = user.user.minion_equippedPet;
			const minutes = Math.floor(data.duration / Time.Minute);
			if (minutes < 5) return;
			let bonusLoot = new Bank();
			switch (pet) {
				case itemID('Peky'): {
					for (let i = 0; i < minutes; i++) {
						if (roll(10)) {
							bonusLoot.add(PekyTable.roll());
						}
					}
					userStatsBankUpdate(user.id, 'peky_loot_bank', bonusLoot);
					messages.push(
						`<:peky:787028037031559168> Peky flew off and got you some seeds during this trip: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Obis'): {
					let rolls = minutes / 3;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(RuneTable.roll());
					}
					userStatsBankUpdate(user.id, 'obis_loot_bank', bonusLoot);
					messages.push(
						`<:obis:787028036792614974> Obis did some runecrafting during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Brock'): {
					let rolls = minutes / 3;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(WoodTable.roll());
					}
					userStatsBankUpdate(user.id, 'brock_loot_bank', bonusLoot);
					messages.push(
						`<:brock:787310793183854594> Brock did some woodcutting during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Wilvus'): {
					let rolls = minutes / 6;
					for (let i = 0; i < rolls; i++) {
						bonusLoot.add(WilvusTable.roll());
					}
					userStatsBankUpdate(user.id, 'wilvus_loot_bank', bonusLoot);
					messages.push(
						`<:wilvus:787320791011164201> Wilvus did some pickpocketing during this trip and got you: ${bonusLoot}.`
					);
					break;
				}
				case itemID('Smokey'): {
					for (let i = 0; i < minutes; i++) {
						if (roll(450)) {
							bonusLoot.add(MysteryBoxes.roll());
						}
					}
					userStatsBankUpdate(user.id, 'smokey_loot_bank', bonusLoot);
					if (bonusLoot.length > 0) {
						messages.push(
							`<:smokey:787333617037869139> Smokey did some walking around while you were on your trip and found you ${bonusLoot}.`
						);
					}
					break;
				}
				case itemID('Doug'): {
					for (let i = 0; i < minutes / 2; i++) {
						bonusLoot.add(DougTable.roll());
					}
					userStatsBankUpdate(user.id, 'doug_loot_bank', bonusLoot);
					messages.push(`Doug did some mining while you were on your trip and got you: ${bonusLoot}.`);
					break;
				}
				case itemID('Harry'): {
					for (let i = 0; i < minutes; i++) {
						bonusLoot.add('Banana', randInt(1, 3));
					}
					userStatsBankUpdate(user.id, 'harry_loot_bank', bonusLoot);
					messages.push(`<:harry:749945071104819292>: ${bonusLoot}.`);
					break;
				}
				default: {
				}
			}
			await user.addItemsToBank({ items: bonusLoot, collectionLog: true });
		}
	},
	{
		name: 'Voidling',
		fn: async ({ data, messages, user }) => {
			if (!user.allItemsOwned().has('Voidling')) return;
			const voidlingEquipped = user.usingPet('Voidling');
			const alchResult = alching({
				user,
				tripLength: voidlingEquipped
					? data.duration * (user.hasEquipped('Magic master cape') ? 3 : 1)
					: data.duration / (user.hasEquipped('Magic master cape') ? 1 : randInt(6, 7)),
				isUsingVoidling: true
			});
			if (alchResult !== null) {
				if (!user.owns(alchResult.bankToRemove)) {
					messages.push(
						`Your Voidling couldn't do any alching because you don't own ${alchResult.bankToRemove}.`
					);
				}
				await user.addItemsToBank({ items: alchResult.bankToAdd });
				await user.removeItemsFromBank(alchResult.bankToRemove);

				updateBankSetting('magic_cost_bank', alchResult.bankToRemove);

				updateGPTrackSetting('gp_alch', alchResult.bankToAdd.amount('Coins'));
				messages.push(
					`Your Voidling alched ${alchResult.maxCasts}x ${alchResult.itemToAlch.name}. Removed ${
						alchResult.bankToRemove
					} from your bank and added ${alchResult.bankToAdd}. ${
						!voidlingEquipped && !user.hasEquipped('Magic master cape')
							? "As you left your Voidling in the bank, it didn't manage to alch at its full potential."
							: ''
					}${
						user.hasEquipped('Magic master cape')
							? 'Voidling was buffed by your Magic Master cape, and is alching much faster!'
							: ''
					}`
				);
			} else if (user.favAlchs(Time.Minute * 30).length !== 0) {
				messages.push(
					"Your Voidling didn't alch anything because you either don't have any nature runes or fire runes."
				);
			}
		}
	},
	{
		name: 'Invention Effects',
		fn: async ({ data, messages, user }) => {
			if (user.hasEquipped('Silverhawk boots') && data.duration > Time.Minute) {
				const costRes = await inventionItemBoost({
					user,
					inventionID: InventionID.SilverHawkBoots,
					duration: data.duration
				});
				if (costRes.success) {
					const xpToReceive = inventionBoosts.silverHawks.passiveXPCalc(
						data.duration,
						user.skillLevel(SkillsEnum.Agility)
					);
					userStatsUpdate(user.id, () => ({
						silverhawk_boots_passive_xp: {
							increment: xpToReceive
						}
					}));
					await user.addXP({
						skillName: SkillsEnum.Agility,
						amount: xpToReceive,
						multiplier: false,
						duration: data.duration
					});
					messages.push(`+${toKMB(xpToReceive)} Agility XP from Silverhawk boots (${costRes.messages})`);
				}
			}
		}
	}
];

export async function handleTripFinish(
	user: MUser,
	channelID: string,
	message: string,
	attachment: AttachmentBuilder | Buffer | undefined,
	data: ActivityTaskOptions,
	loot: Bank | null,
	_messages?: string[]
) {
	const perkTier = user.perkTier();
	const messages: string[] = [];
	for (const effect of tripFinishEffects) await effect.fn({ data, user, loot, messages });
	await christmasEffect(messages, data);

	const clueReceived = loot ? ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0) : [];

	if (_messages) messages.push(..._messages);
	if (messages.length > 0) {
		message += `\n**Messages:** ${messages.join(', ')}`;
	}

	if (clueReceived.length > 0 && perkTier < PerkTier.Two) {
		clueReceived.map(clue => (message += `\n${Emoji.Casket} **You got a ${clue.name} clue scroll** in your loot.`));
	}

	const existingCollector = collectors.get(user.id);

	if (existingCollector) {
		existingCollector.stop();
		collectors.delete(user.id);
	}

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return;

	const components: ButtonBuilder[] = [];
	components.push(makeRepeatTripButton());
	const casketReceived = loot ? ClueTiers.find(i => loot?.has(i.id)) : undefined;
	if (casketReceived) components.push(makeOpenCasketButton(casketReceived));
	if (perkTier > PerkTier.One) {
		if (clueReceived.length > 0) clueReceived.map(clue => components.push(makeDoClueButton(clue)));
		const birdHousedetails = await calculateBirdhouseDetails(user.id);
		if (birdHousedetails.isReady && !user.bitfield.includes(BitField.DisableBirdhouseRunButton))
			components.push(makeBirdHouseTripButton());
		const { currentTask } = await getUsersCurrentSlayerInfo(user.id);
		if ((currentTask === null || currentTask.quantity_remaining <= 0) && data.type === 'MonsterKilling') {
			components.push(makeNewSlayerTaskButton());
		}
		if (loot?.has('Seed pack')) {
			components.push(makeAutoContractButton());
			components.push(makeOpenSeedPackButton());
		}
	}
	handleTriggerShootingStar(user, data, components);

	sendToChannelID(channelID, {
		content: message,
		image: attachment,
		components: components.length > 0 ? makeComponents(components) : undefined
	});
}
