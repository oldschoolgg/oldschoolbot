import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { defaultImpTable, implings } from '../../../lib/implings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { minionName } from '../../../lib/util/minionUtils';

export async function puroPuroStartCommand(user: KlasaUser, channelID: bigint, name: string) {
	let timePerGame = Time.Minute * 10;
	let maxTripLength = calcMaxTripLength(user, 'PuroPuro');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;
	const hunterLevel = user.skillLevel(SkillsEnum.Hunter);
	const minutes = Math.floor(duration / Time.Minute);

	if (hunterLevel < 17) {
		return 'You need atleast level 17 hunter to partake in Puro-Puro.';
	}

	const bank = new Bank();
	const missed = new Bank();

	const dragonImpTable = new LootTable().oneIn(100, 'Dragon impling jar', 1);
	const eclecticImpTable = new LootTable().oneIn(100, 'Dragon impling jar', 1);
	const impTable = new LootTable().oneIn(1, defaultImpTable);

	if ((name = 'Dragon')) {
		if (hunterLevel < 83) {
			return 'You need level 83 Hunter to hunt Dragon Implings.';
		}
		for (let i = 0; i < minutes; i++) {
			const loot = dragonImpTable.roll();
			if (loot.length === 0) continue;
			bank.add(loot);
		}
	}
	if ((name = 'Eclectic')) {
		if (hunterLevel < 50) {
			return 'You need level 50 Hunter to hunt Eclectic Implings.';
		}
		for (let i = 0; i < minutes; i++) {
			const loot = eclecticImpTable.roll();
			if (loot.length === 0) continue;
			bank.add(loot);
		}
	}

	for (let i = 0; i < minutes; i++) {
		const loot = impTable.roll();
		if (loot.length === 0) continue;
		const implingReceived = implings[loot.items()[0][0].id]!;
		if (hunterLevel < implingReceived.level) missed.add(loot);
		else bank.add(loot);
	}

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'PuroPuro',
		channelID: channelID.toString(),
		minigameID: 'puro_puro'
	});

	return `${minionName(user)} is now hunting implings in Puro-Puro! It will take ${formatDuration(
		duration
	)} to finish.`;
}
