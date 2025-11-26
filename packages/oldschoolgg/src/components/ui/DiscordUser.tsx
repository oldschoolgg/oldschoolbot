import { useEffect, useState } from 'react';

import { type DiscordUser, rawApi } from '../../lib/rawApi.ts';

interface DiscordUserCardProps {
	userId: string;
}

export const DiscordUserCard: React.FC<DiscordUserCardProps> = ({ userId }) => {
	const [user, setUser] = useState<DiscordUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await rawApi.discordUser(userId);
				if ('error' in response || !response.id) {
					throw new Error('Failed to fetch user data');
				}
				setUser(response);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [userId]);

	if (loading) {
		return (
			<div className="bg-[#323339] rounded-lg p-4 w-72 h-32 animate-pulse">
				<div className="flex items-center space-x-4">
					<div className="bg-gray-700 rounded-full w-16 h-16" />
					<div className="flex-1">
						<div className="bg-gray-700 h-4 w-36 rounded mb-2" />
						<div className="bg-gray-700 h-3 w-24 rounded" />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-900 rounded-lg p-4 w-72">
				<p className="text-red-200 text-sm">Error: {error}</p>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="bg-[#323339] rounded-lg px-4 min-w-48 py-2 w-max shadow-lg hover:shadow-xl transition-shadow duration-200 my-2">
			<div className="flex items-center space-x-4 justify-start">
				<img src={user.displayAvatarURL} alt={`${user.username}'s avatar`} className="w-8 h-8 rounded-full" />
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h2 className="text-white font-bold text-xl truncate">{user.globalName || user.username}</h2>
					</div>
					<p className="text-gray-300 text-xs font-bold truncate">@{user.username}</p>
				</div>
			</div>
		</div>
	);
};
