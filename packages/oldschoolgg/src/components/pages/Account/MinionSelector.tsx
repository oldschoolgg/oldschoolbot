import { useEffect, useState } from 'react';

import { api, globalState, type SimpleMinionInfo, type UsersMinionsResponse } from '@/lib/api.js';
import type { SUserIdentity } from '../../../../../robochimp/src/http/api-types.js';

type MinionWithIdentity = SimpleMinionInfo & {
	user_id: string;
	username: string | null;
	avatar: string | null;
};

export function MinionSelector({ onSelect }: { onSelect?: (bot: 'osb' | 'bso', userId: string) => void }) {
	const [minions, setMinions] = useState<MinionWithIdentity[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const state = globalState.getState();
		if (!state.user) {
			setLoading(false);
			return;
		}

		api.minion
			.listForUser(state.user.id)
			.then(async (response: UsersMinionsResponse) => {
				const allMinions: MinionWithIdentity[] = [];

				for (const account of response.users) {
					let identity: SUserIdentity | null = null;
					try {
						identity = await api.staff.fetchUserIdentity(account.user_id);
					} catch (e) {
						console.error('Failed to fetch identity for', account.user_id, e);
					}

					for (const minion of account.minions) {
						allMinions.push({
							...minion,
							user_id: account.user_id,
							username: identity?.username || null,
							avatar: identity?.avatar || null
						});
					}
				}

				setMinions(allMinions);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <div className="p-4 text-center">Loading your minions...</div>;
	}

	if (minions.length === 0) {
		return <div className="p-4 text-center">No minions found.</div>;
	}

	const handleMinionClick = (minion: MinionWithIdentity) => {
		const url = `/account/minion?bot=${minion.bot}&id=${minion.user_id}`;
		if (onSelect) {
			onSelect(minion.bot, minion.user_id);
		}
		window.location.href = url;
	};

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold mb-4 text-center">Select a Minion</h2>
			<div className="flex flex-row gap-4 flex-wrap items-center justify-center">
				{minions.map(minion => {
					const botLabel = minion.bot === 'osb' ? 'Old School Bot' : 'BSO';
					const ironmanLabel = minion.is_ironman ? ' (Ironman)' : '';

					return (
						<button
							key={`${minion.bot}-${minion.user_id}`}
							onClick={() => handleMinionClick(minion)}
							className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-900/50 border-gray-800 hover:bg-gray-800 transition-colors text-left cursor-pointer w-full max-w-md text-center"
						>
							<div className="font-semibold">{minion.username || minion.user_id}</div>
							<div className="text-sm text-gray-400">
								{ironmanLabel}
								Total Level: {minion.total_level}
							</div>

							<div className="flex flex-row items-center">
								<img
									src={`https://cdn.oldschool.gg/website/${minion.bot}-avatar-200.webp`}
									alt=""
									className="w-5 h-5 rounded-full mr-1"
								/>
								<p className="text-xs text-gray-400">{botLabel}</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
