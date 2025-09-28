import { Bank } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { cleanDirtyArrows, preRollTable, rummageOfferings } from '@/lib/minions/data/valeTotems.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { ValeTotemsActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { roll } from '@/lib/util/rng.js';
import { userStatsUpdate } from '@/mahoji/mahojiSettings.js';

export const valeTotemsTask: MinionTask = {
    type: 'ValeTotems',
    async run(data: ValeTotemsActivityTaskOptions) {
        const { channelID, quantity, userID, duration, offerings, fletchXp } = data;
        const TOTEMS_PER_LAP = 8;

        const user = await mUserFetch(userID);
		await user.incrementMinigameScore('vale_totems', quantity * TOTEMS_PER_LAP);

        const userStats = await user.fetchStats({ vale_offerings: true, vale_research_points: true });
        const totalOfferings = offerings + userStats.vale_offerings;
        const rewards = Math.floor(totalOfferings / 100);
        const remainder = totalOfferings % 100;

        await userStatsUpdate(
            user.id,
            {
                vale_research_points: {
                    increment: rewards
                },
                vale_offerings: remainder
            },
            {}
        );

        const fletchingLvl = user.skillLevel('fletching');
        
        const loot = new Bank();
        for (let i = 0; i < rewards; i++) {
            if (roll(100)) {
                loot.add(preRollTable.roll());
                continue;
            }
            loot.add(rummageOfferings(fletchingLvl));
        }

        // Dirty arrowtips and it's logic
        const DIRTY_ARROWTIPS_ID = 31047;
        const hasDirtyArrowtips = loot.has(DIRTY_ARROWTIPS_ID);
        let dirtyArrowTipCount;

        if (hasDirtyArrowtips) {
            dirtyArrowTipCount = loot.amount(DIRTY_ARROWTIPS_ID);
            loot.remove(DIRTY_ARROWTIPS_ID);
            for (let i = 0; i < dirtyArrowTipCount; i++) {
                loot.add(cleanDirtyArrows(fletchingLvl));
            }
        }
        
        const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

        const constructionXp = user.skillLevel('construction') * TOTEMS_PER_LAP * quantity;

        const [fletchingXpRes, constructionXpRes] = await Promise.all([
            user.addXP({
                skillName: SkillsEnum.Fletching,
                amount: fletchXp,
                duration
            }),
            user.addXP({
                skillName: SkillsEnum.Construction,
                amount: constructionXp,
                duration
            })
        ])

        await trackLoot({
            totalLoot: itemsAdded,
            id: 'vale_totems',
            type: 'Minigame',
            changeType: 'loot',
            duration: data.duration,
            kc: quantity,
            users: [
                {
                    id: user.id,
                    duration,
                    loot: itemsAdded
                }
            ]
        });

        let str = `${user}, ${user.minionName} finished doing the Vale Totems ${quantity}x laps, and constructed ${
            quantity * TOTEMS_PER_LAP
        } totems. ${user.minionName} gained ${rewards} Vale Research points (total ${userStats.vale_research_points + rewards}). ${
            hasDirtyArrowtips ? 'While rummaging through the offerings,' + user.minionName + ' discovered and cleaned ' + dirtyArrowTipCount + 'x Dirty arrowtips.' : ''
        } ${
            remainder > 0 ? remainder + 'x vale offerings remain to be rummaged through, and they will count toward the next trip.' : ''
        } \n\n${fletchingXpRes}\n${constructionXpRes}`;

        const image = await makeBankImage({
            bank: itemsAdded,
            title: `Loot From ${quantity}x laps of Vale Totems`,
            user,
            previousCL
        });

        handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
    }
};