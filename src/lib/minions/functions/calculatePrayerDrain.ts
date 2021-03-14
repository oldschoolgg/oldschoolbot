import { KlasaUser } from 'klasa';
import { bankHasItem, itemID } from 'oldschooljs/dist/util';

import { Time } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import Prayer from '../../skilling/skills/prayer';
import { SkillsEnum } from '../../skilling/types';
import { KillableMonster } from './../types';

export default async function calculatePrayerDrain(
	user: KlasaUser,
	monster: KillableMonster,
	quantity: number,
	prayerBonus: number,
	averageKillSpeed: number
) {
	const drainResistance = 60 + prayerBonus * 2;
	let totalDrainEffect = 0;
	const selectedPrayers = user.settings.get(UserSettings.SelectedPrayers);
	for (const prayer of selectedPrayers) {
		const foundPrayer = Prayer.Prayers.find(
			_prayer => _prayer.name.toLowerCase() === prayer.toLowerCase()
		);
		if (!foundPrayer) continue;
		totalDrainEffect += foundPrayer.drainEffect;
	}

	const PrayerPointsEverySecond = 1 / ((drainResistance / totalDrainEffect) * 0.6);
	let prayerPointsDrainedPerBankCycle = 0;

	if (
		((PrayerPointsEverySecond * averageKillSpeed) / Time.Second) * monster.killsPerBankTrip >
		user.skillLevel(SkillsEnum.Prayer)
	) {
		prayerPointsDrainedPerBankCycle =
			(PrayerPointsEverySecond * averageKillSpeed) / Time.Second -
			user.skillLevel(SkillsEnum.Prayer);
	}
	const bankCycles = quantity / monster.killsPerBankTrip;
	const totalPrayerPoints = bankCycles * prayerPointsDrainedPerBankCycle;

	const prayerPointsPerDose = Number(user.skillLevel(SkillsEnum.Prayer)) / 4 + 7;

	const totalDosesUsed = Math.ceil(totalPrayerPoints / prayerPointsPerDose);

	if (
		!bankHasItem(
			user.settings.get(UserSettings.Bank),
			itemID('Prayer potion(4)'),
			Math.floor(totalDosesUsed / 4) + 1
		) &&
		totalDosesUsed > 0
	) {
		throw `You don't have enough Prayer potion(4) in the bank.`;
	}
	if (totalDosesUsed > 0) {
		await user.removeItemFromBank(
			itemID('Prayer potion(4)'),
			Math.floor(totalDosesUsed / 4) + 1
		);

		const leftOverDoses = 4 - (totalDosesUsed % 4);
		if (leftOverDoses !== 4) {
			await user.addItemsToBank({ [itemID(`Prayer potion(${leftOverDoses})`)]: 1 }, true);
		}
	}
}
