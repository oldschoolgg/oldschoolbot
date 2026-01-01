import { useEffect, useState } from 'react';

import { api, type MinionInfo } from '@/lib/api.js';

export function MinionSelector({ onSelect }: { onSelect?: (bot: 'osb' | 'bso', userId: string) => void }) {
	const [minions, setMinions] = useState<MinionInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api.minion
			.list()
			.then(setMinions)
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <div className="p-4">Loading your minions...</div>;
	}

	if (minions.length === 0) {
		return <div className="p-4">No minions found.</div>;
	}

	const handleMinionClick = (minion: MinionInfo) => {
		const url = `/account/minion/${minion.bot}/${minion.user_id}`;
		if (onSelect) {
			onSelect(minion.bot, minion.user_id);
		}
		window.location.href = url;
	};

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold mb-4">Select a Minion</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{minions.map(minion => {
					const avatar = minion.avatar
						? `https://cdn.discordapp.com/avatars/${minion.user_id}/${minion.avatar}.webp?size=128`
						: `https://cdn.oldschool.gg/website/discord-avatar-xxs.webp`;
					const botLabel = minion.bot === 'osb' ? 'Old School Bot' : 'BSO';
					const ironmanLabel = minion.is_ironman ? ' (Ironman)' : '';

					return (
						<button
							key={`${minion.bot}-${minion.user_id}`}
							onClick={() => handleMinionClick(minion)}
							className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-800 transition-colors text-left"
						>
							<img src={avatar} alt="" className="w-16 h-16 rounded-full" />
							<div>
								<div className="font-semibold">{minion.username || minion.user_id}</div>
								<div className="text-sm text-gray-400">
									{botLabel}
									{ironmanLabel}
								</div>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
