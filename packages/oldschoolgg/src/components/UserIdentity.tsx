import { useEffect, useState } from 'react';

import { api } from '@/lib/api.js';
import type { SUserIdentity } from '../../../robochimp/src/http/api-types.js';

export function UserIndentity({ userId }: { userId: string }) {
	const [identity, setIdentity] = useState<SUserIdentity | null>(null);
	useEffect(() => {
		api.staff.fetchUserIdentity(userId).then(setIdentity);
	}, []);

	const avatar = identity?.avatar
		? `https://cdn.discordapp.com/avatars/${identity.user_id}/${identity.avatar}.webp?size=100`
		: `https://cdn.oldschool.gg/website/discord-avatar-xxs.webp`;
	const username = identity?.username ?? userId;
	return (
		<div className="flex flex-row gap-2 items-center bg-black/80 w-max pr-2 py-0 rounded-full   ">
			{<img className="rounded-full h-6 w-6" src={avatar} />}
			<span className="text-sm py-1">{username}</span>
		</div>
	);
}
