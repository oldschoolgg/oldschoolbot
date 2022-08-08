import { Time } from 'e';
import { KlasaUser } from 'klasa';

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
): Promise<number> {
	const drainResistance = 60 + prayerBonus * 2;
	let totalDrainEffect = 0;
	const selectedPrayers = user.settings.get(UserSettings.SelectedPrayers);
	for (const prayer of selectedPrayers) {
		const foundPrayer = Prayer.Prayers.find(_prayer => _prayer.name.toLowerCase() === prayer.toLowerCase());
		if (!foundPrayer) continue;
		totalDrainEffect += foundPrayer.drainEffect;
	}

	const PrayerPointsEverySecond = 1 / ((drainResistance / totalDrainEffect) * 0.6);
	let prayerPointsDrainedPerBankCycle = 0;

	if (
		((PrayerPointsEverySecond * averageKillSpeed) / Time.Second) * monster.killsPerBankTrip! >
		user.skillLevel(SkillsEnum.Prayer)
	) {
		prayerPointsDrainedPerBankCycle =
			(PrayerPointsEverySecond * averageKillSpeed) / Time.Second - user.skillLevel(SkillsEnum.Prayer);
	}
	const bankCycles = quantity / monster.killsPerBankTrip!;
	const totalPrayerPoints = bankCycles * prayerPointsDrainedPerBankCycle;

	const prayerPointsPerDose = Number(user.skillLevel(SkillsEnum.Prayer)) / 4 + 7;
	//Total Doses Used
	return Math.ceil(totalPrayerPoints / prayerPointsPerDose);
}
