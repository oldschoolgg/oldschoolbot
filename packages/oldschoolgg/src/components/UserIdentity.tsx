import { useEffect, useState } from 'react';

import { api } from '@/lib/api.js';
import type { SUserIdentity } from '../../../robochimp/src/http/api-types.js';

const resolved = new Map<string, SUserIdentity>();
const inFlight = new Map<string, Promise<SUserIdentity>>();

function fetchUserIdentityCached(userId: string): Promise<SUserIdentity> {
	const hit = resolved.get(userId);
	if (hit) return Promise.resolve(hit);

	const pending = inFlight.get(userId);
	if (pending) return pending;

	const p = api.staff
		.fetchUserIdentity(userId)
		.then(v => {
			resolved.set(userId, v);
			inFlight.delete(userId);
			return v;
		})
		.catch(e => {
			inFlight.delete(userId);
			throw e;
		});

	inFlight.set(userId, p);
	return p;
}

export function UserIndentity({ userId }: { userId: string }) {
	const [identity, setIdentity] = useState<SUserIdentity | null>(null);
	useEffect(() => {
		fetchUserIdentityCached(userId).then(setIdentity);
	}, []);

	const avatar = identity?.avatar
		? `https://cdn.discordapp.com/avatars/${identity.user_id}/${identity.avatar}.webp?size=100`
		: `https://cdn.oldschool.gg/website/discord-avatar-xxs.webp`;
	const username = identity?.username ?? userId;

	return (
		<div
			title="Copy User ID"
			className="flex flex-row gap-2 items-center bg-black/80 w-max pr-2 py-0 rounded-full cursor-pointer select-none hover:bg-black/40"
			onClick={() => {
				navigator.clipboard.writeText(userId);
			}}
		>
			{<img className="rounded-full h-6 w-6" src={avatar} />}
			<span className="text-sm py-1">{username}</span>
		</div>
	);
}
