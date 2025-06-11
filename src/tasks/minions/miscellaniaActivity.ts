import { mahojiUserSettingsUpdate } from "../../lib/MUser";
import { handleTripFinish } from "../../lib/util/handleTripFinish";
import type { MiscellaniaData } from "../../mahoji/lib/abstracted_commands/miscellaniaCommand";

export const miscellaniaTask: MinionTask = {
    type: 'Miscellania',
    async run(data: ActivityTaskOptionsWithNoChanges) {
        const { userID, channelID } = data;
        const user = await mUserFetch(userID);

        const state: MiscellaniaData = (user.user.minion_miscellania as MiscellaniaData | null) ?? defaultData();
        state.approval = 100;
        await mahojiUserSettingsUpdate(user.id, { minion_miscellania: state as any });

        handleTripFinish(
            user,
            channelID,
            `${user}, ${user.minionName} finished restoring your approval to 100%.`,
            undefined,
            data,
            null
        );
    }
};