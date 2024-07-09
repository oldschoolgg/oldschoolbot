import type { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { BitField } from '../constants';
import { checkDegradeableItemCharges, degradeItem } from '../degradeableItems';
import { KourendKebosDiary, userhasDiaryTier } from '../diaries';
import { ashes } from '../skilling/skills/prayer';
import getOSItem from './getOSItem';

export async function ashSanctifierEffect(user: MUser, loot: Bank, duration: number, messages: string[]) {
	if (!user.bank.has('Ash sanctifier')) return;
	if (user.bitfield.includes(BitField.DisableAshSanctifier)) return;

	const [hasEliteDiary] = await userhasDiaryTier(user, KourendKebosDiary.elite);
	const ashXpModifider = hasEliteDiary ? 1 : 0.5;

	const startingAshSanctifierCharges = await checkDegradeableItemCharges({
		item: getOSItem('Ash sanctifier'),
		user
	});

	if (startingAshSanctifierCharges === 0) return;

	let chargesLeft = startingAshSanctifierCharges;
	let totalXP = 0;

	const ashesSanctified: { name: string; amount: number }[] = [];
	for (const ash of ashes) {
		const amount = loot.amount(ash.inputId);
		if (amount > 0 && chargesLeft >= amount) {
			totalXP += ash.xp * ashXpModifider * amount;
			ashesSanctified.push({ name: ash.name, amount });
			loot.remove(ash.inputId, amount);
			chargesLeft -= amount;
		} else if (amount > 0 && chargesLeft < amount) {
			totalXP += ash.xp * ashXpModifider * chargesLeft;
			ashesSanctified.push({ name: ash.name, amount: chargesLeft });
			loot.remove(ash.inputId, chargesLeft);
			chargesLeft = 0;
			break;
		}
	}

	if (startingAshSanctifierCharges - chargesLeft === 0) return;

	await degradeItem({
		item: getOSItem('Ash sanctifier'),
		chargesToDegrade: startingAshSanctifierCharges - chargesLeft,
		user
	});

	userStatsUpdate(
		user.id,
		{
			ash_sanctifier_prayer_xp: {
				increment: Math.floor(totalXP)
			}
		},
		{}
	);
	const xpStr = await user.addXP({
		skillName: SkillsEnum.Prayer,
		amount: totalXP,
		duration,
		minimal: true,
		source: 'AshSanctifier'
	});

	const ashString = ashesSanctified.map(ash => `${ash.amount}x ${ash.name}`).join(', ');
	messages.push(
		`${xpStr} Prayer XP from purifying ${ashString} using the Ash Sanctifier (${chargesLeft} charges left).`
	);
}
