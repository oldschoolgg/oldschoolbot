import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { divinationEnergies, memoryHarvestTypes } from '../../lib/bso/divination';
import { GLOBAL_BSO_XP_MULTIPLIER } from '../../lib/constants';
import { inventionBoosts } from '../../lib/invention/inventions';
import Agility from '../../lib/skilling/skills/agility';
import { calcPerHour, returnStringOrFile } from '../../lib/util/smallUtils';
import { calculateAgilityResult } from '../../tasks/minions/agilityActivity';
import { memoryHarvestResult } from '../../tasks/minions/bso/memoryHarvestActivity';
import { OSBMahojiCommand } from '../lib/util';

export const ratesCommand: OSBMahojiCommand = {
	name: 'rates',
	description: 'Check rates of various skills/activities.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'xphr',
			description: 'Check XP/hr rates.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'divination_memory_harvesting',
					description: 'Divination.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'agility',
					description: 'agility.',
					options: []
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{ xphr?: { divination_memory_harvesting?: {}; agility?: {} } }>) => {
		const user = await mUserFetch(userID);

		if (options.xphr?.divination_memory_harvesting) {
			let results = `${[
				'Type',
				'Method',
				'Boosts',
				'Pet Time (Hours)',
				'XP/Hr',
				'Memories/HR',
				'GMC/hr',
				'MC/hr',
				'EnergyLoot/hr',
				'EnergyCost/hr'
			].join('\t')}\n`;
			for (const energy of divinationEnergies) {
				for (const harvestMethod of memoryHarvestTypes) {
					for (const hasBoonAndWispBusterAndGuthixianBoost of [true, false]) {
						const res = memoryHarvestResult({
							duration: Time.Hour,
							energy,
							hasBoon: hasBoonAndWispBusterAndGuthixianBoost,
							harvestMethod: harvestMethod.id,
							divinationLevel: user.skillLevel('divination'),
							hasGuthixianBoost: hasBoonAndWispBusterAndGuthixianBoost,
							hasDivineHand: hasBoonAndWispBusterAndGuthixianBoost,
							hasWispBuster: hasBoonAndWispBusterAndGuthixianBoost
						});

						results += [
							energy.type,
							harvestMethod.name,
							hasBoonAndWispBusterAndGuthixianBoost ? 'Has Boon+Wispbuster+GuthixianBoost' : 'No boosts',
							res.avgPetTime / Time.Hour,
							res.totalDivinationXP * GLOBAL_BSO_XP_MULTIPLIER,
							calcPerHour(res.totalMemoriesHarvested, Time.Hour),
							calcPerHour(res.loot.amount('Clue scroll (grandmaster)'), Time.Hour),
							calcPerHour(res.loot.amount('Clue scroll (master)'), Time.Hour),
							calcPerHour(res.loot.amount(energy.item.id), Time.Hour),
							calcPerHour(res.cost.amount(energy.item.id), Time.Hour)
						].join('\t');
						results += '\n';
					}
				}
			}

			return returnStringOrFile(results);
		}

		if (options.xphr?.agility) {
			let results = `${['Course', 'XP/Hr', 'Marks/hr', 'Agility Level', 'Silver Hawk Boots'].join('\t')}\n`;
			for (const course of Agility.Courses) {
				for (const hasSilverHawks of [true, false]) {
					let timePerLap = course.lapTime * Time.Second;
					if (hasSilverHawks) {
						timePerLap = Math.floor(timePerLap / inventionBoosts.silverHawks.agilityBoostMultiplier);
					}
					const quantity = Math.floor(Time.Hour / timePerLap);
					const duration = quantity * timePerLap;
					let agilityLevel = 120;
					const result = calculateAgilityResult({
						quantity,
						course,
						agilityLevel,
						duration,
						hasDiaryBonus: true,
						usingHarry: user.usingPet('Harry')
					});
					const xpHr = calcPerHour(result.xpReceived * GLOBAL_BSO_XP_MULTIPLIER, duration);
					results += [
						course.name,
						Math.round(xpHr),
						calcPerHour(result.loot.amount('Mark of grace'), duration).toFixed(1),
						agilityLevel,
						hasSilverHawks ? 'Yes' : 'No'
					].join('\t');
					results += '\n';
				}
			}
			return returnStringOrFile(results, true);
		}
		return 'No option selected.';
	}
};
